import "server-only";

import { z } from "zod";
import { getYouTubeEmbedUrl, isHttpUrl, isUploadThingUrl, normalizeTags } from "@/lib/posts/domain";
import { POST_CATEGORIES, type PostBlock, type PostEditorInput } from "@/lib/posts/types";
import { sanitizeRichText } from "@/lib/posts/sanitize";

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

const baseBlock = {
  id: z.string().min(1).max(120),
  content: z.string().max(250_000).default(""),
  url: z.string().max(2_048).optional().default(""),
  title: optionalText(180),
  caption: optionalText(500),
  altText: optionalText(240),
  isLocked: z.boolean().optional().default(false),
};

const blockSchema = z.discriminatedUnion("type", [
  z.object({ ...baseBlock, type: z.literal("text") }),
  z.object({ ...baseBlock, type: z.literal("image") }),
  z.object({ ...baseBlock, type: z.literal("video") }),
  z.object({ ...baseBlock, type: z.literal("pdf") }),
  z.object({ ...baseBlock, type: z.literal("link") }),
]);

export const postEditorSchema = z.object({
  id: z.string().optional(),
  expectedVersion: z.number().int().positive().optional(),
  title: z.string().max(180).default(""),
  slug: z.string().max(160).optional().default(""),
  excerpt: optionalText(320),
  category: z.enum(POST_CATEGORIES).default("Berita"),
  tags: z.array(z.string()).max(20).default([]),
  thumbnail: z.string().max(2_048).optional().default(""),
  authorName: z.string().trim().max(120).default("PCNU Redaksi"),
  sourceTitle: optionalText(180),
  sourceUrl: z.string().max(2_048).optional().default(""),
  seoTitle: optionalText(70),
  seoDescription: optionalText(180),
  publishedAt: z.string().optional().default(""),
  blocks: z.array(blockSchema).max(150).default([]),
  newUploads: z.array(z.object({
    key: z.string().min(1),
    url: z.string().url(),
    type: z.enum(["image", "pdf"]),
    size: z.number().int().nonnegative(),
  })).max(100).optional().default([]),
});

export function parseAndSanitizePostInput(value: unknown): PostEditorInput {
  const parsed = postEditorSchema.parse(value);
  const blocks: PostBlock[] = parsed.blocks.map((block) => ({
    ...block,
    content: block.type === "text" ? sanitizeRichText(block.content) : block.content.trim(),
    url: block.url.trim(),
    title: block.title.trim(),
    caption: block.caption.trim(),
    altText: block.altText.trim(),
  }));

  for (const block of blocks) {
    if ((block.type === "image" || block.type === "pdf") && block.url && !isUploadThingUrl(block.url)) {
      throw new z.ZodError([{ code: "custom", path: ["blocks", block.id, "url"], message: "URL media tidak valid" }]);
    }
    if (block.type === "video" && block.url && !getYouTubeEmbedUrl(block.url)) {
      throw new z.ZodError([{ code: "custom", path: ["blocks", block.id, "url"], message: "Gunakan URL YouTube yang valid" }]);
    }
    if (block.type === "link" && block.url && !isHttpUrl(block.url)) {
      throw new z.ZodError([{ code: "custom", path: ["blocks", block.id, "url"], message: "URL tautan tidak valid" }]);
    }
  }

  if (parsed.thumbnail && !isUploadThingUrl(parsed.thumbnail)) throw new Error("URL thumbnail tidak valid");
  if (parsed.sourceUrl && !isHttpUrl(parsed.sourceUrl)) throw new Error("URL sumber tidak valid");

  return {
    ...parsed,
    title: parsed.title.trim(),
    slug: parsed.slug.trim(),
    excerpt: parsed.excerpt.trim(),
    tags: normalizeTags(parsed.tags),
    thumbnail: parsed.thumbnail.trim(),
    authorName: parsed.authorName.trim() || "PCNU Redaksi",
    sourceTitle: parsed.sourceTitle.trim(),
    sourceUrl: parsed.sourceUrl.trim(),
    seoTitle: parsed.seoTitle.trim(),
    seoDescription: parsed.seoDescription.trim(),
    blocks,
  };
}

export function assertPublishable(input: PostEditorInput) {
  if (!input.title.trim()) throw new Error("Judul wajib diisi sebelum review atau publikasi");
  if (!input.authorName.trim()) throw new Error("Nama penulis wajib diisi");
  if (!(input.excerpt?.trim() || input.blocks.some((block) => block.type === "text" && block.content.trim()))) {
    throw new Error("Ringkasan atau isi teks wajib tersedia");
  }
  if (!input.blocks.some((block) => block.content.trim() || block.url?.trim())) {
    throw new Error("Tambahkan minimal satu blok konten");
  }
  for (const block of input.blocks) {
    if (block.type === "image" && block.url && !block.altText?.trim()) {
      throw new Error("Alt text wajib diisi untuk setiap gambar");
    }
  }
}
