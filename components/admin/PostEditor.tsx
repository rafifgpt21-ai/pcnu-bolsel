"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  autosavePostDraft,
  cancelScheduledPost,
  deletePostPermanently,
  publishPost,
  restorePostRevision,
  returnPostToDraft,
  savePostDraft,
  schedulePost,
  submitPostForReview,
  unpublishPost,
} from "@/lib/actions/post";
import { compressImage, formatFileSize } from "@/lib/image-compression";
import { uploadFiles } from "@/lib/uploadthing";
import { BlockItem } from "./BlockItem";
import { deriveExcerpt } from "@/lib/posts/domain";
import { editorContentFingerprint, parseLocalDraft, shouldOfferLocalRecovery, shouldSaveEditorDraft } from "@/lib/posts/local-draft";
import {
  POST_CATEGORIES,
  POST_STATUS_LABELS,
  type ActionResult,
  type PostBlock,
  type PostBlockType,
  type PostEditorData,
  type PostEditorInput,
  type PostStatusValue,
  type UploadReceipt,
} from "@/lib/posts/types";

type Props = {
  initialData?: PostEditorData;
  currentUser: { name: string; role: "ADMIN" | "SUPER_ADMIN" };
};

type Sheet = "metadata" | "seo" | "history" | "actions" | null;
type SaveState = "idle" | "local" | "saving" | "saved" | "offline" | "conflict" | "error";

const emptyBlock = (type: PostBlockType): PostBlock => ({
  id: crypto.randomUUID(),
  type,
  content: "",
  url: "",
  title: "",
  caption: "",
  altText: "",
});

function dateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

function meaningful(input: PostEditorInput) {
  return Boolean(input.title.trim() || input.excerpt?.trim() || input.blocks.some((block) => block.content.trim() || block.url?.trim()));
}

function useBottomSheet(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(ref.current?.querySelectorAll<HTMLElement>("button, input, textarea, select, a[href], [tabindex]:not([tabindex='-1'])") || []).filter((item) => !item.hasAttribute("disabled"));
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); };
  }, [open, close]);
  return ref;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block space-y-1.5"><span className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">{label}</span>{children}{hint && <span className="block text-xs text-on-surface-variant/70">{hint}</span>}</label>;
}

