import { getPosts } from "@/lib/actions/post";
import ExploreClient from "@/components/explore/ExploreClient";
import ExploreSkeleton from "@/components/explore/ExploreSkeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const exploreTitle = "Berita NU Bolsel Terkini";
const exploreDescription =
  "Jelajahi berita terbaru, kegiatan organisasi, pengumuman, dan wawasan Islam dari PCNU Bolaang Mongondow Selatan.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}): Promise<Metadata> {
  const { search, category } = await searchParams;
  const isFiltered = Boolean(search?.trim() || (category && category !== "Semua"));
  const canonical = absoluteUrl("/explore");

  return {
    title: exploreTitle,
    description: exploreDescription,
    alternates: { canonical },
    robots: isFiltered ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: SITE_NAME,
      url: canonical,
      title: `${exploreTitle} | ${SITE_NAME}`,
      description: exploreDescription,
      images: [absoluteUrl("/opengraph-image")],
    },
    twitter: {
      card: "summary_large_image",
      title: `${exploreTitle} | ${SITE_NAME}`,
      description: exploreDescription,
      images: [absoluteUrl("/opengraph-image")],
    },
  };
}

export default async function KaryaPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { search, category } = await searchParams;

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <Suspense fallback={<ExploreSkeleton featured={!search && (!category || category === "Semua")} />}>
        <ExploreResults search={search} category={category} />
      </Suspense>
    </div>
  );
}

async function ExploreResults({ search, category }: { search?: string; category?: string }) {
  const posts = await getPosts({
    status: 'Published',
    search: search || undefined,
    category: category && category !== 'Semua' ? category : undefined,
  });
  return <ExploreClient initialPosts={posts} />;
}
