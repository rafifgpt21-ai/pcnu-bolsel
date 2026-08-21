import "dotenv/config";
import { MongoClient, ObjectId, type Document } from "mongodb";
import { collectMediaUrls, deriveExcerpt } from "../lib/posts/domain";
import type { PostBlock, PostCategory, PostSnapshot } from "../lib/posts/types";

const apply = process.argv.includes("--apply");
const backupConfirmed = process.argv.includes("--backup-confirmed");
if (apply && !backupConfirmed) throw new Error("Mode --apply memerlukan --backup-confirmed setelah backup database berhasil diverifikasi.");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL tidak tersedia");

const client = new MongoClient(databaseUrl);
const summary = { scanned: 0, changed: 0, revisionsCreated: 0, publishedSnapshotsLinked: 0, duplicateSlugs: 0 };

function blocksFrom(post: Document): PostBlock[] {
  const title = typeof post.title === "string" ? post.title : "Artikel PCNU Bolsel";
  return Array.isArray(post.blocks) ? post.blocks.map((raw: Document, index: number) => ({
    id: typeof raw.id === "string" && raw.id ? raw.id : `legacy-${post._id}-${index}`,
    type: ["text", "image", "video", "pdf", "link"].includes(raw.type) ? raw.type : "text",
    content: typeof raw.content === "string" ? raw.content : "",
    url: typeof raw.url === "string" ? raw.url : "",
    title: typeof raw.title === "string" ? raw.title : "",
    caption: typeof raw.caption === "string" ? raw.caption : "",
    altText: typeof raw.altText === "string" && raw.altText.trim() ? raw.altText : raw.type === "image" ? (raw.title || title) : "",
    isLocked: Boolean(raw.isLocked),
  })) as PostBlock[] : [];
}

function categoryFrom(value: unknown): PostCategory {
  return value === "Kegiatan" || value === "Pengumuman" || value === "Opini" ? value : "Berita";
}

async function main() {
  await client.connect();
  const db = client.db();
  const posts = db.collection("Post");
  const revisions = db.collection("PostRevision");
  const activities = db.collection("PostActivity");
  const cursor = posts.find({});
  for await (const post of cursor) {
    summary.scanned += 1;
    const blocks = blocksFrom(post);
    const sourceBlock = blocks.find((block) => block.type === "link" && /sumber/i.test(block.title || "") && block.url);
    const published = post.status === "Published" || post.status === "PUBLISHED";
    const publishedAt = post.publishedAt instanceof Date ? post.publishedAt : post.createdAt instanceof Date ? post.createdAt : new Date();
    const version = Number.isInteger(post.version) && post.version > 0 ? post.version : 1;
    const values = {
      excerpt: typeof post.excerpt === "string" && post.excerpt.trim() ? post.excerpt : deriveExcerpt(blocks),
      category: categoryFrom(post.category), tags: Array.isArray(post.tags) ? post.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 10) : [],
      authorName: typeof post.authorName === "string" && post.authorName.trim() ? post.authorName : "PCNU Redaksi",
      sourceTitle: post.sourceTitle || sourceBlock?.title || null, sourceUrl: post.sourceUrl || sourceBlock?.url || null,
      seoTitle: post.seoTitle || null, seoDescription: post.seoDescription || null, version, blocks,
      firstPublishedAt: published ? (post.firstPublishedAt || publishedAt) : (post.firstPublishedAt || null),
      publishedAt: published ? publishedAt : (post.publishedAt || null),
    };
    const existingRevision = await revisions.findOne({ postId: post._id }, { projection: { _id: 1 } });
    let revisionId = existingRevision?._id as ObjectId | undefined;
    if (!revisionId) {
      revisionId = new ObjectId();
      const snapshot: PostSnapshot = {
        title: String(post.title || "Tanpa Judul"), slug: String(post.slug), excerpt: values.excerpt, category: values.category,
        tags: values.tags, thumbnail: typeof post.thumbnail === "string" ? post.thumbnail : null, authorName: values.authorName,
        sourceTitle: values.sourceTitle, sourceUrl: values.sourceUrl, seoTitle: values.seoTitle, seoDescription: values.seoDescription,
        publishedAt: publishedAt.toISOString(), blocks,
      };
      if (apply) await revisions.insertOne({ _id: revisionId, postId: post._id, version, snapshot, mediaUrls: collectMediaUrls(snapshot.thumbnail, blocks), reason: "LEGACY_MIGRATION", actorId: null, actorName: "Migrasi Sistem", createdAt: new Date() });
      summary.revisionsCreated += 1;
    }
    const set: Document = { ...values };
    if (published && !post.publishedRevisionId) { set.publishedRevisionId = revisionId; summary.publishedSnapshotsLinked += 1; }
    if (apply) {
      await posts.updateOne({ _id: post._id }, { $set: set });
      if (!post.editorialMigratedAt) await activities.insertOne({ _id: new ObjectId(), postId: post._id, type: "CREATED", actorId: null, actorName: "Migrasi Sistem", fromStatus: null, toStatus: published ? "Published" : "Draft", note: "Snapshot awal dibuat dari post lama", createdAt: new Date() });
      await posts.updateOne({ _id: post._id }, { $set: { editorialMigratedAt: new Date() } });
    }
    summary.changed += 1;
  }
  const duplicateSlugs = await posts.aggregate([{ $group: { _id: "$slug", count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } }]).toArray();
  summary.duplicateSlugs = duplicateSlugs.length;
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", database: db.databaseName, summary }, null, 2));
  if (summary.duplicateSlugs) throw new Error("Ditemukan slug duplikat; hentikan rollout dan periksa data.");
}

main().finally(() => client.close());
