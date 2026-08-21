import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import PostClient from "@/components/post/PostClient";
import { getPostById } from "@/lib/actions/post";
import { deriveExcerpt } from "@/lib/posts/domain";
import type { PublicPost } from "@/lib/posts/types";

export const metadata: Metadata = { title: "Pratinjau post | PCNU Bolsel", robots: { index: false, follow: false } };

export default async function AdminPostPreview({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/admin/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") redirect("/");
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();
  const timestamp = post.publishedAt || new Date().toISOString();
  const preview: PublicPost = {
    id: post.id, title: post.title, slug: post.slug || `preview-${post.id}`, excerpt: post.excerpt || deriveExcerpt(post.blocks), category: post.category,
    tags: post.tags, thumbnail: post.thumbnail || null, authorName: post.authorName, sourceTitle: post.sourceTitle || null,
    sourceUrl: post.sourceUrl || null, seoTitle: post.seoTitle || null, seoDescription: post.seoDescription || null,
    publishedAt: timestamp, blocks: post.blocks, createdAt: timestamp, updatedAt: post.updatedAt, firstPublishedAt: timestamp,
  };
  return <><div className="sticky top-20 z-50 bg-amber-100 px-4 py-2 text-center text-sm font-bold text-amber-950">Pratinjau privat · konten ini belum tentu sama dengan artikel live</div><PostClient post={preview} relatedPosts={[]} /></>;
}
