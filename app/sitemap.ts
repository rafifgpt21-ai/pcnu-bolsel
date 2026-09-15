import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/actions/post";
import { absoluteUrl, SITE_URL } from "@/lib/site";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL },
    { url: absoluteUrl("/explore") },
    { url: absoluteUrl("/tentang-kami") },
  ];

  const articlePages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/post/${post.slug}`),
    lastModified: post.updatedAt,
    images: post.thumbnail ? [post.thumbnail] : undefined,
  }));

  return [...staticPages, ...articlePages];
}
