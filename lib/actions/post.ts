"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteFilesFromStorage,
  receiptsMatchUrls,
  rollbackNewUploads,
  validateUploadReceipts,
} from "@/lib/uploadthing-server";
import {
  collectMediaUrls,
  deriveExcerpt,
  generatePostSlug,
  isPostLive,
  isScheduleDue,
  resolvePublicationDate,
  snapshotFromInput,
} from "@/lib/posts/domain";
import {
  assertPublishable,
  parseAndSanitizePostInput,
} from "@/lib/posts/validation";
import { sanitizeRichText } from "@/lib/posts/sanitize";
import { canPerformPostAction, revisionIdsToPrune, shouldBackfillLegacyVersion } from "@/lib/posts/policy";
import type {
  ActionResult,
  AdminPostListItem,
  PostEditorData,
  PostEditorInput,
  PostSnapshot,
  PublicPost,
} from "@/lib/posts/types";
import {
  PostActivityType,
  PostStatus,
  Prisma,
  Role,
} from "@/app/generated/prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { randomUUID } from "node:crypto";

type EditorActor = { id: string; name: string; role: Extract<Role, "ADMIN" | "SUPER_ADMIN"> };

const REVISION_LIMIT = 20;

function fail<T>(error: string, code: Extract<ActionResult<T>, { success: false }>["code"]): ActionResult<T> {
  return { success: false, error, code };
}

async function requireEditor(): Promise<EditorActor | null> {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user?.id || (role !== Role.ADMIN && role !== Role.SUPER_ADMIN)) return null;
  return {
    id: session.user.id,
    name: session.user.name?.trim() || session.user.email?.trim() || "Redaksi PCNU",
    role,
  };
}

function isSuperAdmin(actor: EditorActor) {
  return actor.role === Role.SUPER_ADMIN;
}

function jsonSnapshot(snapshot: PostSnapshot): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(snapshot)) as Prisma.InputJsonValue;
}

function parseSnapshot(value: Prisma.JsonValue): PostSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const snapshot = value as unknown as PostSnapshot;
  if (!snapshot.title || !snapshot.slug || !Array.isArray(snapshot.blocks)) return null;
  return {
    ...snapshot,
    blocks: snapshot.blocks.map((block) => block.type === "text" ? { ...block, content: sanitizeRichText(block.content) } : block),
  };
}

function postFields(input: PostEditorInput, slug: string, actor: EditorActor) {
  return {
    title: input.title.trim(),
    slug,
    excerpt: input.excerpt?.trim() || deriveExcerpt(input.blocks) || null,
    category: input.category,
    tags: input.tags,
    thumbnail: input.thumbnail?.trim() || input.blocks.find((block) => block.type === "image" && block.url)?.url || null,
    blocks: input.blocks.map((block) => ({
      id: block.id,
      type: block.type,
      content: block.content,
      url: block.url || null,
      title: block.title || null,
      caption: block.caption || null,
      altText: block.altText || null,
      isLocked: block.isLocked ?? false,
    })),
    sourceTitle: input.sourceTitle?.trim() || null,
    sourceUrl: input.sourceUrl?.trim() || null,
    seoTitle: input.seoTitle?.trim() || null,
    seoDescription: input.seoDescription?.trim() || null,
    authorName: input.authorName.trim() || actor.name,
    lastEditedById: actor.id,
    lastEditedByName: actor.name,
  };
}

function snapshotFromPostRecord(post: {
  title: string; slug: string; excerpt: string | null; category: string; tags: string[]; thumbnail: string | null;
  authorName: string; sourceTitle: string | null; sourceUrl: string | null; seoTitle: string | null; seoDescription: string | null;
  publishedAt: Date | null; createdAt: Date;
  blocks: Array<{ id: string; type: string; content: string; url: string | null; title: string | null; caption: string | null; altText: string | null; isLocked: boolean | null }>;
}): PostSnapshot {
  const blocks = post.blocks.map((block) => ({
    id: block.id,
    type: block.type as "text" | "image" | "video" | "pdf" | "link",
    content: block.type === "text" ? sanitizeRichText(block.content) : block.content,
    url: block.url || undefined,
    title: block.title || undefined,
    caption: block.caption || undefined,
    altText: block.altText || undefined,
    isLocked: block.isLocked || false,
  }));
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || deriveExcerpt(blocks),
    category: post.category === "Kegiatan" || post.category === "Pengumuman" || post.category === "Opini" ? post.category : "Berita",
    tags: post.tags,
    thumbnail: post.thumbnail,
    authorName: post.authorName,
    sourceTitle: post.sourceTitle,
    sourceUrl: post.sourceUrl,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    publishedAt: (post.publishedAt || post.createdAt).toISOString(),
    blocks,
  };
}

