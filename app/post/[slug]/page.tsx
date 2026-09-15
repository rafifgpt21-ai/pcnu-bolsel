import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import PostClient from "@/components/post/PostClient";
import { getPostBySlug, getPublishedPosts } from "@/lib/actions/post";
import { serializeJsonLd } from "@/lib/seo";
import {
  absoluteUrl,
  ORGANIZATION_ID,
  ORGANIZATION_NAME,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const revalidate = 60;

const getPost = cache(getPostBySlug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Artikel tidak ditemukan", robots: { index: false, follow: false } };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const canonical = absoluteUrl(`/post/${post.slug}`);
  const images = [post.thumbnail || absoluteUrl("/opengraph-image")];
  return {
    title,
    description,
    authors: [{ name: post.authorName }],
    alternates: { canonical },
    openGraph: { type: "article", locale: "id_ID", siteName: "PCNU Bolsel", url: canonical, title, description, publishedTime: post.publishedAt, modifiedTime: post.updatedAt, authors: [post.authorName], tags: post.tags, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function SinglePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const allPosts = await getPublishedPosts();
  const relatedPosts = allPosts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => ({ candidate, score: Number(candidate.category === post.category) * 2 + candidate.tags.filter((tag) => post.tags.includes(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ candidate }) => candidate);
  const canonical = absoluteUrl(`/post/${post.slug}`);
  const description = post.seoDescription || post.excerpt;
  const image = post.thumbnail || absoluteUrl("/opengraph-image");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${canonical}#article`,
        url: canonical,
        headline: post.title,
        description,
        image: [image],
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        inLanguage: "id-ID",
        isAccessibleForFree: true,
        articleSection: post.category,
        keywords: post.tags,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        author: { "@type": "Person", name: post.authorName },
        publisher: {
          "@type": "Organization",
          "@id": ORGANIZATION_ID,
          name: ORGANIZATION_NAME,
          alternateName: SITE_NAME,
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/brand/pcnu-bolsel-favicon.png"),
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Jelajah", item: absoluteUrl("/explore") },
          { "@type": "ListItem", position: 3, name: post.title, item: canonical },
        ],
      },
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} /><PostClient post={post} relatedPosts={relatedPosts} /></>;
}
