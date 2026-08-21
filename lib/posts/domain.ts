import type { PostBlock, PostEditorInput, PostSnapshot, PostStatusValue } from "@/lib/posts/types";

const UPLOADTHING_HOSTS = new Set(["utfs.io", "ufs.sh"]);

export function generatePostSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 160)
    .replace(/-+$/g, "");
}

export function normalizeTags(tags: string[]) {
  const unique = new Map<string, string>();
  for (const rawTag of tags) {
    const tag = rawTag.trim().replace(/\s+/g, " ").slice(0, 30);
    if (!tag) continue;
    const key = tag.toLocaleLowerCase("id-ID");
    if (!unique.has(key)) unique.set(key, tag);
    if (unique.size === 10) break;
  }
  return [...unique.values()];
}

export function plainTextFromHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function deriveExcerpt(blocks: PostBlock[], maxLength = 240) {
  const text = blocks
    .filter((block) => block.type === "text")
    .map((block) => plainTextFromHtml(block.content))
    .filter(Boolean)
    .join(" ");
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function collectMediaUrls(thumbnail: string | null | undefined, blocks: PostBlock[]) {
  return [...new Set([
    thumbnail,
    ...blocks.filter((block) => block.type === "image" || block.type === "pdf").map((block) => block.url),
  ].filter((url): url is string => Boolean(url)))];
}

export function isHttpUrl(value?: string | null) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isUploadThingUrl(value?: string | null) {
  if (!value) return false;
  try {
    const hostname = new URL(value).hostname;
    return UPLOADTHING_HOSTS.has(hostname) || hostname.endsWith(".ufs.sh");
  } catch {
    return false;
  }
}

export function getYouTubeEmbedUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    let videoId = "";
    if (url.hostname === "youtu.be") videoId = url.pathname.slice(1).split("/")[0];
    if (url.hostname === "youtube.com" || url.hostname === "www.youtube.com" || url.hostname === "m.youtube.com") {
      if (url.pathname === "/watch") videoId = url.searchParams.get("v") || "";
      if (url.pathname.startsWith("/embed/")) videoId = url.pathname.split("/")[2] || "";
      if (url.pathname.startsWith("/shorts/")) videoId = url.pathname.split("/")[2] || "";
    }
    return /^[A-Za-z0-9_-]{6,20}$/.test(videoId) ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export function snapshotFromInput(input: PostEditorInput, slug: string, publishedAt: Date): PostSnapshot {
  const excerpt = input.excerpt?.trim() || deriveExcerpt(input.blocks);
  return {
    title: input.title.trim(),
    slug,
    excerpt,
    category: input.category,
    tags: normalizeTags(input.tags),
    thumbnail: input.thumbnail?.trim() || input.blocks.find((block) => block.type === "image" && block.url)?.url || null,
    authorName: input.authorName.trim(),
    sourceTitle: input.sourceTitle?.trim() || null,
    sourceUrl: input.sourceUrl?.trim() || null,
    seoTitle: input.seoTitle?.trim() || null,
    seoDescription: input.seoDescription?.trim() || null,
    publishedAt: publishedAt.toISOString(),
    blocks: input.blocks,
  };
}

export function resolvePublicationDate(
  inputPublishedAt: string | null | undefined,
  existingPublishedAt: Date | null | undefined,
  forcedPublishedAt: Date | null | undefined,
  publishImmediately: boolean,
  now = new Date(),
) {
  if (forcedPublishedAt) return forcedPublishedAt;
  if (inputPublishedAt?.trim()) return new Date(inputPublishedAt);
  if (publishImmediately) return now;
  return existingPublishedAt || now;
}

export function isScheduleDue(scheduledAt: Date | string | null | undefined, now = new Date()) {
  return Boolean(scheduledAt && new Date(scheduledAt).getTime() <= now.getTime());
}

export function isPostLive(post: {
  status: PostStatusValue;
  publishedRevisionId?: string | null;
  scheduledRevisionId?: string | null;
  scheduledAt?: Date | string | null;
}, now = new Date()) {
  return post.status === "PUBLISHED"
    || Boolean(post.publishedRevisionId)
    || Boolean(post.scheduledRevisionId && isScheduleDue(post.scheduledAt, now));
}

export function readingTimeMinutes(blocks: PostBlock[]) {
  const words = blocks
    .filter((block) => block.type === "text")
    .map((block) => plainTextFromHtml(block.content))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 225));
}
