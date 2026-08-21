"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { deletePostPermanently } from "@/lib/actions/post";
import { POST_STATUS_LABELS, type AdminPostListItem, type PostStatusValue } from "@/lib/posts/types";

const filters: Array<{ key: "ALL" | PostStatusValue; label: string }> = [
  { key: "ALL", label: "Semua" }, { key: "DRAFT", label: "Draft" }, { key: "IN_REVIEW", label: "Review" },
  { key: "SCHEDULED", label: "Terjadwal" }, { key: "PUBLISHED", label: "Terbit" }, { key: "ARCHIVED", label: "Arsip" },
];

const statusStyle: Record<PostStatusValue, string> = {
  DRAFT: "bg-slate-100 text-slate-700", IN_REVIEW: "bg-amber-100 text-amber-900", SCHEDULED: "bg-blue-100 text-blue-900",
  PUBLISHED: "bg-emerald-100 text-emerald-900", ARCHIVED: "bg-zinc-200 text-zinc-700",
};

const DELETE_HOLD_MS = 3_000;

export function AdminPostList({ initialPosts, currentRole }: { initialPosts: AdminPostListItem[]; currentRole: "ADMIN" | "SUPER_ADMIN" }) {
  const [posts, setPosts] = useState(initialPosts);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | PostStatusValue>("ALL");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminPostListItem | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [holdProgress, setHoldProgress] = useState(0);
  const deleteDialogRef = useRef<HTMLDivElement>(null);
  const holdFrameRef = useRef<number | null>(null);
  const holdStartedAtRef = useRef(0);
  const deleteCommittedRef = useRef(false);
  const visible = useMemo(() => posts.filter((post) => {
    const haystack = [post.title, post.excerpt, post.authorName, post.category, ...post.tags].join(" ").toLocaleLowerCase("id-ID");
    return (filter === "ALL" || post.status === filter) && haystack.includes(query.toLocaleLowerCase("id-ID"));
  }), [filter, posts, query]);
  const reviewCount = posts.filter((post) => post.status === "IN_REVIEW").length;

  const cancelHold = useCallback(() => {
    if (holdFrameRef.current !== null) cancelAnimationFrame(holdFrameRef.current);
    holdFrameRef.current = null;
    if (!deleteCommittedRef.current) setHoldProgress(0);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (pending || deleteCommittedRef.current) return;
    cancelHold();
    setDeleteTarget(null);
    setDeleteError("");
  }, [cancelHold, pending]);

  const openDeleteDialog = (post: AdminPostListItem) => {
    cancelHold();
    deleteCommittedRef.current = false;
    setHoldProgress(0);
    setDeleteError("");
    setDeleteTarget(post);
  };

  const remove = useCallback((post: AdminPostListItem) => {
    deleteCommittedRef.current = true;
    startTransition(async () => {
      const result = await deletePostPermanently(post.id, post.version);
      if (result.success) {
        setPosts((items) => items.filter((item) => item.id !== post.id));
        setDeleteTarget(null);
        setHoldProgress(0);
        setError("");
      } else {
        deleteCommittedRef.current = false;
        setHoldProgress(0);
        setDeleteError(result.error);
      }
    });
  }, []);

  const beginDeleteHold = useCallback(() => {
    if (!deleteTarget || pending || deleteCommittedRef.current || holdFrameRef.current !== null) return;
    holdStartedAtRef.current = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - holdStartedAtRef.current) / DELETE_HOLD_MS, 1);
      setHoldProgress(progress);
      if (progress === 1) {
        holdFrameRef.current = null;
        remove(deleteTarget);
        return;
      }
      holdFrameRef.current = requestAnimationFrame(tick);
    };
    holdFrameRef.current = requestAnimationFrame(tick);
  }, [deleteTarget, pending, remove]);

  useEffect(() => {
    if (!deleteTarget) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = deleteDialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]") || []);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeDeleteDialog(); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelHold();
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [cancelHold, closeDeleteDialog, deleteTarget]);

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-surface-container-low pb-28">
      <header className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-5 px-4 pb-6 pt-8 sm:px-6 sm:pt-12">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">CMS PCNU Bolsel</p><h1 className="mt-2 text-3xl font-black text-primary sm:text-5xl">Ruang redaksi</h1><p className="mt-2 text-sm text-on-surface-variant">Kelola draft, review, jadwal, dan artikel live dari satu tempat.</p></div>
        <Link href="/admin/post/new" className="flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-on-primary"><span className="material-symbols-outlined">add</span>Post baru</Link>
      </header>

      <section className="mx-auto max-w-7xl px-3 sm:px-6">
        {reviewCount > 0 && <button type="button" onClick={() => setFilter("IN_REVIEW")} className="mb-4 flex min-h-14 w-full items-center justify-between rounded-2xl bg-amber-100 px-4 text-left text-amber-950"><span><b>{reviewCount} post menunggu review</b><span className="block text-xs">Buka antrean yang membutuhkan keputusan redaksi.</span></span><span className="material-symbols-outlined">arrow_forward</span></button>}
        <div className="sticky top-0 z-30 mb-5 space-y-2 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest/95 p-2 shadow-sm backdrop-blur-xl">
          <label className="relative block"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, penulis, kategori, atau tag…" className="min-h-12 w-full rounded-xl bg-surface-container pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-secondary/20" /></label>
          <div className="flex max-w-full gap-1 overflow-x-auto pb-1">{filters.map((item) => <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-bold ${filter === item.key ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"}`}>{item.label}<span className="ml-1 opacity-60">{item.key === "ALL" ? posts.length : posts.filter((post) => post.status === item.key).length}</span></button>)}</div>
        </div>
        {error && <p className="mb-4 rounded-xl bg-error/10 p-3 text-sm text-error">{error}</p>}

        <div className={`grid gap-3 ${pending ? "pointer-events-none opacity-60" : ""}`}>
          {visible.map((post) => <article key={post.id} className="min-w-0 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm sm:p-5"><div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusStyle[post.status]}`}>{POST_STATUS_LABELS[post.status]}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${post.isLive ? "bg-secondary/10 text-secondary" : "bg-surface-container text-on-surface-variant"}`}>{post.isLive ? "Live" : "Tidak live"}</span><span className="rounded-full bg-surface-container px-2.5 py-1 text-[10px] font-bold">{post.category}</span></div><Link href={`/admin/post/${post.id}`}><h2 className="mt-3 break-words text-lg font-bold leading-snug text-primary hover:text-secondary sm:text-xl">{post.title || "Tanpa judul"}</h2></Link><p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{post.excerpt || "Belum ada ringkasan."}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant"><span>{post.authorName}</span><span>Diubah {formatDate(post.updatedAt)}</span>{post.scheduledAt && <span>Jadwal {formatDate(post.scheduledAt)}</span>}<span>v{post.version}</span></div></div><div className="flex shrink-0 flex-col gap-1 sm:flex-row"><Link href={`/admin/post/${post.id}`} className="grid size-11 place-items-center rounded-full bg-surface-container" aria-label={`Edit ${post.title}`}><span className="material-symbols-outlined">edit</span></Link>{post.isLive && <Link href={`/post/${post.slug}`} target="_blank" className="grid size-11 place-items-center rounded-full bg-surface-container" aria-label={`Buka ${post.title}`}><span className="material-symbols-outlined">open_in_new</span></Link>}{currentRole === "SUPER_ADMIN" && <button type="button" onClick={() => openDeleteDialog(post)} className="grid size-11 place-items-center rounded-full text-error hover:bg-error/10" aria-label={`Hapus ${post.title}`}><span className="material-symbols-outlined">delete</span></button>}</div></div></article>)}
          {!visible.length && <div className="rounded-3xl border border-dashed border-outline-variant/40 bg-surface-container-lowest p-12 text-center"><span className="material-symbols-outlined text-5xl text-outline-variant">inventory_2</span><h2 className="mt-3 text-xl font-bold">Tidak ada post</h2><p className="mt-1 text-sm text-on-surface-variant">Ubah pencarian atau filter, atau mulai post baru.</p></div>}
        </div>
      </section>

      {deleteTarget && <div className="fixed inset-0 z-50 grid place-items-center px-4"><button type="button" aria-label="Batalkan penghapusan" onClick={closeDeleteDialog} disabled={pending} className="absolute inset-0 size-full bg-black/55 backdrop-blur-sm disabled:cursor-wait" /><div ref={deleteDialogRef} role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description" className="relative w-full max-w-md rounded-3xl bg-surface-container-lowest p-6 shadow-2xl sm:p-8"><div className="grid size-14 place-items-center rounded-full bg-error/10 text-error"><span className="material-symbols-outlined text-3xl">delete_forever</span></div><h2 id="delete-dialog-title" className="mt-5 text-2xl font-black text-primary">Hapus post secara permanen?</h2><p id="delete-dialog-description" className="mt-2 text-sm leading-relaxed text-on-surface-variant">Post <strong className="text-primary">“{deleteTarget.title}”</strong> beserta riwayat revisinya akan dihapus dan tidak dapat dipulihkan.</p>{deleteTarget.isLive && <p className="mt-3 rounded-xl bg-error/10 px-3 py-2 text-sm font-bold text-error">Post ini sedang live dan akan langsung hilang dari website.</p>}{deleteError && <p role="alert" className="mt-3 rounded-xl bg-error/10 px-3 py-2 text-sm text-error">{deleteError}</p>}<div className="mt-6 grid gap-2"><button type="button" onClick={closeDeleteDialog} disabled={pending} className="min-h-12 rounded-xl bg-surface-container px-5 text-sm font-bold text-primary disabled:opacity-50">Batal</button><button type="button" disabled={pending} onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); beginDeleteHold(); }} onPointerUp={cancelHold} onPointerCancel={cancelHold} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !event.repeat) { event.preventDefault(); beginDeleteHold(); } }} onKeyUp={(event) => { if (event.key === "Enter" || event.key === " ") cancelHold(); }} onBlur={cancelHold} onContextMenu={(event) => event.preventDefault()} className="relative min-h-14 touch-none overflow-hidden rounded-xl border border-error/30 bg-error/10 px-5 text-sm font-black text-error select-none disabled:cursor-wait disabled:opacity-60"><span aria-hidden="true" className="absolute inset-y-0 left-0 bg-error/20" style={{ width: `${holdProgress * 100}%` }} /><span className="relative flex items-center justify-center gap-2"><span className={`material-symbols-outlined text-lg ${pending ? "animate-spin" : ""}`}>{pending ? "progress_activity" : "touch_app"}</span>{pending ? "Menghapus post…" : holdProgress > 0 ? `Terus tahan… ${Math.max(1, Math.ceil((1 - holdProgress) * 3))} detik` : "Tahan 3 detik untuk hapus"}</span></button></div></div></div>}
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));
}
