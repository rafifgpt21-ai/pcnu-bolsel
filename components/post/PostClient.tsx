"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getYouTubeEmbedUrl, readingTimeMinutes } from "@/lib/posts/domain";
import type { PostBlock, PublicPost } from "@/lib/posts/types";

export default function PostClient({ post, relatedPosts }: { post: PublicPost; relatedPosts: PublicPost[] }) {
  const [progress, setProgress] = useState(0);
  const [shareMessage, setShareMessage] = useState("");
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  const share = async () => {
    const data = { title: post.title, text: post.excerpt, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(window.location.href); setShareMessage("Tautan disalin"); }
    } catch { /* Pengguna membatalkan share sheet. */ }
  };
  const readTime = readingTimeMinutes(post.blocks);
  const canonical = `${process.env.NEXT_PUBLIC_APP_URL || "https://pcnubolsel.or.id"}/post/${post.slug}`;
  const published = formatDate(post.publishedAt);
  const changed = new Date(post.updatedAt).getTime() > new Date(post.publishedAt).getTime() + 60_000;

  return (
    <article className="min-w-0 overflow-x-hidden bg-surface-container-lowest pb-20">
      <div className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-secondary" style={{ transform: `scaleX(${progress})` }} aria-hidden />
      <header className="relative flex min-h-0 items-end overflow-hidden py-12 sm:py-20 md:min-h-[62vh] md:py-24">
        {post.thumbnail ? <div className="absolute inset-0"><Image src={post.thumbnail} alt="" fill priority className="object-cover" sizes="100vw" /><div className="absolute inset-0 bg-linear-to-t from-surface-container-lowest via-surface-container-lowest/85 to-black/35" /></div> : <div className="absolute inset-0 bg-linear-to-br from-primary/15 via-surface-container-low to-secondary/15" />}
        <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6">
          <Link href="/explore" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-container-lowest/90 px-4 text-xs font-bold uppercase tracking-wider"><span className="material-symbols-outlined text-lg">arrow_back</span>Semua artikel</Link>
          <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-secondary">{post.category}</span>{post.tags.map((tag) => <span key={tag} className="rounded-full bg-surface-container-lowest/85 px-3 py-2 text-xs font-bold">#{tag}</span>)}</div>
          <h1 className="mt-5 max-w-4xl break-words text-3xl font-black leading-[1.12] text-primary [overflow-wrap:anywhere] sm:text-5xl md:text-7xl">{post.title}</h1>
          {post.excerpt && <p className="mt-5 max-w-3xl text-base leading-relaxed text-on-surface-variant sm:text-lg">{post.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-on-surface-variant sm:text-sm"><span>{post.authorName}</span><span>{published}</span>{changed && <span>Diperbarui {formatDate(post.updatedAt)}</span>}<span>{readTime} menit baca</span></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 md:grid-cols-[minmax(0,1fr)_4rem] md:py-14">
        <div className="min-w-0 space-y-10">{post.blocks.map((block) => <PublicBlock key={block.id} block={block} />)}
          {post.sourceUrl && <aside className="rounded-2xl border border-outline-variant/30 bg-surface-container p-4"><p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sumber</p><a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all font-bold text-secondary underline">{post.sourceTitle || post.sourceUrl}</a></aside>}
          <div className="flex flex-wrap items-center gap-2 border-t border-outline-variant/25 pt-6"><span className="mr-2 text-sm font-bold">Bagikan:</span><button type="button" onClick={share} className="flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-on-primary"><span className="material-symbols-outlined">share</span>Bagikan</button><a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${canonical}`)}`} target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-full bg-emerald-100 text-emerald-900" aria-label="Bagikan ke WhatsApp"><span className="material-symbols-outlined">chat</span></a>{shareMessage && <span aria-live="polite" className="text-sm text-secondary">{shareMessage}</span>}</div>
        </div>
        <aside className="hidden md:block"><button type="button" onClick={share} className="sticky top-28 grid size-12 place-items-center rounded-full bg-primary text-on-primary shadow-lg" aria-label="Bagikan artikel"><span className="material-symbols-outlined">share</span></button></aside>
      </div>

      {relatedPosts.length > 0 && <section className="border-t border-outline-variant/20 bg-surface-container-low py-14"><div className="mx-auto max-w-6xl px-4 sm:px-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Baca juga</p><h2 className="mt-2 text-2xl font-black text-primary sm:text-4xl">Artikel terkait</h2><div className="mt-7 grid gap-4 md:grid-cols-3">{relatedPosts.map((related) => <Link key={related.id} href={`/post/${related.slug}`} className="group overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">{related.thumbnail && <div className="relative aspect-video"><Image src={related.thumbnail} alt={related.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" /></div>}<div className="p-5"><span className="text-xs font-bold uppercase tracking-widest text-secondary">{related.category}</span><h3 className="mt-2 break-words text-lg font-bold leading-snug group-hover:text-secondary">{related.title}</h3><p className="mt-3 text-xs text-on-surface-variant">{formatDate(related.publishedAt)}</p></div></Link>)}</div></div></section>}
    </article>
  );
}

function PublicBlock({ block }: { block: PostBlock }) {
  if (block.type === "text") return <div className="prose prose-lg max-w-none break-words text-on-surface prose-headings:text-primary prose-a:break-all prose-a:text-secondary prose-blockquote:border-secondary" dangerouslySetInnerHTML={{ __html: block.content }} />;
  if (block.type === "image" && block.url) return <figure><Image src={block.url} alt={block.altText || block.title || "Gambar artikel"} width={1600} height={1000} className="h-auto w-full rounded-2xl object-contain" sizes="(max-width: 768px) 100vw, 900px" />{(block.title || block.caption) && <figcaption className="mt-2 text-center text-sm text-on-surface-variant"><b>{block.title}</b>{block.title && block.caption ? " — " : ""}{block.caption}</figcaption>}</figure>;
  if (block.type === "video" && block.url) { const embed = getYouTubeEmbedUrl(block.url); return embed ? <figure><div className="aspect-video overflow-hidden rounded-2xl bg-black"><iframe src={embed} title={block.title || "Video YouTube"} className="size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>{block.caption && <figcaption className="mt-2 text-sm text-on-surface-variant">{block.caption}</figcaption>}</figure> : <AccessibleLink block={block} icon="smart_display" />; }
  if (block.type === "pdf" && block.url) return <AccessibleLink block={block} icon="picture_as_pdf" label="Buka dokumen PDF" />;
  if (block.type === "link" && block.url) return <AccessibleLink block={block} icon="open_in_new" label="Buka tautan" />;
  return null;
}

function AccessibleLink({ block, icon, label = "Buka tautan" }: { block: PostBlock; icon: string; label?: string }) {
  return <a href={block.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container p-4 hover:border-secondary"><span className="material-symbols-outlined grid size-12 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">{icon}</span><span className="min-w-0"><b className="block break-words">{block.title || label}</b><span className="block break-all text-xs text-on-surface-variant">{block.caption || block.url}</span></span></a>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(value)); }