async function uniqueSlug(requested: string, title: string, excludingId?: string) {
  const base = generatePostSlug(requested || title) || `draft-${randomUUID().slice(0, 8)}`;
  let slug = base;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const existing = await prisma.post.findFirst({
      where: { slug, ...(excludingId ? { id: { not: excludingId } } : {}) },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${base}-${attempt + 2}`;
  }
  throw new Error("Tidak dapat membuat slug unik");
}

function invalidatePostCaches(slug?: string) {
  revalidateTag("posts", "max");
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/post/${slug}`);
}

async function pruneRevisions(postId: string, pinnedIds: Array<string | null | undefined>) {
  const revisions = await prisma.postRevision.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    select: { id: true, mediaUrls: true },
  });
  const removableIds = revisionIdsToPrune(revisions, pinnedIds, REVISION_LIMIT);
  const removable = revisions.filter((revision) => removableIds.includes(revision.id));
  if (!removable.length) return;
  await prisma.postRevision.deleteMany({ where: { id: { in: removable.map((revision) => revision.id) } } });
  const media = removable.flatMap((revision) => revision.mediaUrls);
  if (media.length) await deleteFilesFromStorage(media);
}

function canEdit(post: { status: PostStatus }, actor: EditorActor) {
  return canPerformPostAction(actor.role, post.status, "EDIT");
}

async function ensureLegacyPostVersion(id: string, expectedVersion: number) {
  if (!shouldBackfillLegacyVersion(expectedVersion)) return true;
  try {
    const result = await prisma.$runCommandRaw({
      update: "Post",
      updates: [{
        q: { _id: { $oid: id }, version: { $exists: false } },
        u: { $set: { version: 1 } },
        multi: false,
      }],
    }) as { ok?: number };
    return result.ok === 1;
  } catch (error) {
    console.error("Legacy post version backfill failed", error);
    return false;
  }
}

async function createPostFromInput(input: PostEditorInput, actor: EditorActor, status: PostStatus) {
  const slug = await uniqueSlug(input.slug || "", input.title);
  return prisma.post.create({
    data: {
      ...postFields(input, slug, actor),
      status,
      authorId: actor.id,
      authorName: input.authorName.trim() || actor.name,
      version: 1,
      activities: {
        create: {
          type: PostActivityType.CREATED,
          actorId: actor.id,
          actorName: actor.name,
          toStatus: status,
        },
      },
    },
  });
}

