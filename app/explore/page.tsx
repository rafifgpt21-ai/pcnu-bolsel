import { getPosts } from "@/lib/actions/post";
import ExploreClient from "@/components/explore/ExploreClient";
import ExploreSkeleton from "@/components/explore/ExploreSkeleton";
import { Suspense } from "react";

export const metadata = {
  title: "Jelajah Artikel & Berita | PCNU Bolsel",
  description: "Telusuri kumpulan berita terbaru, opini mendalam, dan hasil riset strategis dari PCNU Bolaang Mongondow Selatan.",
};

export default async function KaryaPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { search, category } = await searchParams;
  const posts = await getPosts({ 
    status: 'Published',
    search: search || undefined,
    category: category && category !== 'Semua' ? category : undefined
  });

  return (
    <main className="min-h-screen bg-surface-container-lowest">
      <Suspense fallback={<ExploreSkeleton />}>
        <ExploreClient initialPosts={posts} />
      </Suspense>
    </main>
  );
}


