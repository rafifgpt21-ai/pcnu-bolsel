import type { PostEditorInput } from "./types";

export type StoredLocalDraft = { savedAt: string; data: PostEditorInput };

export function editorContentFingerprint(input: PostEditorInput) {
  return JSON.stringify({
    id: input.id || "",
    title: input.title,
    slug: input.slug || "",
    excerpt: input.excerpt || "",
    category: input.category,
    tags: input.tags,
    thumbnail: input.thumbnail || "",
    authorName: input.authorName,
    sourceTitle: input.sourceTitle || "",
    sourceUrl: input.sourceUrl || "",
    publishedAt: input.publishedAt || "",
    blocks: input.blocks.map((block) => ({
      id: block.id,
      type: block.type,
      content: block.content,
      url: block.url || "",
      title: block.title || "",
      caption: block.caption || "",
      altText: block.altText || "",
      isLocked: block.isLocked || false,
    })),
  });
}

export function parseLocalDraft(raw: string | null): StoredLocalDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredLocalDraft;
    if (!parsed?.savedAt || !parsed.data || !Array.isArray(parsed.data.blocks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function shouldOfferLocalRecovery(local: StoredLocalDraft, serverUpdatedAt: string | undefined, serverInput: PostEditorInput) {
  if (serverUpdatedAt && new Date(local.savedAt).getTime() <= new Date(serverUpdatedAt).getTime()) return false;
  return editorContentFingerprint(local.data) !== editorContentFingerprint(serverInput);
}

export function shouldSaveEditorDraft(hasUserInteraction: boolean, currentFingerprint: string, serverFingerprint: string) {
  return hasUserInteraction && currentFingerprint !== serverFingerprint;
}
