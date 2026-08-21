"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { memo, useMemo } from "react";
import { getYouTubeEmbedUrl } from "@/lib/posts/domain";
import type { PostBlock } from "@/lib/posts/types";

const TiptapEditor = dynamic(
  () => import("./TiptapEditor").then((module) => module.TiptapEditor),
  { ssr: false, loading: () => <div className="mt-2 h-52 animate-pulse rounded-2xl bg-surface-container-low" /> },
);

type Props = {
  block: PostBlock;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isDeleting: boolean;
  preview?: string;
  stagedFile?: File;
  disabled?: boolean;
  onUpdate: (id: string, data: Partial<PostBlock>) => void;
  onRemove: (id: string) => void;
  onConfirmRemove: (id: string) => void;
  onCancelDelete: () => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onFileSelect: (id: string) => void;
  onFileDrop?: (id: string, file: File) => void;
};

const labels = { text: "Teks", image: "Gambar", video: "Video", pdf: "PDF", link: "Tautan" } as const;
const icons = { text: "notes", image: "image", video: "smart_display", pdf: "picture_as_pdf", link: "link" } as const;

function BlockItemComponent({
  block,
  index,
  isFirst,
  isLast,
  isDeleting,
  preview,
  stagedFile,
  disabled = false,
  onUpdate,
  onRemove,
  onConfirmRemove,
  onCancelDelete,
  onMove,
  onFileSelect,
  onFileDrop,
}: Props) {
  const youtubeEmbed = useMemo(() => block.type === "video" ? getYouTubeEmbedUrl(block.url || "") : null, [block.type, block.url]);
  const inputClass = "min-h-11 w-full rounded-xl border border-outline-variant/35 bg-surface-container-lowest px-4 py-3 text-sm text-primary outline-none transition focus:border-secondary disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm transition sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-secondary">
          <span className="material-symbols-outlined text-xl" aria-hidden>{icons[block.type]}</span>
          <span className="truncate">{labels[block.type]}</span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-outline-variant/25 bg-surface-container-lowest p-1">
          <button type="button" onClick={() => onMove(index, "up")} disabled={disabled || isFirst} className="grid size-11 place-items-center rounded-full hover:bg-surface-container disabled:opacity-30" aria-label="Naikkan blok">
            <span className="material-symbols-outlined" aria-hidden>arrow_upward</span>
          </button>
          <button type="button" onClick={() => onMove(index, "down")} disabled={disabled || isLast} className="grid size-11 place-items-center rounded-full hover:bg-surface-container disabled:opacity-30" aria-label="Turunkan blok">
            <span className="material-symbols-outlined" aria-hidden>arrow_downward</span>
          </button>
          {isDeleting ? (
            <>
              <button type="button" onClick={() => onConfirmRemove(block.id)} className="min-h-11 rounded-full bg-error px-4 text-xs font-bold text-white">Hapus</button>
              <button type="button" onClick={onCancelDelete} className="min-h-11 rounded-full px-4 text-xs font-bold">Batal</button>
            </>
          ) : (
            <button type="button" onClick={() => onRemove(block.id)} disabled={disabled} className="grid size-11 place-items-center rounded-full text-error hover:bg-error/10 disabled:opacity-30" aria-label="Hapus blok">
              <span className="material-symbols-outlined" aria-hidden>delete</span>
            </button>
          )}
        </div>
      </header>

      {block.type === "text" && <TiptapEditor content={block.content} onChange={(content) => onUpdate(block.id, { content })} readOnly={disabled} />}

      {(block.type === "image" || block.type === "pdf") && (
        <div className="space-y-3">
          <input className={inputClass} value={block.title || ""} onChange={(event) => onUpdate(block.id, { title: event.target.value })} placeholder="Judul media (opsional)" disabled={disabled} />
          <div
            className="overflow-hidden rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files[0];
              if (!disabled && file) onFileDrop?.(block.id, file);
            }}
          >
            {block.type === "image" && (preview || block.url) ? (
              <Image src={preview || block.url || ""} alt={block.altText || block.title || "Pratinjau gambar"} width={1200} height={800} unoptimized={Boolean(preview?.startsWith("blob:"))} className="max-h-[28rem] w-full object-contain" />
            ) : block.type === "pdf" && (stagedFile || block.url) ? (
              <div className="flex min-h-44 flex-col items-center justify-center gap-2 p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-secondary" aria-hidden>picture_as_pdf</span>
                <p className="max-w-full break-all text-sm font-bold">{stagedFile?.name || "Dokumen PDF terlampir"}</p>
                {block.url && <a href={block.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-secondary underline">Buka pratinjau</a>}
              </div>
            ) : (
              <div className="flex min-h-44 flex-col items-center justify-center gap-2 p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-secondary" aria-hidden>{block.type === "image" ? "add_photo_alternate" : "upload_file"}</span>
                <p className="font-bold">Tarik file ke sini</p>
                <p className="text-xs text-on-surface-variant">atau gunakan pemilih file</p>
              </div>
            )}
            <div className="border-t border-outline-variant/20 p-3 text-center">
              <button type="button" onClick={() => onFileSelect(block.id)} disabled={disabled} className="min-h-11 rounded-full bg-secondary px-5 text-xs font-bold text-on-secondary disabled:opacity-50">
                {block.url || preview ? "Ganti file" : "Pilih file"}
              </button>
            </div>
          </div>
          {block.type === "image" && <input className={inputClass} value={block.altText || ""} onChange={(event) => onUpdate(block.id, { altText: event.target.value })} placeholder="Teks alternatif gambar (wajib sebelum terbit)" disabled={disabled} />}
          <textarea className={inputClass} rows={2} value={block.caption || ""} onChange={(event) => onUpdate(block.id, { caption: event.target.value })} placeholder="Keterangan media (opsional)" disabled={disabled} />
        </div>
      )}

      {block.type === "video" && (
        <div className="space-y-3">
          <input className={inputClass} value={block.title || ""} onChange={(event) => onUpdate(block.id, { title: event.target.value })} placeholder="Judul video (opsional)" disabled={disabled} />
          <input className={inputClass} value={block.url || ""} onChange={(event) => onUpdate(block.id, { url: event.target.value })} placeholder="URL YouTube" inputMode="url" disabled={disabled} />
          {youtubeEmbed ? (
            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              <iframe className="size-full" src={youtubeEmbed} title={block.title || "Pratinjau YouTube"} allowFullScreen />
            </div>
          ) : block.url ? <p className="text-sm text-error">Gunakan URL video YouTube yang valid.</p> : null}
          <textarea className={inputClass} rows={2} value={block.caption || ""} onChange={(event) => onUpdate(block.id, { caption: event.target.value })} placeholder="Keterangan video (opsional)" disabled={disabled} />
        </div>
      )}

      {block.type === "link" && (
        <div className="space-y-3">
          <input className={inputClass} value={block.title || ""} onChange={(event) => onUpdate(block.id, { title: event.target.value })} placeholder="Judul tautan" disabled={disabled} />
          <input className={inputClass} value={block.url || ""} onChange={(event) => onUpdate(block.id, { url: event.target.value })} placeholder="https://contoh.id/sumber" inputMode="url" disabled={disabled} />
          <textarea className={inputClass} rows={2} value={block.caption || ""} onChange={(event) => onUpdate(block.id, { caption: event.target.value })} placeholder="Keterangan tautan (opsional)" disabled={disabled} />
        </div>
      )}
    </article>
  );
}

export const BlockItem = memo(BlockItemComponent);