async function saveWorkspace(
  rawInput: unknown,
  actor: EditorActor,
  options: {
    status: PostStatus;
    reason: string;
    activityType: PostActivityType;
    note?: string;
    publishAt?: Date;
    scheduleAt?: Date;
  },
): Promise<ActionResult<{ id: string; version: number; slug: string; status: PostStatus; publishedAt: string | null }>> {
  let input: PostEditorInput;
  try {
    input = parseAndSanitizePostInput(rawInput);
    if (options.status !== PostStatus.DRAFT) assertPublishable(input);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Data post tidak valid", "VALIDATION");
  }

  const newUploads = validateUploadReceipts(input.newUploads);
  if (!newUploads) return fail("Receipt upload tidak valid", "VALIDATION");
  const submittedUrls = [input.thumbnail, ...input.blocks.map((block) => block.url)];
  if (!receiptsMatchUrls(newUploads, submittedUrls)) {
    await rollbackNewUploads(newUploads);
    return fail("Receipt upload tidak sesuai dengan media post", "VALIDATION");
  }

  let existing = input.id ? await prisma.post.findUnique({ where: { id: input.id } }) : null;
  if (input.id && !existing) {
    await rollbackNewUploads(newUploads);
    return fail("Post tidak ditemukan", "NOT_FOUND");
  }
  if (existing && !canEdit(existing, actor)) {
    await rollbackNewUploads(newUploads);
    return fail("Post sedang dikunci oleh workflow editorial", "FORBIDDEN");
  }
  if (existing && input.expectedVersion !== existing.version) {
    await rollbackNewUploads(newUploads);
    return fail("Post telah diubah editor lain. Muat ulang sebelum menyimpan.", "CONFLICT");
  }

  if (existing && input.id && !await ensureLegacyPostVersion(existing.id, existing.version)) {
    await rollbackNewUploads(newUploads);
    return fail("Gagal menyiapkan versi post lama", "VALIDATION");
  }

  if (!existing) existing = await createPostFromInput(input, actor, PostStatus.DRAFT);

  const slug = isPostLive(existing)
    ? existing.slug
    : await uniqueSlug(input.slug || existing.slug, input.title, existing.id);
  const nextVersion = existing.version + (input.id ? 1 : 0);
  const publishedAt = resolvePublicationDate(
    input.publishedAt,
    existing.publishedAt,
    options.publishAt,
    options.status === PostStatus.PUBLISHED,
  );
  if (Number.isNaN(publishedAt.getTime())) {
    await rollbackNewUploads(newUploads);
    return fail("Tanggal publikasi tidak valid", "VALIDATION");
  }
  const snapshot = snapshotFromInput(input, slug, publishedAt);
  const mediaUrls = collectMediaUrls(snapshot.thumbnail, snapshot.blocks);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const revision = await tx.postRevision.create({
        data: {
          postId: existing!.id,
          version: nextVersion,
          snapshot: jsonSnapshot(snapshot),
          mediaUrls,
          reason: options.reason,
          actorId: actor.id,
          actorName: actor.name,
        },
      });

      const statusBefore = existing!.status;
      const update = await tx.post.updateMany({
        where: { id: existing!.id, version: existing!.version },
        data: {
          ...postFields(input, slug, actor),
          status: options.status,
          version: nextVersion,
          reviewNote: options.note || null,
          submittedAt: options.status === PostStatus.IN_REVIEW ? new Date() : existing!.submittedAt,
          ...(options.status === PostStatus.PUBLISHED ? {
            publishedRevisionId: revision.id,
            scheduledRevisionId: null,
            scheduledAt: null,
            firstPublishedAt: existing!.firstPublishedAt || publishedAt,
            publishedAt,
          } : {}),
          ...(options.status === PostStatus.SCHEDULED ? {
            scheduledRevisionId: revision.id,
            scheduledAt: options.scheduleAt,
          } : {}),
        },
      });
      if (update.count !== 1) throw new Error("VERSION_CONFLICT");

      await tx.postActivity.create({
        data: {
          postId: existing!.id,
          type: options.activityType,
          actorId: actor.id,
          actorName: actor.name,
          fromStatus: statusBefore,
          toStatus: options.status,
          note: options.note,
        },
      });
      return { revisionId: revision.id };
    });

    const refreshed = await prisma.post.findUniqueOrThrow({ where: { id: existing.id } });
    await pruneRevisions(refreshed.id, [refreshed.publishedRevisionId, refreshed.scheduledRevisionId, result.revisionId]);
    invalidatePostCaches(slug);
    return {
      success: true,
      data: {
        id: refreshed.id,
        version: refreshed.version,
        slug,
        status: refreshed.status,
        publishedAt: refreshed.publishedAt?.toISOString() || null,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("VERSION_CONFLICT")) {
      return fail("Post telah diubah editor lain. Muat ulang sebelum menyimpan.", "CONFLICT");
    }
    console.error("Saving post workspace failed", error);
    await rollbackNewUploads(newUploads);
    return fail("Gagal menyimpan post", "VALIDATION");
  }
}