export function PostEditor({ initialData, currentUser }: Props) {
  const router = useRouter();
  const [postId, setPostId] = useState(initialData?.id);
  const [version, setVersion] = useState(initialData?.version ?? 0);
  const [status, setStatus] = useState<PostStatusValue>(initialData?.status ?? "DRAFT");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "Berita");
  const [tagsText, setTagsText] = useState((initialData?.tags ?? []).join(", "));
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");
  const [authorName, setAuthorName] = useState(initialData?.authorName ?? currentUser.name);
  const [sourceTitle, setSourceTitle] = useState(initialData?.sourceTitle ?? "");
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl ?? "");
  const [publishedAt, setPublishedAt] = useState(dateTimeLocal(initialData?.publishedAt));
  const [scheduledAt, setScheduledAt] = useState(dateTimeLocal(initialData?.scheduledAt));
  const [blocks, setBlocks] = useState<PostBlock[]>(initialData?.blocks ?? []);
  const [revisions] = useState(initialData?.revisions ?? []);
  const [activities] = useState(initialData?.activities ?? []);
  const [receipts, setReceipts] = useState<UploadReceipt[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [stagedFiles, setStagedFiles] = useState<Record<string, File>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [deletingBlock, setDeletingBlock] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<string | null>(initialData?.updatedAt ?? null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [completionDialog, setCompletionDialog] = useState<"draft" | "published" | null>(null);
  const [desktopTab, setDesktopTab] = useState<Exclude<Sheet, "actions" | null>>("metadata");
  const [recovery, setRecovery] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [activeFileTarget, setActiveFileTarget] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const lastServerSave = useRef(0);
  const autosaveInFlight = useRef(false);
  const hasEditorInteraction = useRef(false);

  const isSuper = currentUser.role === "SUPER_ADMIN";
  const locked = !isSuper && (status === "IN_REVIEW" || status === "SCHEDULED" || status === "ARCHIVED");
  const live = initialData?.isLive || status === "PUBLISHED";
  const tags = useMemo(() => tagsText.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 10), [tagsText]);
  const effectiveExcerpt = useMemo(() => excerpt.trim() || deriveExcerpt(blocks), [blocks, excerpt]);
  const payload = useMemo<PostEditorInput>(() => ({
    id: postId,
    expectedVersion: postId ? version : undefined,
    title,
    slug,
    excerpt,
    category,
    tags,
    thumbnail,
    authorName,
    sourceTitle,
    sourceUrl,
    seoTitle: "",
    seoDescription: "",
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
    blocks,
    newUploads: receipts,
  }), [postId, version, title, slug, excerpt, category, tags, thumbnail, authorName, sourceTitle, sourceUrl, publishedAt, blocks, receipts]);
  const fingerprint = useMemo(() => editorContentFingerprint(payload), [payload]);
  const initialServerPayload = useRef(payload);
  const lastServerFingerprint = useRef(fingerprint);
  const localKey = `pcnu:post-draft:${postId || "new"}`;

  const closeSheet = useCallback(() => setSheet(null), []);
  const sheetRef = useBottomSheet(Boolean(sheet), closeSheet);
  const closeCompletionDialog = useCallback(() => setCompletionDialog(null), []);
  const completionDialogRef = useBottomSheet(Boolean(completionDialog), closeCompletionDialog);

  const applyIdentity = useCallback((data: { id: string; version: number; status?: PostStatusValue; savedAt?: string; slug?: string }) => {
    setPostId(data.id);
    setVersion(data.version);
    if (data.status) setStatus(data.status);
    if (data.savedAt) setSavedAt(data.savedAt);
    if (data.slug) setSlug(data.slug);
    if (!initialData?.id) window.history.replaceState(null, "", `/admin/post/${data.id}`);
    setReceipts([]);
  }, [initialData?.id]);

  useEffect(() => {
    const raw = localStorage.getItem(localKey);
    if (!raw) return;
    const parsed = parseLocalDraft(raw);
    if (parsed && shouldOfferLocalRecovery(parsed, initialData?.updatedAt, initialServerPayload.current)) setRecovery(raw);
    else localStorage.removeItem(localKey);
  }, [initialData?.id, initialData?.updatedAt, localKey]);

  useEffect(() => {
    if (!shouldSaveEditorDraft(hasEditorInteraction.current, fingerprint, lastServerFingerprint.current) || !meaningful(payload) || locked) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(localKey, JSON.stringify({ savedAt: new Date().toISOString(), data: payload }));
      setSaveState((state) => state === "saving" ? state : navigator.onLine ? "local" : "offline");
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [fingerprint, localKey, locked, payload]);

  useEffect(() => {
    if (!shouldSaveEditorDraft(hasEditorInteraction.current, fingerprint, lastServerFingerprint.current) || !meaningful(payload) || locked || busy || uploading || autosaveInFlight.current || saveState === "saving" || saveState === "conflict") return;
    const elapsed = Date.now() - lastServerSave.current;
    const timer = window.setTimeout(async () => {
      if (!navigator.onLine) { setSaveState("offline"); return; }
      if (autosaveInFlight.current) return;
      autosaveInFlight.current = true;
      lastServerSave.current = Date.now();
      setSaveState("saving");
      try {
        const result = await autosavePostDraft(payload);
        if (result.success) {
          if (!postId) localStorage.removeItem("pcnu:post-draft:new");
          applyIdentity(result.data);
          lastServerFingerprint.current = fingerprint;
          setSaveState("saved");
        } else if (result.code === "CONFLICT") {
          setRecovery(null);
          setError("");
          setSaveState("conflict");
        } else {
          setError(result.error);
          setSaveState("error");
        }
      } finally {
        autosaveInFlight.current = false;
      }
    }, Math.max(3000, 10_000 - elapsed));
    return () => window.clearTimeout(timer);
  }, [applyIdentity, busy, fingerprint, locked, payload, postId, saveState, uploading]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (fingerprint !== lastServerFingerprint.current && meaningful(payload)) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [fingerprint, payload]);

  useEffect(() => () => Object.values(previews).forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const restoreLocal = () => {
    if (!recovery) return;
    const data = parseLocalDraft(recovery)?.data;
    if (!data) { setRecovery(null); return; }
    setTitle(data.title); setSlug(data.slug || ""); setExcerpt(data.excerpt || ""); setCategory(data.category);
    setTagsText(data.tags.join(", ")); setThumbnail(data.thumbnail || ""); setAuthorName(data.authorName);
    setSourceTitle(data.sourceTitle || ""); setSourceUrl(data.sourceUrl || "");
    setPublishedAt(dateTimeLocal(data.publishedAt)); setBlocks(data.blocks); setRecovery(null);
    setMessage("Draft lokal dipulihkan. Periksa isinya sebelum menyimpan.");
  };

  const updateBlock = useCallback((id: string, update: Partial<PostBlock>) => setBlocks((items) => items.map((block) => block.id === id ? { ...block, ...update } : block)), []);
  const moveBlock = useCallback((index: number, direction: "up" | "down") => setBlocks((items) => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return items;
    const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; return next;
  }), []);
  const dropBlock = (target: number) => {
    if (dragIndex === null || dragIndex === target) return;
    setBlocks((items) => { const next = [...items]; const [moved] = next.splice(dragIndex, 1); next.splice(target, 0, moved); return next; });
    setDragIndex(null);
  };
  const insertBlock = (type: PostBlockType, after = blocks.length - 1) => setBlocks((items) => [...items.slice(0, after + 1), emptyBlock(type), ...items.slice(after + 1)]);

  const upload = async (target: string, original: File) => {
    const block = blocks.find((item) => item.id === target);
    const isImage = target === "thumbnail" || block?.type === "image";
    if (!isImage && original.type !== "application/pdf") { setError("Gunakan file PDF yang valid."); return; }
    if (!isImage && original.size > 16 * 1024 * 1024) { setError("Ukuran PDF maksimal 16 MB."); return; }
    setError(""); setUploading(target);
    let file = original;
    try {
      if (isImage) {
        const compressed = await compressImage(original, target === "thumbnail" ? "thumbnail" : "content");
        file = compressed.file;
        setMessage(`Gambar dikompresi menjadi ${formatFileSize(file.size)} (${compressed.savedPercent}% lebih kecil).`);
      }
      const objectUrl = URL.createObjectURL(file);
      setPreviews((current) => ({ ...current, [target]: objectUrl }));
      setStagedFiles((current) => ({ ...current, [target]: file }));
      const uploaded = await uploadFiles(isImage ? "imageUploader" : "pdfUploader", { files: [file] });
      const result = uploaded[0];
      if (!result) throw new Error("Storage tidak mengembalikan file");
      const url = (result as typeof result & { ufsUrl?: string }).ufsUrl || result.url;
      const receipt: UploadReceipt = { key: result.key, url, size: file.size, type: isImage ? "image" : "pdf" };
      setReceipts((items) => [...items.filter((item) => item.url !== url), receipt]);
      if (target === "thumbnail") setThumbnail(url); else updateBlock(target, { url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload gagal");
      setPreviews((current) => { const next = { ...current }; delete next[target]; return next; });
      setStagedFiles((current) => { const next = { ...current }; delete next[target]; return next; });
    } finally { setUploading(null); }
  };

  const chooseFile = (target: string) => {
    setActiveFileTarget(target);
    const block = blocks.find((item) => item.id === target);
    if (fileInput.current) fileInput.current.accept = target === "thumbnail" || block?.type === "image" ? "image/jpeg,image/png,image/webp,image/avif" : "application/pdf";
    fileInput.current?.click();
  };

  type MutationData = { id?: string; version?: number; status?: PostStatusValue; slug?: string; publishedAt?: string | null };
  const handleResult = (result: ActionResult<unknown>, successMessage: string) => {
    if (!result.success) {
      if (result.code === "CONFLICT") { setRecovery(null); setError(""); setSaveState("conflict"); }
      else { setError(result.error); setSaveState("error"); }
      return false;
    }
    const data = result.data && typeof result.data === "object" ? result.data as MutationData : undefined;
    if (data?.id && data.version !== undefined) applyIdentity({ id: data.id, version: data.version, status: data.status, slug: data.slug });
    else if (data?.version !== undefined) setVersion(data.version);
    if (data?.status) setStatus(data.status);
    if (data?.publishedAt) setPublishedAt(dateTimeLocal(data.publishedAt));
    setSavedAt(new Date().toISOString()); setSaveState("saved"); setMessage(successMessage); setError("");
    lastServerFingerprint.current = editorContentFingerprint({
      ...payload,
      id: data?.id ?? payload.id,
      slug: data?.slug ?? payload.slug,
      publishedAt: data?.publishedAt ?? payload.publishedAt,
      newUploads: [],
    });
    localStorage.removeItem(localKey); setSheet(null); return true;
  };

  const mutate = async (work: () => Promise<ActionResult<unknown>>, successMessage: string) => {
    if (uploading) { setError("Tunggu upload selesai."); return false; }
    setBusy(true); setError(""); setMessage("");
    try { return handleResult(await work(), successMessage); } finally { setBusy(false); }
  };

  const save = async () => {
    const saved = await mutate(() => savePostDraft(payload), "Draft dan revisi berhasil disimpan.");
    if (saved) setCompletionDialog("draft");
  };
  const submit = () => mutate(() => submitPostForReview(payload), "Post dikirim ke antrean review.");
  const publish = async () => {
    const published = await mutate(() => publishPost(payload), "Artikel berhasil diterbitkan.");
    if (published) setCompletionDialog("published");
  };
  const schedule = () => {
    if (!scheduledAt) { setError("Pilih tanggal dan waktu jadwal."); return; }
    mutate(() => schedulePost(payload, new Date(scheduledAt).toISOString()), "Artikel berhasil dijadwalkan.");
  };

  const metadataPanel = (
    <div className="space-y-4">
      <Field label="Ringkasan (opsional)" hint="Jika dikosongkan, ringkasan dibuat otomatis dari blok teks pertama."><textarea className="editor-field" rows={3} maxLength={300} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} disabled={locked} placeholder="Biarkan kosong untuk membuat otomatis dari isi artikel" /><span className="block text-right text-xs text-on-surface-variant">{excerpt.length}/300</span></Field>
      <Field label="Kategori"><select className="editor-field" value={category} onChange={(event) => setCategory(event.target.value as typeof category)} disabled={locked}>{POST_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></Field>
      <Field label="Tag" hint="Pisahkan dengan koma, maksimal 10 tag."><input className="editor-field" value={tagsText} onChange={(event) => setTagsText(event.target.value)} disabled={locked} placeholder="organisasi, sosial, kegiatan" /></Field>
      <Field label="Nama penulis"><input className="editor-field" value={authorName} onChange={(event) => setAuthorName(event.target.value)} disabled={locked || !isSuper} /></Field>
      <Field label="Tanggal publikasi (opsional)" hint="Jika kosong, waktu saat tombol Terbitkan sekarang ditekan akan digunakan."><input className="editor-field" type="datetime-local" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} disabled={locked} /></Field>
      <Field label="Thumbnail">
        {thumbnail || previews.thumbnail ? <Image src={previews.thumbnail || thumbnail} alt="Pratinjau thumbnail" width={640} height={360} unoptimized={Boolean(previews.thumbnail?.startsWith("blob:"))} className="aspect-video w-full rounded-xl object-cover" /> : <div className="grid aspect-video place-items-center rounded-xl bg-surface-container text-sm text-on-surface-variant">Belum ada thumbnail</div>}
        <button type="button" onClick={() => chooseFile("thumbnail")} disabled={locked || uploading === "thumbnail"} className="mt-2 min-h-11 w-full rounded-xl bg-secondary px-4 text-sm font-bold text-on-secondary disabled:opacity-50">{uploading === "thumbnail" ? "Mengunggah…" : "Pilih thumbnail"}</button>
      </Field>
      <Field label="Nama sumber"><input className="editor-field" value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} disabled={locked} placeholder="Nama sumber (opsional)" /></Field>
      <Field label="URL sumber"><input className="editor-field" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} disabled={locked} inputMode="url" placeholder="https://…" /></Field>
    </div>
  );

  const seoPanel = (
    <div className="space-y-5">
      <div className="rounded-2xl bg-secondary/10 p-4 text-sm text-primary">
        <p className="font-bold">Diisi otomatis dari konten</p>
        <p className="mt-1 text-on-surface-variant">Judul pencarian memakai Judul Artikel. Deskripsi memakai Ringkasan, atau otomatis mengambil isi blok teks pertama jika Ringkasan kosong.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-white p-4 text-slate-800">
        <p className="truncate text-xs text-emerald-700">pcnubolsel.or.id › post › {slug || "judul-artikel"}</p>
        <h3 className="mt-1 line-clamp-2 text-lg text-blue-700">{title || "Judul artikel"}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-slate-600">{effectiveExcerpt || "Tambahkan blok teks untuk membuat ringkasan otomatis."}</p>
      </div>
      <div className="flex items-center justify-between text-xs text-on-surface-variant"><span>Panjang judul</span><span className={title.length > 60 ? "font-bold text-error" : ""}>{title.length}/60</span></div>
      <div className="flex items-center justify-between text-xs text-on-surface-variant"><span>Panjang ringkasan otomatis</span><span className={effectiveExcerpt.length > 160 ? "font-bold text-error" : ""}>{effectiveExcerpt.length}/160</span></div>
      <div className="rounded-2xl bg-surface-container p-4 text-sm">
        <p className="font-bold">Kesiapan publikasi</p>
        {[Boolean(title.trim()) && "Judul tersedia", Boolean(effectiveExcerpt) && "Ringkasan tersedia otomatis", blocks.length > 0 && "Konten tersedia", blocks.filter((b) => b.type === "image").every((b) => b.altText?.trim()) && "Alt text gambar lengkap"].filter(Boolean).map((item) => <p key={String(item)} className="mt-2 flex gap-2"><span className="material-symbols-outlined text-base text-secondary">check_circle</span>{item}</p>)}
      </div>
    </div>
  );

  const historyPanel = (
    <div className="space-y-6">
      {revisions.length ? <div><h3 className="mb-3 font-bold">Riwayat revisi</h3><div className="space-y-2">{revisions.map((revision) => <div key={revision.id} className="rounded-xl border border-outline-variant/25 p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-bold">Versi {revision.version} {revision.isPublished && <span className="text-xs text-secondary">• live</span>}</p><p className="text-xs text-on-surface-variant">{revision.reason} · {revision.actorName}<br />{formatDate(revision.createdAt)}</p></div><button type="button" disabled={busy || locked} onClick={() => mutate(() => restorePostRevision(postId!, revision.id, version), `Versi ${revision.version} dipulihkan sebagai draft.`)} className="min-h-11 rounded-xl px-3 text-xs font-bold text-secondary disabled:opacity-40">Pulihkan</button></div></div>)}</div></div> : <p className="text-sm text-on-surface-variant">Revisi dibuat saat disimpan secara eksplisit.</p>}
      {activities.length ? <div><h3 className="mb-3 font-bold">Aktivitas</h3><ol className="space-y-3">{activities.map((activity) => <li key={activity.id} className="border-l-2 border-secondary/30 pl-3 text-sm"><p className="font-bold">{activity.type.replaceAll("_", " ")}</p><p className="text-xs text-on-surface-variant">{activity.actorName} · {formatDate(activity.createdAt)}</p>{activity.note && <p className="mt-1 rounded-lg bg-surface-container p-2">{activity.note}</p>}</li>)}</ol></div> : null}
    </div>
  );

  const workflowActions = (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 px-1">
        <div><p className="text-xs font-black uppercase tracking-[0.12em] text-primary">Workflow</p><p className="text-[11px] text-on-surface-variant">{POST_STATUS_LABELS[status]} {live ? "· Live" : "· Belum live"}</p></div>
        {busy && <span className="material-symbols-outlined animate-spin text-lg text-secondary" aria-label="Memproses">progress_activity</span>}
      </div>
      {!locked && <div className="grid grid-cols-2 gap-2"><button type="button" onClick={save} disabled={busy} className="editor-action bg-surface-container text-primary"><span className="material-symbols-outlined mr-1.5 text-lg">save</span>Draft</button><button type="button" onClick={submit} disabled={busy} className="editor-action bg-primary text-on-primary"><span className="material-symbols-outlined mr-1.5 text-lg">rate_review</span>Review</button></div>}
      {isSuper && <button type="button" onClick={publish} disabled={busy} className="editor-action bg-secondary text-on-secondary"><span className="material-symbols-outlined mr-2 text-lg">publish</span>Terbitkan sekarang</button>}
      {isSuper && <details className="group rounded-xl border border-outline-variant/30 bg-surface-container-lowest"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-xs font-bold"><span className="flex items-center gap-2"><span className="material-symbols-outlined text-lg text-secondary">schedule</span>Jadwalkan publikasi</span><span className="material-symbols-outlined text-lg transition group-open:rotate-180">expand_more</span></summary><div className="border-t border-outline-variant/20 p-3"><input aria-label="Jadwal publikasi WIB" type="datetime-local" className="editor-field" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /><button type="button" onClick={schedule} disabled={busy} className="editor-action mt-2 bg-primary text-on-primary">Simpan jadwal</button></div></details>}
      {isSuper && status === "IN_REVIEW" && <button type="button" onClick={() => { const note = window.prompt("Catatan revisi untuk editor"); if (note && postId) mutate(() => returnPostToDraft(postId, version, note), "Review dikembalikan menjadi draft."); }} className="editor-action bg-amber-100 text-amber-900">Kembalikan dengan catatan</button>}
      {isSuper && status === "SCHEDULED" && postId && <button type="button" onClick={() => mutate(() => cancelScheduledPost(postId, version), "Jadwal dibatalkan.")} className="editor-action bg-surface-container text-primary">Batalkan jadwal</button>}
      {isSuper && postId && <details className="group rounded-xl border border-outline-variant/20"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-xs font-bold text-on-surface-variant"><span>Aksi lainnya</span><span className="material-symbols-outlined text-lg transition group-open:rotate-180">expand_more</span></summary><div className="space-y-2 border-t border-outline-variant/20 p-2">{live && <button type="button" onClick={() => window.confirm("Arsipkan dan lepas artikel dari publik?") && mutate(() => unpublishPost(postId, version), "Artikel diarsipkan.")} className="editor-action bg-error/10 text-error">Unpublish / arsipkan</button>}<button type="button" onClick={() => window.confirm("Hapus post secara permanen? Tindakan ini tidak dapat dibatalkan.") && mutate(async () => { const result = await deletePostPermanently(postId, version); if (result.success) router.push("/admin"); return result; }, "Post dihapus permanen.")} className="editor-action text-error">Hapus permanen</button></div></details>}
    </div>
  );

  return (
    <div
      className="min-h-[100dvh] min-w-0 overflow-x-hidden bg-surface-container-low pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-8"
      onInputCapture={() => { hasEditorInteraction.current = true; }}
      onKeyDownCapture={() => { hasEditorInteraction.current = true; }}
      onPointerDownCapture={() => { hasEditorInteraction.current = true; }}
    >
      <input ref={fileInput} type="file" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file && activeFileTarget) void upload(activeFileTarget, file); event.target.value = ""; }} />
      <header className="sticky top-0 z-40 border-b border-outline-variant/25 bg-surface-container-lowest/95 px-3 py-2 backdrop-blur-xl sm:px-5">
        <div className="mx-auto flex max-w-[1500px] items-center gap-2">
          <Link href="/admin" className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-surface-container" aria-label="Kembali ke dashboard"><span className="material-symbols-outlined">arrow_back</span></Link>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{title || "Post baru"}</p><div className="flex flex-wrap items-center gap-x-2 text-[11px] text-on-surface-variant"><span>{POST_STATUS_LABELS[status]}</span><span>{live ? "• Live" : "• Belum live"}</span><span>• {saveState === "saving" ? "Menyimpan…" : saveState === "offline" ? "Offline · lokal saja" : saveState === "conflict" ? "Konflik versi" : savedAt ? `Tersimpan ${formatDate(savedAt)}` : "Belum disimpan"}</span></div></div>
          {postId && <Link href={`/admin/post/${postId}/preview`} target="_blank" className="hidden min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold sm:flex"><span className="material-symbols-outlined">visibility</span>Preview</Link>}
          <button type="button" onClick={() => setPreviewMode((value) => !value)} className="grid size-11 place-items-center rounded-xl sm:hidden" aria-label="Pratinjau"><span className="material-symbols-outlined">visibility</span></button>
          <button type="button" onClick={() => setSheet("actions")} className="grid size-11 place-items-center rounded-xl bg-secondary text-on-secondary md:hidden" aria-label="Buka aksi"><span className="material-symbols-outlined">more_vert</span></button>
        </div>
      </header>

      {recovery && <div className="mx-auto mt-3 flex max-w-5xl flex-wrap items-center justify-between gap-2 rounded-2xl bg-amber-100 px-4 py-3 text-sm text-amber-950"><span>Ada draft lokal yang lebih baru daripada versi server.</span><div><button type="button" onClick={restoreLocal} className="min-h-11 px-3 font-bold">Pulihkan</button><button type="button" onClick={() => { localStorage.removeItem(localKey); setRecovery(null); }} className="min-h-11 px-3">Abaikan</button></div></div>}
      {saveState === "conflict" && <div className="mx-auto mt-3 max-w-5xl rounded-2xl bg-error/10 p-4 text-sm text-error"><p className="font-bold">Versi server lebih baru. Perubahan lokal tidak ditimpa.</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => location.reload()} className="min-h-11 rounded-xl bg-error px-4 font-bold text-white">Muat ulang server</button><button type="button" onClick={() => navigator.clipboard.writeText(JSON.stringify(payload, null, 2))} className="min-h-11 rounded-xl border border-error px-4 font-bold">Salin perubahan lokal</button></div></div>}
      {saveState !== "conflict" && (message || error) && <div aria-live="polite" className={`mx-auto mt-3 max-w-5xl rounded-xl px-4 py-3 text-sm ${error ? "bg-error/10 text-error" : "bg-secondary/10 text-primary"}`}>{error || message}</div>}
      {locked && <div className="mx-auto mt-3 max-w-5xl rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-950">Post berstatus {POST_STATUS_LABELS[status]} dan bersifat read-only untuk ADMIN.</div>}

      <main className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 px-3 py-5 sm:px-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 space-y-4">
          {previewMode ? (
            <article className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm"><div className="p-5 sm:p-10"><p className="text-sm font-bold uppercase tracking-widest text-secondary">{category}</p><h1 className="mt-3 break-words text-3xl font-bold leading-tight sm:text-5xl">{title || "Judul artikel"}</h1><p className="mt-4 text-on-surface-variant">{effectiveExcerpt}</p><p className="mt-3 text-sm">{authorName} · {publishedAt ? formatDate(new Date(publishedAt).toISOString()) : "Belum diterbitkan"}</p><div className="mt-8 space-y-6">{blocks.map((block) => block.type === "text" ? <div key={block.id} className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} /> : block.type === "image" && block.url ? <figure key={block.id}><Image src={block.url} alt={block.altText || ""} width={1200} height={800} className="h-auto w-full rounded-2xl" /><figcaption className="mt-2 text-sm text-on-surface-variant">{block.caption}</figcaption></figure> : <div key={block.id} className="rounded-xl bg-surface-container p-4"><b>{block.title || block.type.toUpperCase()}</b><p className="break-all text-sm">{block.url}</p></div>)}</div></div></article>
          ) : (
            <>
              <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm sm:p-6"><textarea rows={2} value={title} onChange={(event) => setTitle(event.target.value)} disabled={locked} placeholder="Judul artikel…" className="w-full resize-none bg-transparent text-3xl font-bold leading-tight outline-none placeholder:text-on-surface-variant/40 disabled:opacity-60 sm:text-5xl" /><textarea rows={2} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} disabled={locked} placeholder="Ringkasan opsional — otomatis dari isi artikel jika kosong" className="mt-3 w-full resize-none bg-transparent text-base leading-relaxed text-on-surface-variant outline-none" /></div>
              {blocks.length === 0 && !locked && <BlockInserter onAdd={(type) => insertBlock(type, -1)} />}
              {blocks.map((block, index) => <div key={block.id} draggable={!locked} onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => dropBlock(index)} className="space-y-3"><BlockItem block={block} index={index} isFirst={index === 0} isLast={index === blocks.length - 1} isDeleting={deletingBlock === block.id} preview={previews[block.id]} stagedFile={stagedFiles[block.id]} disabled={locked} onUpdate={updateBlock} onMove={moveBlock} onRemove={setDeletingBlock} onCancelDelete={() => setDeletingBlock(null)} onConfirmRemove={(id) => { setBlocks((items) => items.filter((item) => item.id !== id)); setDeletingBlock(null); }} onFileSelect={chooseFile} onFileDrop={(id, file) => void upload(id, file)} /><BlockInserter disabled={locked} onAdd={(type) => insertBlock(type, index)} /></div>)}
            </>
          )}
        </section>

        <aside aria-label="Panel pengaturan post" className="sticky top-20 hidden h-[calc(100dvh-6rem)] min-h-0 self-start overflow-y-auto overscroll-contain rounded-2xl bg-surface-container-lowest shadow-sm [scrollbar-gutter:stable] lg:block">
          <div className="sticky top-0 z-10 border-b border-outline-variant/20 bg-surface-container-lowest/95 p-3 backdrop-blur-xl">
            {workflowActions}
            <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-surface-container p-1">{(["metadata", "seo", "history"] as const).map((tab) => <button key={tab} type="button" onClick={() => setDesktopTab(tab)} className={`min-h-10 rounded-lg px-2 text-[11px] font-bold ${desktopTab === tab ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}>{tab === "history" ? "Riwayat" : tab === "seo" ? "Pratinjau" : "Metadata"}</button>)}</div>
          </div>
          <div className="p-4">{desktopTab === "metadata" ? metadataPanel : desktopTab === "seo" ? seoPanel : historyPanel}</div>
        </aside>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/30 bg-surface-container-lowest/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"><div className="mx-auto grid max-w-xl grid-cols-4 gap-1 py-2"><button type="button" onClick={() => setSheet("metadata")} className="mobile-editor-action"><span className="material-symbols-outlined">tune</span><span>Metadata</span></button><button type="button" onClick={() => setSheet("seo")} className="mobile-editor-action"><span className="material-symbols-outlined">preview</span><span>Pratinjau</span></button><button type="button" onClick={() => setSheet("history")} className="mobile-editor-action"><span className="material-symbols-outlined">history</span><span>Riwayat</span></button><button type="button" onClick={() => setSheet("actions")} className="mobile-editor-action text-secondary"><span className="material-symbols-outlined">publish</span><span>Aksi</span></button></div></nav>

      {sheet && <div className="fixed inset-0 z-50 md:hidden"><button type="button" aria-label="Tutup panel" onClick={closeSheet} className="absolute inset-0 size-full bg-black/45" /><section ref={sheetRef} role="dialog" aria-modal="true" aria-label={sheet === "seo" ? "Pratinjau" : sheet} className="absolute inset-x-0 bottom-0 max-h-[min(82dvh,760px)] overflow-y-auto overscroll-contain rounded-t-3xl bg-surface-container-lowest px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl"><div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-outline-variant" /><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold capitalize">{sheet === "history" ? "Riwayat & Aktivitas" : sheet === "seo" ? "Pratinjau" : sheet}</h2><button type="button" onClick={closeSheet} className="grid size-11 place-items-center rounded-full" aria-label="Tutup"><span className="material-symbols-outlined">close</span></button></div>{sheet === "metadata" ? metadataPanel : sheet === "seo" ? seoPanel : sheet === "history" ? historyPanel : workflowActions}</section></div>}

      {completionDialog && <div className="fixed inset-0 z-[60] grid place-items-center px-4"><button type="button" aria-label="Lanjut editing" onClick={closeCompletionDialog} className="absolute inset-0 size-full bg-black/55 backdrop-blur-sm" /><section ref={completionDialogRef} role="dialog" aria-modal="true" aria-labelledby="completion-dialog-title" aria-describedby="completion-dialog-description" className="relative w-full max-w-md rounded-3xl bg-surface-container-lowest p-6 text-center shadow-2xl sm:p-8"><div className="mx-auto grid size-16 place-items-center rounded-full bg-secondary/15 text-secondary"><span className="material-symbols-outlined text-4xl">check_circle</span></div><h2 id="completion-dialog-title" className="mt-5 text-2xl font-black text-primary">{completionDialog === "published" ? "Artikel telah terbit" : "Draft telah tersimpan"}</h2><p id="completion-dialog-description" className="mt-2 text-sm leading-relaxed text-on-surface-variant">{completionDialog === "published" ? "Artikel sudah tersedia untuk pembaca. Anda dapat kembali mengelola artikel lain atau tetap di editor ini." : "Perubahan draft sudah aman tersimpan. Anda dapat kembali ke laman kelola atau melanjutkan editing."}</p><div className="mt-6 grid gap-2"><Link href="/admin" className="flex min-h-12 items-center justify-center rounded-xl bg-secondary px-5 text-sm font-bold text-on-secondary"><span className="material-symbols-outlined mr-2 text-lg">dashboard</span>Kembali ke laman kelola</Link><button type="button" onClick={closeCompletionDialog} className="min-h-12 rounded-xl bg-surface-container px-5 text-sm font-bold text-primary">Lanjut editing</button></div></section></div>}
    </div>
  );
}

function BlockInserter({ onAdd, disabled = false }: { onAdd: (type: PostBlockType) => void; disabled?: boolean }) {
  return <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-lowest/60 p-2" aria-label="Tambah blok">{(["text", "image", "video", "pdf", "link"] as const).map((type) => <button key={type} type="button" onClick={() => onAdd(type)} disabled={disabled} className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-3 text-xs font-bold capitalize text-on-surface-variant hover:bg-surface-container disabled:opacity-40"><span className="material-symbols-outlined text-lg">add</span>{type}</button>)}</div>;
}
