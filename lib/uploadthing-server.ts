import { prisma } from "@/lib/prisma";
import type { UploadReceipt } from "@/lib/posts/types";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

const utapi = new UTApi();
const DELETE_BATCH_SIZE = 100;

const uploadReceiptSchema = z.object({
  key: z.string().min(1),
  url: z.string().url(),
  type: z.enum(["image", "pdf"]),
  size: z.number().int().nonnegative(),
});

export function createUploadReceipt(
  file: { key?: string | null; url?: string; ufsUrl?: string; size?: number },
  type: UploadReceipt["type"],
): UploadReceipt {
  const url = file.ufsUrl || file.url;
  if (!file.key || !url) throw new Error("UploadThing tidak mengembalikan key atau URL file");
  return { key: file.key, url, type, size: file.size ?? 0 };
}

export function getFileKeyFromUrl(value: string) {
  try {
    const url = new URL(value);
    const validHost = url.hostname === "utfs.io" || url.hostname === "ufs.sh" || url.hostname.endsWith(".ufs.sh");
    if (!validHost) return null;
    const match = url.pathname.match(/^\/f\/([^/]+)\/?$/);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export function validateUploadReceipts(value: unknown): UploadReceipt[] | null {
  const parsed = z.array(uploadReceiptSchema).max(100).safeParse(value ?? []);
  if (!parsed.success) return null;
  if (parsed.data.some((receipt) => getFileKeyFromUrl(receipt.url) !== receipt.key)) return null;
  return parsed.data;
}

export function receiptsMatchUrls(receipts: UploadReceipt[], urls: Array<string | null | undefined>) {
  const keys = new Set(urls.map((url) => url ? getFileKeyFromUrl(url) : null).filter((key): key is string => Boolean(key)));
  return receipts.every((receipt) => keys.has(receipt.key));
}

async function collectLiveKeys() {
  const [posts, revisions] = await Promise.all([
    prisma.post.findMany({ select: { thumbnail: true, blocks: true } }),
    prisma.postRevision.findMany({ select: { mediaUrls: true } }),
  ]);
  const urls = [
    ...posts.flatMap((post) => [post.thumbnail, ...post.blocks.map((block) => block.url)]),
    ...revisions.flatMap((revision) => revision.mediaUrls),
  ];
  return new Set(urls.map((url) => url ? getFileKeyFromUrl(url) : null).filter((key): key is string => Boolean(key)));
}

async function deleteKeys(keys: string[]) {
  let failed = 0;
  for (let index = 0; index < keys.length; index += DELETE_BATCH_SIZE) {
    const batch = keys.slice(index, index + DELETE_BATCH_SIZE);
    try {
      const result = await utapi.deleteFiles(batch);
      if (!result.success) failed += batch.length;
    } catch (error) {
      failed += batch.length;
      console.error("UploadThing cleanup failed", error);
    }
  }
  return failed;
}

export async function deleteFilesFromStorage(urlsOrKeys: string[]) {
  const candidates = new Set(urlsOrKeys.map((value) => getFileKeyFromUrl(value) || (/^[A-Za-z0-9_-]+$/.test(value) ? value : null)).filter((key): key is string => Boolean(key)));
  if (!candidates.size) return { success: true, deleted: 0 };
  const liveKeys = await collectLiveKeys();
  const deletable = [...candidates].filter((key) => !liveKeys.has(key));
  const failed = await deleteKeys(deletable);
  return { success: failed === 0, deleted: deletable.length - failed, failed };
}

export async function rollbackNewUploads(receipts: UploadReceipt[]) {
  return deleteFilesFromStorage(receipts.map((receipt) => receipt.key));
}