export async function autosavePostDraft(rawInput: unknown): Promise<ActionResult<{ id: string; version: number; savedAt: string }>> {
  const actor = await requireEditor();
  if (!actor) return fail("Unauthorized", "UNAUTHORIZED");

  let input: PostEditorInput;
  try {
    input = parseAndSanitizePostInput(rawInput);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Data post tidak valid", "VALIDATION");
  }

  const newUploads = validateUploadReceipts(input.newUploads);
  if (!newUploads || !receiptsMatchUrls(newUploads, [input.thumbnail, ...input.blocks.map((block) => block.url)])) {
    if (newUploads) await rollbackNewUploads(newUploads);
    return fail("Receipt upload tidak valid", "VALIDATION");
  }

  let post = input.id ? await prisma.post.findUnique({ where: { id: input.id } }) : null;
  if (input.id && !post) {
    await rollbackNewUploads(newUploads);
    return fail("Post tidak ditemukan", "NOT_FOUND");
  }
  if (post && !canEdit(post, actor)) {
    await rollbackNewUploads(newUploads);
    return fail("Post sedang dikunci", "FORBIDDEN");
  }
  if (post && input.expectedVersion !== post.version) {
    await rollbackNewUploads(newUploads);
    return fail("Versi server lebih baru", "CONFLICT");
  }


  if (post && input.id && !await ensureLegacyPostVersion(post.id, post.version)) {
    await rollbackNewUploads(newUploads);
    return fail("Gagal menyiapkan versi post lama", "VALIDATION");
  }

  if (!post) {
    post = await createPostFromInput(input, actor, PostStatus.DRAFT);
  } else {
    const slug = post.publishedRevisionId ? post.slug : await uniqueSlug(input.slug || post.slug, input.title, post.id);
    const updated = await prisma.post.updateMany({
      where: { id: post.id, version: post.version },
      data: {
        ...postFields(input, slug, actor),
        status: post.status === PostStatus.PUBLISHED ? PostStatus.DRAFT : post.status,
        version: post.version + 1,
      },
    });
    if (updated.count !== 1) {
      await rollbackNewUploads(newUploads);
      return fail("Versi server lebih baru", "CONFLICT");
    }
    post = await prisma.post.findUniqueOrThrow({ where: { id: post.id } });
  }

  return { success: true, data: { id: post.id, version: post.version, savedAt: post.updatedAt.toISOString() } };
}

export async function savePostDraft(rawInput: unknown) {
  const actor = await requireEditor();
  if (!actor) return fail("Unauthorized", "UNAUTHORIZED");
  return saveWorkspace(rawInput, actor, {
    status: PostStatus.DRAFT,
    reason: "SAVE_DRAFT",
    activityType: PostActivityType.SAVED,
  });
}

export async function submitPostForReview(rawInput: unknown) {
  const actor = await requireEditor();
  if (!actor) return fail("Unauthorized", "UNAUTHORIZED");
  return saveWorkspace(rawInput, actor, {
    status: PostStatus.IN_REVIEW,
    reason: "SUBMIT_REVIEW",
    activityType: PostActivityType.SUBMITTED,
  });
}

export async function publishPost(rawInput: unknown) {
  const actor = await requireEditor();
  if (!actor) return fail("Unauthorized", "UNAUTHORIZED");
  if (!isSuperAdmin(actor)) return fail("Hanya Super Admin dapat menerbitkan post", "FORBIDDEN");
  return saveWorkspace(rawInput, actor, {
    status: PostStatus.PUBLISHED,
    reason: "PUBLISH",
    activityType: PostActivityType.PUBLISHED,
  });
}

export async function schedulePost(rawInput: unknown, scheduledAt: string) {
  const actor = await requireEditor();
  if (!actor) return fail("Unauthorized", "UNAUTHORIZED");
  if (!isSuperAdmin(actor)) return fail("Hanya Super Admin dapat menjadwalkan post", "FORBIDDEN");
  const scheduleAt = new Date(scheduledAt);
  if (Number.isNaN(scheduleAt.getTime()) || scheduleAt.getTime() <= Date.now() + 60_000) {
    return fail("Jadwal harus lebih dari satu menit dari sekarang", "VALIDATION");
  }
  return saveWorkspace(rawInput, actor, {
    status: PostStatus.SCHEDULED,
    reason: "SCHEDULE",
    activityType: PostActivityType.SCHEDULED,
    publishAt: scheduleAt,
    scheduleAt,
  });
}

