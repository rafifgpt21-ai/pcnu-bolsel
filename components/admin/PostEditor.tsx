'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TiptapEditor } from './TiptapEditor';
import { savePost } from '@/lib/actions/post';

type Block = {
  id: string;
  type: 'text' | 'image' | 'video' | 'pdf';
  content: string;
  url?: string;
  title?: string;
  caption?: string;
  isLocked?: boolean;
};

const CATEGORIES = ['Buku', 'Jurnal', 'Artikel', 'Opini'];

export const PostEditor = ({ initialData }: { initialData?: any }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || 'Buku');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');
  const [blocks, setBlocks] = useState<Block[]>(initialData?.blocks || []);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isMobileMetaOpen, setIsMobileMetaOpen] = useState(false);

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: '',
      url: '',
      isLocked: false,
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    if (confirm('Hapus balok ini?')) {
      const newBlocks = [...blocks];
      newBlocks.splice(index, 1);
      setBlocks(newBlocks);
    }
  };

  const handleSave = async (status: 'Published' | 'Draft') => {
    if (!title.trim()) {
      alert('Judul tidak boleh kosong!');
      return;
    }
    startTransition(async () => {
      const result = await savePost({
        id: initialData?.id,
        title,
        category,
        thumbnail,
        status,
        blocks: blocks.map((b) => ({
          id: b.id,
          type: b.type,
          content: b.content,
          url: b.url,
          title: b.title || '',
          caption: b.caption || '',
          isLocked: b.isLocked ?? false,
        })),
      });
      if (result.success) {
        router.push('/admin');
        router.refresh();
      } else {
        alert(result.error || 'Gagal menyimpan');
      }
    });
  };

  return (
    <div className="min-h-screen">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[60vw] h-[60vh] bg-secondary-fixed opacity-10 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vh] bg-primary-fixed opacity-10 blur-[140px] rounded-full" />
      </div>

      {/* ════════════════════════════════════════
          Mobile / Intermediate — Fixed top bar (below main nav)
          Visible on: xs → md → lg-1  (hidden on lg+)
          ════════════════════════════════════════ */}
      <div className="lg:hidden fixed top-[80px] inset-x-0 z-30">
        {/* Primary row */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant/15 shadow-sm">
          {/* Back */}
          <Link
            href="/admin"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container border border-outline-variant/20 text-secondary hover:bg-surface-container-high transition-colors shrink-0"
            title="Kembali"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>

          {/* Title + label */}
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-label font-bold tracking-[0.2em] text-secondary uppercase leading-none mb-0.5">
              {initialData?.id ? 'Edit Postingan' : 'Postingan Baru'}
            </p>
            <p className="text-sm font-headline font-bold text-primary truncate leading-tight">
              {title || 'Tanpa Judul'}
            </p>
          </div>

          {/* Expand metadata toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMetaOpen(!isMobileMetaOpen)}
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors shrink-0 ${
              isMobileMetaOpen
                ? 'bg-secondary/10 border-secondary/30 text-secondary'
                : 'bg-surface-container border-outline-variant/20 text-on-surface-variant'
            }`}
            title="Pengaturan"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMobileMetaOpen ? 'expand_less' : 'tune'}
            </span>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSave('Draft')}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all border border-outline-variant/20 disabled:opacity-50 text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span className="text-[11px] font-bold uppercase tracking-wide hidden sm:inline">Draft</span>
            </button>
            <button
              onClick={() => handleSave('Published')}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-on-secondary hover:bg-primary transition-all shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span className="text-[11px] font-bold uppercase tracking-wide hidden sm:inline">Publish</span>
            </button>
          </div>
        </div>

        {/* Expandable metadata drawer */}
        {isMobileMetaOpen && (
          <div className="bg-surface-container-lowest/98 backdrop-blur-xl border-b border-outline-variant/20 shadow-lg px-4 py-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Title input */}
              <div>
                <label className="text-[9px] font-label font-bold tracking-[0.2em] text-secondary/70 uppercase mb-1.5 block">Judul</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tulis judul…"
                  className="w-full bg-surface-container/60 border border-outline-variant/20 rounded-xl px-3 py-2 text-primary font-headline font-bold text-sm focus:outline-none focus:border-secondary/50 transition-all placeholder:text-on-surface-variant/30"
                />
              </div>
              {/* Category */}
              <div>
                <label className="text-[9px] font-label font-bold tracking-[0.2em] text-secondary/70 uppercase mb-1.5 block">Kategori</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-container/60 border border-outline-variant/20 rounded-xl px-3 py-2 text-primary text-sm font-medium focus:outline-none focus:border-secondary/50 transition-all appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40 text-[16px]">expand_more</span>
                </div>
              </div>
            </div>
            {/* Thumbnail compact */}
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 ${
                thumbnail ? 'border-secondary/30' : 'border-outline-variant/20 bg-surface-container/50'
              }`}>
                {thumbnail
                  ? <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  : <span className="material-symbols-outlined text-secondary/30 text-lg">add_photo_alternate</span>
                }
              </div>
              <div className="flex gap-2">
                <button type="button" className="px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary text-[11px] font-bold transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">{thumbnail ? 'edit' : 'upload'}</span>
                  {thumbnail ? 'Ubah' : 'Pilih Thumbnail'}
                </button>
                {thumbnail && (
                  <button type="button" onClick={() => setThumbnail('')} className="px-3 py-1.5 rounded-lg bg-error/5 hover:bg-error/10 text-error text-[11px] font-bold transition-colors flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main editor area (right padding to avoid sidebar overlap on lg+) ── */}
      <main className="min-h-screen px-4 sm:px-8 xl:px-14 pb-32 lg:pr-80 xl:pr-88
        pt-[130px] lg:pt-6">

        {/* ── Blocks ── */}
        <div className="space-y-6">
          {blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest/40">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 shadow-inner">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/50">
                  article
                </span>
              </div>
              <p className="font-headline font-bold text-primary/60 mb-1">Belum ada konten</p>
              <p className="text-xs text-on-surface-variant/50">
                Tambahkan balok melalui toolbar di bawah
              </p>
            </div>
          )}

          {blocks.map((block, i) => (
            <div
              key={block.id}
              className="group relative bg-surface-container-lowest/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-outline-variant/15 hover:border-outline-variant/30 hover:shadow-md transition-all"
            >
              {/* Block control row */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">
                    {block.type === 'text' && 'notes'}
                    {block.type === 'image' && 'image'}
                    {block.type === 'video' && 'smart_display'}
                    {block.type === 'pdf' && 'picture_as_pdf'}
                  </span>
                  Balok {block.type}
                </span>

                {/* Action pills */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-surface-container-lowest border border-outline-variant/20 shadow-sm rounded-full px-1 py-1">
                  <button
                    onClick={() => moveBlock(i, 'up')}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-secondary hover:bg-surface-container-low transition-colors"
                    title="Naik"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                  <button
                    onClick={() => moveBlock(i, 'down')}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-secondary hover:bg-surface-container-low transition-colors"
                    title="Turun"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                  </button>
                  <div className="w-px h-4 bg-outline-variant/30 mx-0.5" />
                  <button
                    onClick={() => removeBlock(i)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-error hover:bg-error/10 transition-colors"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Text block */}
              {block.type === 'text' && (
                <TiptapEditor
                  content={block.content}
                  onChange={(html) => {
                    const nb = [...blocks];
                    nb[i].content = html;
                    setBlocks(nb);
                  }}
                />
              )}

              {/* Image / PDF block */}
              {(block.type === 'image' || block.type === 'pdf') && (
                <div className="space-y-4">
                  <input
                    placeholder="Judul Konten (Opsional)..."
                    value={block.title || ''}
                    onChange={(e) => {
                      const nb = [...blocks];
                      nb[i].title = e.target.value;
                      setBlocks(nb);
                    }}
                    className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-xl py-2 px-4 text-primary font-headline font-bold focus:outline-none focus:border-secondary transition-colors"
                  />
                  <div className="border-2 border-dashed border-outline-variant/40 bg-primary-container/10 hover:bg-primary-container/20 transition-colors cursor-pointer rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 bg-surface-container-lowest shadow-sm rounded-full flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-3xl text-secondary">
                        {block.type === 'pdf' ? 'description' : 'add_photo_alternate'}
                      </span>
                    </div>
                    <p className="text-primary font-headline font-bold mb-1">
                      Unggah {block.type === 'image' ? 'Gambar' : 'Dokumen PDF'}
                    </p>
                    <p className="text-on-surface-variant text-xs mb-4">Pilih file atau seret ke sini.</p>
                    <button className="bg-primary text-on-primary px-5 py-1.5 rounded-full font-headline font-semibold text-xs hover:scale-105 transition-transform shadow-sm">
                      Pilih File
                    </button>
                  </div>
                  <textarea
                    placeholder="Keterangan atau Sumber (Opsional)..."
                    value={block.caption || ''}
                    onChange={(e) => {
                      const nb = [...blocks];
                      nb[i].caption = e.target.value;
                      setBlocks(nb);
                    }}
                    rows={2}
                    className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-xl py-2 px-4 text-on-surface-variant text-sm focus:outline-none focus:border-secondary transition-colors resize-none"
                  />
                </div>
              )}

              {/* Video block */}
              {block.type === 'video' && (
                <div className="space-y-4">
                  <input
                    placeholder="Judul Video (Opsional)..."
                    value={block.title || ''}
                    onChange={(e) => {
                      const nb = [...blocks];
                      nb[i].title = e.target.value;
                      setBlocks(nb);
                    }}
                    className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-xl py-2 px-4 text-primary font-headline font-bold focus:outline-none focus:border-secondary transition-colors"
                  />
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">link</span>
                    <input
                      placeholder="Masukkan URL YouTube..."
                      value={block.url || ''}
                      onChange={(e) => {
                        const nb = [...blocks];
                        nb[i].url = e.target.value;
                        setBlocks(nb);
                      }}
                      className="w-full bg-surface-container-lowest/50 border border-outline-variant/50 rounded-xl py-3.5 pl-12 pr-4 text-primary focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <textarea
                    placeholder="Keterangan Video (Opsional)..."
                    value={block.caption || ''}
                    onChange={(e) => {
                      const nb = [...blocks];
                      nb[i].caption = e.target.value;
                      setBlocks(nb);
                    }}
                    rows={2}
                    className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-xl py-2 px-4 text-on-surface-variant text-sm focus:outline-none focus:border-secondary transition-colors resize-none"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* ── Add-block toolbar — fixed at bottom center (desktop) ── */}
      <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-30 items-center gap-2 bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/20 shadow-2xl rounded-full px-5 py-3">
        <span className="text-[10px] font-label font-bold text-on-surface-variant/60 uppercase tracking-widest mr-2">
          + Tambah
        </span>
        {[
          { type: 'text' as const, icon: 'notes', label: 'Teks' },
          { type: 'image' as const, icon: 'image', label: 'Gambar' },
          { type: 'video' as const, icon: 'smart_display', label: 'Video' },
          { type: 'pdf' as const, icon: 'picture_as_pdf', label: 'PDF' },
        ].map((item, idx, arr) => (
          <div key={item.type} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addBlock(item.type)}
              className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-secondary px-3 py-1.5 rounded-full hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
              {item.label}
            </button>
            {idx < arr.length - 1 && <div className="w-px h-5 bg-outline-variant/40" />}
          </div>
        ))}
      </div>

      {/* ── Mobile FAB ── */}
      <div className="md:hidden fixed bottom-8 right-6 z-30 flex flex-col items-end gap-3">
        {isAddMenuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]" onClick={() => setIsAddMenuOpen(false)} />
            <div className="absolute bottom-20 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/30 shadow-2xl rounded-3xl p-3 flex flex-col gap-1 min-w-[200px]">
              {[
                { type: 'text' as const, icon: 'notes', label: 'Teks Baru' },
                { type: 'image' as const, icon: 'image', label: 'Gambar' },
                { type: 'video' as const, icon: 'smart_display', label: 'Video YouTube' },
                { type: 'pdf' as const, icon: 'picture_as_pdf', label: 'Dokumen PDF' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => { addBlock(item.type); setIsAddMenuOpen(false); }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl hover:bg-secondary/10 text-primary hover:text-secondary transition-all group"
                >
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <span className="font-headline font-bold text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
        <button
          type="button"
          onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
          className={`z-50 w-14 h-14 rounded-full backdrop-blur-xl border-2 shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isAddMenuOpen
              ? 'rotate-45 bg-error/10 border-error/40 text-error'
              : 'bg-secondary/10 border-secondary/40 text-secondary'
          }`}
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      {/* ════════════════════════════════════════
          Floating Island Sidebar — fixed, follows scroll
          ════════════════════════════════════════ */}
      <div className="hidden lg:block fixed top-[88px] right-4 xl:right-6 z-20 w-72 xl:w-80">
        <div className="bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/15 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-5 flex flex-col gap-4">

            {/* Header: back button + title */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container border border-outline-variant/20 text-secondary hover:bg-surface-container-high transition-colors shrink-0"
                title="Kembali ke Dashboard"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </Link>
              <div className="min-w-0">
                <p className="font-label text-[9px] font-bold tracking-[0.2em] text-secondary uppercase">
                  {initialData?.id ? 'Edit Postingan' : 'Postingan Baru'}
                </p>
                <h2 className="text-sm font-headline font-bold text-primary truncate">
                  {title || 'Tanpa Judul'}
                </h2>
              </div>
            </div>

            <div className="border-t border-outline-variant/15" />

            {/* Title */}
            <div>
              <label className="text-[9px] font-label font-bold tracking-[0.2em] text-secondary/70 uppercase mb-1.5 block">
                Judul
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tulis judul…"
                className="w-full bg-surface-container/60 border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-primary font-headline font-bold text-sm focus:outline-none focus:border-secondary/50 transition-all placeholder:text-on-surface-variant/30"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-[9px] font-label font-bold tracking-[0.2em] text-secondary/70 uppercase mb-1.5 block">
                Kategori
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-container/60 border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-primary text-sm font-medium focus:outline-none focus:border-secondary/50 transition-all appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40 text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="text-[9px] font-label font-bold tracking-[0.2em] text-secondary/70 uppercase mb-2 block">
                Thumbnail
              </label>
              <div className="flex gap-3 items-start">
                <div
                  className={`shrink-0 w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                    thumbnail
                      ? 'border-secondary/30 bg-surface-container-low'
                      : 'border-outline-variant/20 bg-surface-container/50'
                  }`}
                >
                  {thumbnail ? (
                    <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-secondary/30 text-xl">add_photo_alternate</span>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">{thumbnail ? 'edit' : 'upload'}</span>
                    {thumbnail ? 'Ubah' : 'Pilih Gambar'}
                  </button>
                  {thumbnail && (
                    <button
                      type="button"
                      onClick={() => setThumbnail('')}
                      className="w-full py-2 px-3 rounded-lg bg-error/5 hover:bg-error/10 text-error text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                      Hapus
                    </button>
                  )}
                  <p className="text-[9px] text-on-surface-variant/40 leading-tight pt-0.5">Rasio 1:1 disarankan.</p>
                </div>
              </div>
            </div>

            {/* Stats + status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-secondary/60">layers</span>
                <span className="text-[11px] font-bold text-primary/70">{blocks.length} Balok</span>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                initialData?.status === 'Published'
                  ? 'bg-secondary/5 border-secondary/20 text-secondary'
                  : 'bg-on-surface-variant/5 border-outline-variant/20 text-on-surface-variant/60'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${initialData?.status === 'Published' ? 'bg-secondary' : 'bg-on-surface-variant/40'}`} />
                {initialData?.status || 'Draft'}
              </div>
            </div>

            <div className="border-t border-outline-variant/15" />

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSave('Draft')}
                disabled={isPending}
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all border border-outline-variant/20 disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px] text-on-surface-variant">save</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  {isPending ? '…' : 'Draft'}
                </span>
              </button>
              <button
                onClick={() => handleSave('Published')}
                disabled={isPending}
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-secondary text-on-secondary hover:bg-primary transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">publish</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {isPending ? '…' : 'Publish'}
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
