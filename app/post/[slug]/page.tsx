import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostClient from "@/components/post/PostClient";
import { getPostBySlug, getPublishedPosts } from "@/lib/actions/post";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Artikel tidak ditemukan | PCNU Bolsel", robots: { index: false, follow: false } };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const canonical = `${SITE_URL}/post/${post.slug}`;
  const images = [post.thumbnail || `${SITE_URL}/brand/pcnu-bolsel-favicon.png`];
  return {
    title: `${title} | PCNU Bolsel`,
    description,
    authors: [{ name: post.authorName }],
    alternates: { canonical },
    openGraph: { type: "article", locale: "id_ID", siteName: "PCNU Bolsel", url: canonical, title, description, publishedTime: post.publishedAt, modifiedTime: post.updatedAt, authors: [post.authorName], tags: post.tags, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function SinglePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const allPosts = await getPublishedPosts();
  const relatedPosts = allPosts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => ({ candidate, score: Number(candidate.category === post.category) * 2 + candidate.tags.filter((tag) => post.tags.includes(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ candidate }) => candidate);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "NewsArticle", headline: post.title, description: post.excerpt,
    image: post.thumbnail ? [post.thumbnail] : undefined, datePublished: post.publishedAt, dateModified: post.updatedAt,
    mainEntityOfPage: `${SITE_URL}/post/${post.slug}`, author: { "@type": "Person", name: post.authorName },
    publisher: { "@type": "Organization", name: "PCNU Bolaang Mongondow Selatan", logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/pcnu-bolsel-favicon.png` } },
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><PostClient post={post} relatedPosts={relatedPosts} /></>;
}