export async function returnPostToDraft(id: string, expectedVersion: number, note: string): Promise<ActionResult<{ version: number }>> {
  const actor = await requireEditor();
  if (!actor) return fail("Unauthorized", "UNAUTHORIZED");
  if (!isSuperAdmin(actor)) return fail("Hanya Super Admin dapat mengembalikan review", "FORBIDDEN");
  if (!note.trim()) return fail("Catatan revisi wajib diisi", "VALIDATION");
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return fail("Post tidak ditemukan", "NOT_FOUND");
  if (post.version !== expectedVersion) return fail("Versi server lebih baru", "CONFLICT");
  if (post.status !== PostStatus.IN_REVIEW) return fail("Post tidak sedang direview", "VALIDATION");
  if (!await ensureLegacyPostVersion(id, expectedVersion)) return fail("Gagal menyiapkan versi post lama", "VALIDATION");
  const snapshot = snapshotFromPostRecord(post);
  const nextVersion = post.version + 1;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.postRevision.create({ data: { postId: id, version: nextVersion, snapshot: jsonSnapshot(snapshot), mediaUrls: collectMediaUrls(snapshot.thumbnail, snapshot.blocks), reason: "RETURN_REVIEW", actorId: actor.id, actorName: actor.name } });
      const updated = await tx.post.updateMany({ where: { id, version: expectedVersion }, data: { status: PostStatus.DRAFT, version: nextVersion, reviewNote: note.trim() } });
      if (updated.count !== 1) throw new Error("VERSION_CONFLICT");
      await tx.postActivity.create({ data: { postId: id, type: PostActivityType.RETURNED, actorId: actor.id, actorName: actor.name, fromStatus: PostStatus.IN_REVIEW, toStatus: PostStatus.DRAFT, note: note.trim() } });
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("VERSION_CONFLICT")) return fail("Versi server lebih baru", "CONFLICT");
    return fail("Gagal mengembalikan review", "VALIDATION");
  }
  await pruneRevisions(id, [post.publishedRevisionId, post.scheduledRevisionId]);
  invalidatePostCaches(post.slug);
  return { success: true, data: { version: nextVersion } };
}

export async function cancelScheduledPost(id: string, expectedVersion: number): Promise<ActionResult<{ version: number; status: PostStatus }>> {
  const actor = await requireEditor();
  if (!actor) return fail("Unauthorized", "UNAUTHORIZED");
  if (!isSuperAdmin(actor)) return fail("Hanya Super Admin dapat membatalkan jadwal", "FORBIDDEN");
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return fail("Post tidak ditemukan", "NOT_FOUND");
  if (post.version !== expectedVersion) return fail("Versi server lebih baru", "CONFLICT");
  if (!post.scheduledRevisionId || !post.scheduledAt) return fail("Post tidak memiliki jadwal aktif", "VALIDATION");
  if (isScheduleDue(post.scheduledAt)) return fail("Jadwal sudah tayang; gunakan unpublish", "VALIDATION");
  if (!await ensureLegacyPostVersion(id, expectedVersion)) return fail("Gagal menyiapkan versi post lama", "VALIDATION");
  const nextStatus = post.publishedRevisionId ? PostStatus.PUBLISHED : PostStatus.DRAFT;
  const nextVersion = post.version + 1;
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.post.updateMany({ where: { id, version: expectedVersion }, data: { status: nextStatus, scheduledAt: null, scheduledRevisionId: null, version: nextVersion } });
    if (result.count !== 1) throw new Error("VERSION_CONFLICT");
    await tx.postActivity.create({ data: { postId: id, type: PostActivityType.SCHEDULE_CANCELLED, actorId: actor.id, actorName: actor.name, fromStatus: PostStatus.SCHEDULED, toStatus: nextStatus } });
    return tx.post.findUniqueOrThrow({ where: { id } });
  }).catch(() => null);
  if (!updated) return fail("Versi server lebih baru", "CONFLICT");
  invalidatePostCaches(post.slug);
  return { success: true, data: { version: updated.version, status: updated.status } };
}

