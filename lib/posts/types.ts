export const POST_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export type PostStatusValue = (typeof POST_STATUSES)[number];

export const POST_CATEGORIES = ["Berita", "Kegiatan", "Pengumuman", "Opini"] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export const POST_BLOCK_TYPES = ["text", "image", "video", "pdf", "link"] as const;
export type PostBlockType = (typeof POST_BLOCK_TYPES)[number];

export type PostBlock = {
  id: string;
  type: PostBlockType;
  content: string;
  url?: string;
  title?: string;
  caption?: string;
  altText?: string;
  isLocked?: boolean;
};

export type UploadReceipt = {
  key: string;
  url: string;
  type: "image" | "pdf";
  size: number;
};

export type PostEditorInput = {
  id?: string;
  expectedVersion?: number;
  title: string;
  slug?: string;
  excerpt?: string;
  category: PostCategory;
  tags: string[];
  thumbnail?: string;
  authorName: string;
  sourceTitle?: string;
  sourceUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  blocks: PostBlock[];
  newUploads?: UploadReceipt[];
};

export type PostSnapshot = {
  title: string;
  slug: string;
  excerpt: string;
  category: PostCategory;
  tags: string[];
  thumbnail: string | null;
  authorName: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string;
  blocks: PostBlock[];
};

export type PublicPost = PostSnapshot & {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstPublishedAt: string;
};

export type PostRevisionDTO = {
  id: string;
  version: number;
  reason: string;
  actorName: string;
  createdAt: string;
  isPublished: boolean;
  isScheduled: boolean;
};

export type PostActivityDTO = {
  id: string;
  type: string;
  actorName: string;
  note: string | null;
  fromStatus: PostStatusValue | null;
  toStatus: PostStatusValue | null;
  createdAt: string;
};

export type PostEditorData = PostEditorInput & {
  id: string;
  version: number;
  status: PostStatusValue;
  reviewNote: string | null;
  scheduledAt: string | null;
  hasPublishedVersion: boolean;
  isLive: boolean;
  canEditSlug: boolean;
  updatedAt: string;
  revisions: PostRevisionDTO[];
  activities: PostActivityDTO[];
};

export type AdminPostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  status: PostStatusValue;
  authorName: string;
  version: number;
  scheduledAt: string | null;
  publishedAt: string | null;
  hasPublishedVersion: boolean;
  isLive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; code?: "UNAUTHORIZED" | "FORBIDDEN" | "VALIDATION" | "CONFLICT" | "NOT_FOUND" };

export const POST_STATUS_LABELS: Record<PostStatusValue, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "Dalam Review",
  SCHEDULED: "Terjadwal",
  PUBLISHED: "Diterbitkan",
  ARCHIVED: "Diarsipkan",
};
