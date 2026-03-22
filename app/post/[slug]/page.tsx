import { getPostBySlug } from "@/lib/actions/post";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function SinglePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "Published") {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <header className="mb-16 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-secondary transition-colors mb-8"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali
        </Link>
        <div className="mt-4">
          <span className="inline-block rounded-full bg-secondary/10 text-secondary px-5 py-1.5 text-xs font-label font-bold tracking-widest uppercase mb-6">
            {post.category}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary leading-tight">
          {post.title}
        </h1>
        <p className="mt-6 text-on-surface-variant font-label text-sm uppercase tracking-widest">
          {formatDate(post.createdAt)}
        </p>
      </header>

      <div className="space-y-12 bg-surface-container-lowest rounded-3xl p-8 md:p-12 shadow-sm border border-outline-variant/15">
        {post.blocks.map((block) => {
          if (block.type === "text") {
            return (
              <div
                key={block.id}
                className="prose prose-lg max-w-none text-on-surface leading-relaxed"
                dangerouslySetInnerHTML={{ __html: block.content || "" }}
              />
            );
          }
          if (block.type === "image") {
            return (
              <div key={block.id} className="my-8">
                <img
                  src={block.content}
                  alt=""
                  className="w-full rounded-2xl shadow-md"
                />
              </div>
            );
          }
          if (block.type === "pdf") {
            return (
              <div key={block.id} className="my-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-secondary text-[24px]">picture_as_pdf</span>
                  <h3 className="text-xl font-headline font-bold text-primary">Dokumen Pratinjau</h3>
                </div>
                <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20">
                  <iframe
                    src={block.content}
                    className="w-full h-[600px] rounded-xl"
                    title="PDF Viewer"
                  />
                </div>
              </div>
            );
          }
          if (block.type === "video") {
            return (
              <div key={block.id} className="my-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-red-500 text-[24px]">smart_display</span>
                  <h3 className="text-xl font-headline font-bold text-primary">Video Terkait</h3>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden shadow-md border border-outline-variant/15 bg-on-surface">
                  <iframe
                    src={block.content}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