export async function unpublishPost(id: string, expectedVersion: number): Promise<ActionResult<{ version: number }>> {
  const actor = await requireEditor();
  if (!actor) return fail("Unauthorized", "UNAUTHORIZED");
  if (!isSuperAdmin(actor)) return fail("Hanya Super Admin dapat mengarsipkan post", "FORBIDDEN");
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return fail("Post tidak ditemukan", "NOT_FOUND");
  if (post.version !== expectedVersion) return fail("Versi server lebih baru", "CONFLICT");
  if (!await ensureLegacyPostVersion(id, expectedVersion)) return fail("Gagal menyiapkan versi post lama", "VALIDATION");
  const nextVersion = post.version + 1;
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.post.updateMany({ where: { id, version: expectedVersion }, data: { status: PostStatus.ARCHIVED, publishedRevisionId: null, scheduledRevisionId: null, scheduledAt: null, version: nextVersion } });
    if (result.count !== 1) throw new Error("VERSION_CONFLICT");
    await tx.postActivity.create({ data: { postId: id, type: PostActivityType.UNPUBLISHED, actorId: actor.id, actorName: actor.name, fromStatus: post.status, toStatus: PostStatus.ARCHIVED } });
    return tx.post.findUniqueOrThrow({ where: { id } });
  }).catch(() => null);
  if (!updated) return fail("Versi server lebih baru", "CONFLICT");
  invalidatePostCaches(post.slug);
  return { success: true, data: { version: updated.version } };
}

export async function restorePostRevision(postId: string, revisionId: string, expectedVersion: number): Promise<ActionResult<{ version: number }>> {
  const actor = await requireEditor();
  if (!actor) return fail("Unauthorized", "UNAUTHORIZED");
  const [post, revision] = await Promise.all([
    prisma.post.findUnique({ where: { id: postId } }),
    prisma.postRevision.findFirst({ where: { id: revisionId, postId } }),
  ]);
  if (!post || !revision) return fail("Post atau revisi tidak ditemukan", "NOT_FOUND");
  if (post.version !== expectedVersion) return fail("Versi server lebih baru", "CONFLICT");
  if (!canEdit(post, actor) && !isSuperAdmin(actor)) return fail("Post sedang dikunci", "FORBIDDEN");
  const snapshot = parseSnapshot(revision.snapshot);
  if (!snapshot) return fail("Snapshot revisi tidak valid", "VALIDATION");
  const restoredInput: PostEditorInput = {
    id: post.id,
    expectedVersion: post.version,
    ...snapshot,
    thumbnail: snapshot.thumbnail || "",
    sourceTitle: snapshot.sourceTitle || "",
    sourceUrl: snapshot.sourceUrl || "",
    seoTitle: snapshot.seoTitle || "",
    seoDescription: snapshot.seoDescription || "",
  };
  return saveWorkspace(restoredInput, actor, {
    status: PostStatus.DRAFT,
    reason: `RESTORE:${revision.version}`,
    activityType: PostActivityType.RESTORED,
    note: `Memulihkan revisi ${revision.version}`,
  }).then((result) => result.success
    ? { success: true, data: { version: result.data.version } }
    : result);
}

export async function deletePostPermanently(id: string, expectedVersion: number): Promise<ActionResult<undefined>> {
  const actor = await requireEditor();
  if (!actor) return fail("Unauthorized", "UNAUTHORIZED");
  if (!isSuperAdmin(actor)) return fail("Hanya Super Admin dapat menghapus permanen", "FORBIDDEN");
  const post = await prisma.post.findUnique({ where: { id }, include: { revisions: { select: { mediaUrls: true } } } });
  if (!post) return fail("Post tidak ditemukan", "NOT_FOUND");
  if (post.version !== expectedVersion) return fail("Versi server lebih baru", "CONFLICT");
  if (!await ensureLegacyPostVersion(id, expectedVersion)) return fail("Gagal menyiapkan versi post lama", "VALIDATION");
  const currentBlocks = post.blocks.map((block) => ({
    id: block.id,
    type: block.type as "text" | "image" | "video" | "pdf" | "link",
    content: block.content,
    url: block.url || undefined,
    title: block.title || undefined,
    caption: block.caption || undefined,
    altText: block.altText || undefined,
    isLocked: block.isLocked || false,
  }));
  const media = [...new Set([
    ...collectMediaUrls(post.thumbnail, currentBlocks),
    ...post.revisions.flatMap((revision) => revision.mediaUrls),
  ])];
  const deleted = await prisma.post.deleteMany({ where: { id, version: expectedVersion } });
  if (deleted.count !== 1) return fail("Versi server lebih baru", "CONFLICT");
  if (media.length) await deleteFilesFromStorage(media);
  invalidatePostCaches(post.slug);
  return { success: true, data: undefined };
}

