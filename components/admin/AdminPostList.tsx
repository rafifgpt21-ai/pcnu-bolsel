'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { deletePost } from '@/lib/actions/post';
import { motion, AnimatePresence } from 'framer-motion';

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export function AdminPostList({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'Published' | 'Draft'>('all');
  const [isPending, startTransition] = useTransition();
  const [deleteModal, setDeleteModal] = useState<{ id: string, title: string } | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Post; direction: 'asc' | 'desc' }>({
    key: 'updatedAt',
    direction: 'desc',
  });

  const sortOptions = [
    { label: 'Terbaru Diubah', key: 'updatedAt', direction: 'desc', icon: 'schedule' },
    { label: 'Terlama Diubah', key: 'updatedAt', direction: 'asc', icon: 'history' },
    { label: 'Judul A-Z', key: 'title', direction: 'asc', icon: 'sort_by_alpha' },
    { label: 'Judul Z-A', key: 'title', direction: 'desc', icon: 'sort_by_alpha' },
  ] as const;

  const handleSort = (key: keyof Post, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    setIsSortOpen(false);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    const valA = a[key];
    const valB = b[key];

    if (valA < valB) {
      return direction === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredPosts = sortedPosts.filter((post) => {
    const matchSearch = post.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = activeTab === 'all' || post.status === activeTab;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string, title: string) => {
    setDeleteModal({ id, title });
  };

  const confirmDelete = () => {
    if (!deleteModal) return;
    const { id } = deleteModal;
    setDeleteModal(null);

    startTransition(async () => {
      const result = await deletePost(id);
      if (result.success) {
        setPosts(posts.filter((p) => p.id !== id));
      } else {
        alert(result.error || 'Gagal menghapus');
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const tabs = [
    { key: 'all' as const, label: 'Semua Karya' },
    { key: 'Published' as const, label: 'Published' },
    { key: 'Draft' as const, label: 'Draft' },
  ];

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-24">
      {/* 1. Header Section - Hidden on Mobile to save space */}
      <div className="hidden md:block relative pt-12 pb-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-surface-container-low/50 to-transparent" />
        <div className="absolute top-0 right-0 -z-10 opacity-20 blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2">
           <div className="w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary-fixed rounded-full" />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/5">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Admin Panel</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-black text-primary tracking-tight">
                Kelola <span className="text-secondary italic">Karya</span>
              </h1>
              <p className="text-on-surface-variant font-medium opacity-70">
                Manajemen konten artikel, berita, dan khazanah literasi.
              </p>
            </div>

            <Link href="/admin/post/new" className="hidden md:block">
              <button className="group relative flex items-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all duration-300">
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-500">add</span>
                <span>Tambah Karya Baru</span>
                <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-12 pt-6 md:pt-0">
        {/* Mobile Title (Compact) */}
        <div className="md:hidden mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-headline font-black text-primary tracking-tight">
            Kelola <span className="text-secondary italic">Karya</span>
          </h1>
          <div className="px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/5 text-[8px] font-bold tracking-widest text-on-surface-variant uppercase">
            Admin
          </div>
        </div>
        {/* 2. Sticky Kontrol */}
        <div className="sticky top-16 md:top-20 z-30 mb-4 md:mb-8 p-1.5 md:p-2 rounded-3xl md:rounded-4xl bg-surface-container-low/90 backdrop-blur-xl border border-outline-variant/10 shadow-lg shadow-black/5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-0.5 overflow-x-auto w-full lg:w-auto p-0.5 hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap
                    ${activeTab === tab.key
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'text-on-surface-variant hover:text-primary'
                    }`}
                >
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeTabAdmin"
                      className="absolute inset-0 bg-primary rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex items-center gap-3 w-full lg:w-auto pr-2">
              <div className="relative flex-1 lg:w-80 group">
                <input
                  type="text"
                  placeholder="Cari karya anda..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface-container-highest/50 border border-outline-variant/10 rounded-full py-3 md:py-4 pl-10 md:pl-12 pr-6 text-xs md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-on-surface-variant/40"
                />
                <span className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-lg md:text-xl">
                  search
                </span>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-outline-variant/10 transition-all relative
                    ${isSortOpen ? 'bg-primary text-on-primary' : 'bg-surface-container-highest/50 text-on-surface-variant hover:border-primary/30'}`}
                  title="Opsi Pengurutan"
                >
                  <span className={`material-symbols-outlined transition-transform duration-500 text-lg md:text-xl ${isSortOpen ? 'rotate-180' : ''}`}>
                    filter_list
                  </span>
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsSortOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-64 bg-surface-container-low/95 backdrop-blur-2xl border border-outline-variant/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          {sortOptions.map((opt) => {
                            const isActive = sortConfig.key === opt.key && sortConfig.direction === opt.direction;
                            return (
                              <button
                                key={`${opt.key}-${opt.direction}`}
                                onClick={() => handleSort(opt.key as keyof Post, opt.direction)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all
                                  ${isActive 
                                    ? 'bg-primary text-on-primary' 
                                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                                  }`}
                              >
                                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-secondary' : 'opacity-40'}`}>
                                  {opt.icon}
                                </span>
                                <span className="uppercase tracking-widest">{opt.label}</span>
                                {isActive && (
                                  <span className="material-symbols-outlined ml-auto text-[16px]">check_circle</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Area List Karya */}
        <div className={`space-y-4 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>

          <AnimatePresence mode="popLayout" initial={false}>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="group relative bg-surface-container-lowest border border-outline-variant/10 rounded-2xl md:rounded-3xl p-3 md:p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
              >
                <div className="flex flex-row items-center gap-3 md:gap-6">
                  {/* Icon / Category Thumbnail */}
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-500 shrink-0">
                    <span className="material-symbols-outlined text-lg md:text-3xl">
                      {post.category === 'Berita' ? 'newspaper' : 'article'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                      <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-secondary truncate">{post.category}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant/30 shrink-0" />
                      <span className="text-[7px] md:text-[10px] font-bold text-on-surface-variant opacity-60 truncate">{formatDate(post.updatedAt)}</span>
                    </div>
                    <Link href={`/admin/post/${post.id}`}>
                      <h3 className="text-sm md:text-xl font-headline font-bold text-on-surface group-hover:text-primary transition-colors leading-tight line-clamp-1">
                        {post.title}
                      </h3>
                    </Link>
                    <div className="flex md:hidden mt-1.5">
                       <div className={`px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest
                        ${post.status === 'Published'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/10'
                        }`}>
                        {post.status}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 md:gap-6 shrink-0">
                    {/* Status Badge (Desktop) */}
                    <div className={`hidden md:block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm
                      ${post.status === 'Published'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/10'
                      }`}>
                      {post.status}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 md:gap-2">
                       <Link
                        href={`/post/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-surface-container-low text-on-surface-variant hover:bg-secondary hover:text-on-secondary transition-all duration-500 shadow-sm"
                        title="Lihat Pratinjau"
                      >
                        <span className="material-symbols-outlined text-sm md:text-lg">visibility</span>
                      </Link>
                       <Link
                        href={`/admin/post/${post.id}`}
                        className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-surface-container-low text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-500 shadow-sm"
                        title="Edit Konten"
                      >
                        <span className="material-symbols-outlined text-sm md:text-lg">edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-surface-container-low text-on-surface-variant hover:bg-error hover:text-on-error transition-all duration-500 shadow-sm"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-sm md:text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredPosts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center bg-surface-container-lowest rounded-4xl border border-dashed border-outline-variant/30"
            >
              <div className="inline-flex w-24 h-24 items-center justify-center rounded-4xl bg-surface-container-low mb-6 text-outline-variant/40">
                <span className="material-symbols-outlined text-5xl">inventory_2</span>
              </div>
              <h3 className="text-2xl font-headline font-black text-primary mb-2">
                {search ? 'Pencarian Nihil' : 'Belum Ada Jejak'}
              </h3>
              <p className="text-sm text-on-surface-variant/60 font-medium max-w-sm mx-auto">
                {search
                  ? `Kata kunci "${search}" tidak ditemukan di lemari arsip kami.`
                  : 'Anda belum melahirkan karya apapun. Mari mulai goreskan tinta sejarah!'
                }
              </p>
              {!search && (
                <Link href="/admin/post/new" className="inline-block mt-8">
                  <button className="px-8 py-4 bg-primary text-on-primary rounded-full font-bold text-xs tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                    Mulai Berkarya
                  </button>
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <Link href="/admin/post/new" className="md:hidden fixed bottom-10 right-8 z-50">
        <button className="w-16 h-16 rounded-2xl bg-primary text-on-primary shadow-2xl flex items-center justify-center overflow-hidden active:scale-95 transition-all">
          <span className="material-symbols-outlined text-3xl">add</span>
          <div className="absolute inset-0 bg-white/20 opacity-0 active:opacity-100 transition-opacity" />
        </button>
      </Link>

      {/* 3. Custom Modal Delete */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal(null)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-md bg-surface-container-lowest rounded-4xl p-10 shadow-2xl border border-outline-variant/20 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 text-error">
                <span className="material-symbols-outlined text-9xl">delete</span>
              </div>
              
              <div className="relative flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-4xl bg-error/10 flex items-center justify-center text-error mb-8">
                  <span className="material-symbols-outlined text-4xl">warning</span>
                </div>
                
                <h3 className="text-2xl font-headline font-black text-on-surface mb-4">Hapus Permanen?</h3>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-10">
                  Anda akan menghapus <span className="text-primary font-bold">"{deleteModal.title}"</span>. Tindakan ini merupakan langkah akhir dan tidak dapat dikembalikan.
                </p>
                
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={confirmDelete}
                    className="w-full py-4 rounded-full bg-error text-on-error font-bold text-xs tracking-widest uppercase shadow-lg shadow-error/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Ya, Hapus Karya
                  </button>
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="w-full py-4 rounded-full border border-outline-variant/30 text-on-surface-variant font-bold text-xs tracking-widest uppercase hover:bg-surface-container-high transition-all"
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
