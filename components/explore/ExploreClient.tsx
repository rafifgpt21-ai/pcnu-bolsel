"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicPost } from "@/lib/posts/types";
import { resetExploreSearch } from "@/lib/ui/search";

interface ExploreClientProps {
  initialPosts: PublicPost[];
}

const categories = ["Semua", "Berita"];

export default function ExploreClient({ initialPosts }: ExploreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "Semua";
  const currentSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);

  const [previousSearch, setPreviousSearch] = useState(currentSearch);
  // Sync back/forward navigation without an effect that overwrites typing.
  if (previousSearch !== currentSearch) {
    setPreviousSearch(currentSearch);
    setSearchInput(currentSearch);
  }

  const handleFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "Semua") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    startTransition(() => {
      router.push(`/explore?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`/explore?${params.toString()}`, { scroll: false });
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getIcon = (cat: string) => {
    switch (cat) {
      case "Semua": return "grid_view";
      case "Berita": return "newspaper";
      default: return "category";
    }
  };

  return (
    <div className="public-ui min-h-screen bg-surface-container-lowest selection:bg-secondary/30">
      {/* Header — simplified, no Framer Motion */}
      <header className="relative pt-6 md:pt-32 pb-6 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-surface-container-low/50 to-transparent" />
        {/* Decorative blob — hidden on mobile to save GPU */}
        <div className="hidden md:block absolute top-0 right-0 -z-10 opacity-30 blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2">
           <div className="w-[600px] h-[600px] bg-primary-fixed rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-12 text-center lg:text-left">
            {/* Title block — hidden on mobile (search bar is enough) */}
            <div className="sr-only md:not-sr-only md:flex min-w-0 flex-col space-y-3 md:space-y-6 max-w-2xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-surface-container-high border border-outline-variant/5 shadow-sm w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-label text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase">
                  Khazanah Digital
                </span>
              </div>
              
              <h1 className="text-2xl md:text-7xl font-headline font-black text-primary leading-tight tracking-tight">
                Jelajah <span className="text-public-accent italic">PCNU Bolsel</span>
              </h1>
              
              <p className="text-base md:text-lg text-on-surface-variant font-medium max-w-lg mx-auto lg:mx-0 opacity-90">
                Wawasan transformatif dari keluarga besar PCNU.
              </p>
            </div>

            {/* Search Form */}
            <form 
              onSubmit={handleSearch}
              role="search" aria-label="Cari di Jelajah" aria-busy={isPending}
              className="relative w-full lg:max-w-md group"
            >
              <div className="relative overflow-hidden rounded-full p-0.5 bg-surface-container-highest border border-outline-variant/10 focus-within:ring-4 focus-within:ring-secondary/10 transition-all duration-300 shadow-md shadow-black/5">
                <input
                  type="search"
                  aria-label="Kata kunci pencarian"
                  enterKeyHint="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari khazanah..."
                  className="min-w-0 min-h-12 w-full bg-transparent border-none rounded-full py-3 md:py-5 pl-11 md:pl-14 pr-16 text-on-surface font-semibold focus:ring-0 placeholder:text-on-surface-variant/80 text-base md:text-lg"
                />
                <span aria-hidden="true" className="material-symbols-outlined absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/80 group-focus-within:text-public-accent transition-colors text-lg md:text-2xl font-light">
                  search
                </span>
                <button type="submit" aria-label="Cari artikel" disabled={isPending} className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-primary text-white disabled:opacity-60"><span aria-hidden="true" className="material-symbols-outlined">arrow_forward</span></button>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Category Navigation — CSS only, no motion */}
      <nav aria-label="Kategori artikel" className="sticky top-[var(--site-header-height)] z-30 w-full mb-4 md:mb-16">
        {/* Mobile: solid background, no blur. Desktop: transparent */}
        <div className="relative flex items-center bg-surface-container-low border-b border-outline-variant/25">
          <div className="public-scroll flex items-center gap-2 overflow-x-auto px-4 md:px-6 py-3 w-full md:justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={currentCategory === cat}
                disabled={isPending}
                onClick={() => handleFilter(cat)}
                className={`relative min-h-11 flex shrink-0 items-center gap-2 px-5 py-2 md:py-4 rounded-full transition-colors duration-200 whitespace-nowrap disabled:opacity-60
                  ${currentCategory === cat 
                    ? "bg-primary text-on-primary shadow-md" 
                    : "text-on-surface-variant hover:text-primary bg-surface-container-high border border-outline-variant"
                  }`}
              >
                <span className={`material-symbols-outlined text-[16px] md:text-[22px] transition-colors duration-300 
                  ${currentCategory === cat ? "text-secondary-fixed" : "opacity-80"}`}>
                  {getIcon(cat)}
                </span>
                <span className={`text-xs md:text-xs font-black tracking-[0.2em] uppercase
                  ${currentCategory === cat ? "opacity-100" : "opacity-90"}`}>
                  {cat}
                </span>
              </button>
            ))}
          </div>
          
          {/* Fade-out gradient for mobile scroll */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-surface-container-low to-transparent pointer-events-none md:hidden" />
        </div>
      </nav>

      {/* Main Content Area */}
      <section aria-label="Hasil pencarian artikel" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 md:pb-40 min-h-[50vh] relative pt-4 md:pt-12">
        <p role="status" className="sr-only">{isPending ? "Memuat hasil pencarian…" : `${initialPosts.length} artikel ditemukan`}</p>

        {/* Top progress bar — CSS keyframe animation only */}
        {isPending && (
          <div
            className="fixed top-0 left-0 right-0 h-1 bg-secondary z-99 origin-left shadow-sm"
            style={{ animation: 'growWidth 0.8s ease-in-out forwards' }}
          />
        )}

        <div aria-busy={isPending} className={`transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
          {initialPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
              {initialPosts.map((post, index) => {
                const isFeatured = index === 0 && !currentSearch && currentCategory === "Semua";
                return (
                  <div
                    key={post.id}
                    className={`min-w-0 ${isFeatured ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4"}`}
                  >
                    <Link
                      href={`/post/${post.slug}`}
                      className={`group min-w-0 flex flex-col h-full bg-surface-container-lowest border border-outline-variant/10 rounded-3xl overflow-hidden transition-all duration-300 hover:border-secondary/40 hover:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)]
                        ${isFeatured ? "lg:flex-row lg:min-h-[420px]" : ""}`}
                    >
                      {/* Thumbnail */}
                      <div className={`relative shrink-0 overflow-hidden ${isFeatured ? "lg:w-[45%] h-56 sm:h-72 lg:h-auto" : "aspect-16/10"}`}>
                        {post.thumbnail ? (
                          <Image
                            fill
                            src={post.thumbnail}
                            alt={post.title}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                            preload={index === 0}
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-container-low flex flex-col items-center justify-center">
                             <span aria-hidden="true" className="material-symbols-outlined text-outline-variant text-[48px]">auto_stories</span>
                          </div>
                        )}
                        {/* Category Badge — solid bg, no backdrop-blur */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-secondary text-on-secondary-container text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="min-w-0 p-5 md:p-8 flex-1 flex flex-col">
                        <h2 className={`font-headline font-black text-primary leading-tight group-hover:text-public-accent transition-colors duration-300
                          ${isFeatured ? "text-xl md:text-3xl mb-4" : "text-base md:text-xl mb-3 line-clamp-2"}`}>
                          {post.title}
                        </h2>
                        
                        {isFeatured && (
                           <p className="text-on-surface-variant font-medium text-base leading-relaxed mb-4 line-clamp-2 md:line-clamp-3 opacity-80">
                             Temukan rangkuman informasi esensial dan analisis mendalam mengenai {post.title.toLowerCase()}. Artikel ini menyajikan perspektif eksklusif dari Redaksi PCNU.
                           </p>
                        )}
                        
                        <div className="mt-auto pt-4 border-t border-outline-variant/25 flex flex-wrap gap-3 items-center justify-between">
                          <div className="flex min-w-0 items-center gap-2.5">
                             <div className="w-7 h-7 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-primary shrink-0">
                                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">person</span>
                             </div>
                             <div className="flex flex-col">
                               <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase leading-relaxed">PCNU Redaksi</span>
                               <span className="text-xs font-medium text-on-surface-variant uppercase leading-relaxed mt-0.5">{formatDate(post.createdAt)}</span>
                             </div>
                          </div>
                          
                          <div className="w-8 h-8 rounded-full border border-outline-variant/40 flex items-center justify-center text-on-surface-variant group-hover:bg-secondary group-hover:border-secondary group-hover:text-on-secondary-container transition-all duration-300 shrink-0">
                             <span aria-hidden="true" className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">east</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 md:py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
                <span aria-hidden="true" className="material-symbols-outlined text-[36px] text-outline-variant/50">search_off</span>
              </div>
              <h2 className="text-xl md:text-2xl font-headline font-bold text-primary mb-3">Tidak Menemukan Hasil</h2>
              <p className="text-on-surface-variant max-w-sm font-medium text-base">
                Coba kata kunci lain atau ubah kategori untuk menemukan wawasan yang Anda cari.
              </p>
              <button 
                onClick={() => {
                  setSearchInput("");
                  startTransition(() => router.push(resetExploreSearch(searchParams.toString()), { scroll: false }));
                }}
                className="mt-8 min-h-11 px-6 sm:px-8 py-3 rounded-full bg-primary text-on-primary text-xs font-bold tracking-widest uppercase hover:-translate-y-0.5 transition-transform duration-200"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-surface-container-low py-14 md:py-24 border-t border-outline-variant/10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-1 bg-primary rounded-full" />
            <h2 className="text-2xl md:text-3xl font-headline font-black text-primary tracking-tight">Terus Mengabdi, Terus Literasi</h2>
            <p className="text-on-surface-variant max-w-lg font-medium opacity-90 text-base">
              Gerakan Literasi Digital PCNU Bolaang Mongondow Selatan didedikasikan untuk menyebarkan wawasan transformatif di era informasi.
            </p>
         </div>
      </footer>

      {/* CSS Keyframes for loading progress bar */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes growWidth {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}} />
    </div>
  );
}