// Backward-compatible alias for legacy UI during the rollout.
export const deletePost = deletePostPermanently;

async function resolvePublicPost(post: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  thumbnail: string | null;
  blocks: Array<{ id: string; type: string; content: string; url: string | null; title: string | null; caption: string | null; altText: string | null; isLocked: boolean | null }>;
  sourceTitle: string | null;
  sourceUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  authorName: string;
  status: PostStatus;
  publishedAt: Date | null;
  firstPublishedAt: Date | null;
  publishedRevisionId: string | null;
  scheduledRevisionId: string | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}, revisions?: Map<string, Prisma.JsonValue>): Promise<PublicPost | null> {
  const chosenId = post.scheduledRevisionId && isScheduleDue(post.scheduledAt)
    ? post.scheduledRevisionId
    : post.publishedRevisionId;
  let snapshot = chosenId && revisions ? parseSnapshot(revisions.get(chosenId) ?? null) : null;
  if (chosenId && !snapshot) {
    const revision = await prisma.postRevision.findUnique({ where: { id: chosenId }, select: { snapshot: true } });
    snapshot = revision ? parseSnapshot(revision.snapshot) : null;
  }

  // Legacy fallback keeps the website online until the migration script is applied.
  if (!snapshot && post.status === PostStatus.PUBLISHED) {
    snapshot = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || deriveExcerpt(post.blocks.map((block) => ({
        ...block,
        type: block.type as "text" | "image" | "video" | "pdf" | "link",
        url: block.url || undefined,
        title: block.title || undefined,
        caption: block.caption || undefined,
        altText: block.altText || undefined,
        isLocked: block.isLocked || false,
      }))),
      category: (post.category === "Kegiatan" || post.category === "Pengumuman" || post.category === "Opini" ? post.category : "Berita"),
      tags: post.tags,
      thumbnail: post.thumbnail,
      authorName: post.authorName,
      sourceTitle: post.sourceTitle,
      sourceUrl: post.sourceUrl,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      publishedAt: (post.publishedAt || post.createdAt).toISOString(),
      blocks: post.blocks.map((block) => ({
        id: block.id,
        type: block.type as "text" | "image" | "video" | "pdf" | "link",
        content: block.type === "text" ? sanitizeRichText(block.content) : block.content,
        url: block.url || undefined,
        title: block.title || undefined,
        caption: block.caption || undefined,
        altText: block.altText || undefined,
        isLocked: block.isLocked || false,
      })),
    };
  }
  if (!snapshot) return null;
  return {
    id: post.id,
    ...snapshot,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    firstPublishedAt: (post.firstPublishedAt || new Date(snapshot.publishedAt)).toISOString(),
  };
}

const getPublishedPostsCached = unstable_cache(async () => {
  const now = new Date();
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { publishedRevisionId: { not: null } },
        { status: PostStatus.PUBLISHED },
        { scheduledRevisionId: { not: null }, scheduledAt: { lte: now } },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });
  const revisionIds = posts.flatMap((post) => {
    const ids = [post.publishedRevisionId];
    if (post.scheduledRevisionId && isScheduleDue(post.scheduledAt, now)) ids.push(post.scheduledRevisionId);
    return ids.filter((id): id is string => Boolean(id));
  });
  const revisions = revisionIds.length
    ? await prisma.postRevision.findMany({ where: { id: { in: revisionIds } }, select: { id: true, snapshot: true } })
    : [];
  const revisionMap = new Map(revisions.map((revision) => [revision.id, revision.snapshot]));
  const resolved = await Promise.all(posts.map((post) => resolvePublicPost(post, revisionMap)));
  return resolved.filter((post): post is PublicPost => Boolean(post)).sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}, ["published-posts-v2"], { tags: ["posts"], revalidate: 60 });

export async function getPublishedPosts(options?: { search?: string; category?: string; limit?: number }) {
  let posts = await getPublishedPostsCached();
  if (options?.search) {
    const query = options.search.toLocaleLowerCase("id-ID");
    posts = posts.filter((post) => [post.title, post.excerpt, post.authorName, ...post.tags].join(" ").toLocaleLowerCase("id-ID").includes(query));
  }
  if (options?.category) posts = posts.filter((post) => post.category === options.category);
  return options?.limit ? posts.slice(0, options.limit) : posts;
}

export async function getPosts(options?: { search?: string; status?: string; category?: string }) {
  return getPublishedPosts({ search: options?.search, category: options?.category });
}

export async function getPostBySlug(slug: string) {
  const post = await prisma.post.findUnique({ where: { slug } });
  return post ? resolvePublicPost(post) : null;
}

export async function getPostById(id: string): Promise<PostEditorData | null> {
  const actor = await requireEditor();
  if (!actor) return null;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      revisions: { orderBy: { createdAt: "desc" }, take: 22 },
      activities: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!post) return null;
  const dueSchedule = Boolean(post.scheduledRevisionId && isScheduleDue(post.scheduledAt));
  const live = isPostLive(post);
  return {
    id: post.id,
    expectedVersion: post.version,
    version: post.version,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    category: (post.category === "Kegiatan" || post.category === "Pengumuman" || post.category === "Opini" ? post.category : "Berita"),
    tags: post.tags,
    thumbnail: post.thumbnail || "",
    authorName: post.authorName,
    sourceTitle: post.sourceTitle || "",
    sourceUrl: post.sourceUrl || "",
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
    publishedAt: post.publishedAt?.toISOString() || "",
    blocks: post.blocks.map((block) => ({
      id: block.id,
      type: block.type as "text" | "image" | "video" | "pdf" | "link",
      content: block.type === "text" ? sanitizeRichText(block.content) : block.content,
      url: block.url || "",
      title: block.title || "",
      caption: block.caption || "",
      altText: block.altText || "",
      isLocked: block.isLocked || false,
    })),
    status: dueSchedule ? "PUBLISHED" : post.status,
    reviewNote: post.reviewNote,
    scheduledAt: post.scheduledAt?.toISOString() || null,
    hasPublishedVersion: live,
    isLive: live,
    canEditSlug: !live,
    updatedAt: post.updatedAt.toISOString(),
    revisions: post.revisions.map((revision) => ({
      id: revision.id,
      version: revision.version,
      reason: revision.reason,
      actorName: revision.actorName,
      createdAt: revision.createdAt.toISOString(),
      isPublished: revision.id === post.publishedRevisionId,
      isScheduled: revision.id === post.scheduledRevisionId,
    })),
    activities: post.activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      actorName: activity.actorName,
      note: activity.note,
      fromStatus: activity.fromStatus,
      toStatus: activity.toStatus,
      createdAt: activity.createdAt.toISOString(),
    })),
  };
}

export async function getAdminPosts(): Promise<AdminPostListItem[]> {
  const actor = await requireEditor();
  if (!actor) return [];
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  const now = new Date();
  return posts.map((post) => {
    const scheduleDue = Boolean(post.scheduledRevisionId && isScheduleDue(post.scheduledAt, now));
    const live = isPostLive(post, now);
    return {
      id: post.id,
      title: post.title || "Tanpa Judul",
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      status: scheduleDue ? "PUBLISHED" : post.status,
      authorName: post.authorName,
      version: post.version,
      scheduledAt: post.scheduledAt?.toISOString() || null,
      publishedAt: post.publishedAt?.toISOString() || null,
      hasPublishedVersion: live,
      isLive: live,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  });
}

export async function getPostByFileUrl(url: string) {
  const posts = await getPublishedPostsCached();
  const authorized = posts.some((post) => post.thumbnail === url || post.blocks.some((block) => block.url === url));
  return { authorized };
}
