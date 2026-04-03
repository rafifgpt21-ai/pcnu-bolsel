"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface ExploreClientProps {
  initialPosts: any[];
}

const categories = ["Semua", "Berita"];

export default function ExploreClient({ initialPosts }: ExploreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "Semua";
  const currentSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Sync search input with URL params
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

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
    if (searchInput) {
      params.set("search", searchInput);
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
    <div className="min-h-screen bg-surface-container-lowest selection:bg-secondary/30">
      {/* Header — simplified, no Framer Motion */}
      <header className="relative pt-6 md:pt-32 pb-6 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-surface-container-low/50 to-transparent" />
        {/* Decorative blob — hidden on mobile to save GPU */}
        <div className="hidden md:block absolute top-0 right-0 -z-10 opacity-30 blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2">
           <div className="w-[600px] h-[600px] bg-primary-fixed rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-12 text-center lg:text-left">
            {/* Title block — hidden on mobile (search bar is enough) */}
            <div className="hidden md:flex flex-col space-y-3 md:space-y-6 max-w-2xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-surface-container-high border border-outline-variant/5 shadow-sm w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-label text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
                  Khazanah Digital
                </span>
              </div>
              
              <h1 className="text-2xl md:text-7xl font-headline font-black text-primary leading-tight tracking-tight">
                Jelajah <span className="text-secondary italic">PCNU Bolsel</span>
              </h1>
              
              <p className="text-xs md:text-lg text-on-surface-variant font-medium max-w-lg mx-auto lg:mx-0 opacity-70">
                Wawasan transformatif dari keluarga besar PCNU.
              </p>
            </div>

            {/* Search Form */}
            <form 
              onSubmit={handleSearch}
              className="relative w-full lg:max-w-md group"
            >
              <div className="relative overflow-hidden rounded-full p-0.5 bg-surface-container-highest border border-outline-variant/10 focus-within:ring-4 focus-within:ring-secondary/10 transition-all duration-300 shadow-md shadow-black/5">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari khazanah..."
                  className="w-full bg-transparent border-none rounded-full py-2.5 md:py-5 pl-11 md:pl-14 pr-6 text-on-surface font-semibold focus:ring-0 placeholder:text-on-surface-variant/30 text-sm md:text-lg"
                />
                <span className="material-symbols-outlined absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-secondary transition-colors text-lg md:text-2xl font-light">
                  search
                </span>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Category Navigation — CSS only, no motion */}
      <nav className="sticky top-[64px] md:top-24 z-50 w-full px-0 md:px-6 mb-4 md:mb-16">
        {/* Mobile: solid background, no blur. Desktop: transparent */}
        <div className="relative flex items-center bg-surface-container-low/98 md:bg-transparent border-b md:border-none border-outline-variant/10">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-6 md:px-0 py-3 md:py-0 w-full md:justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`relative flex items-center gap-2 px-5 py-2 md:py-4 rounded-full transition-all duration-300 whitespace-nowrap
                  ${currentCategory === cat 
                    ? "bg-primary text-on-primary shadow-md" 
                    : "text-on-surface-variant hover:text-primary bg-surface-container-high border border-outline-variant"
                  }`}
              >
                <span className={`material-symbols-outlined text-[16px] md:text-[22px] transition-colors duration-300 
                  ${currentCategory === cat ? "text-secondary" : "opacity-30"}`}>
                  {getIcon(cat)}
                </span>
                <span className={`text-[9px] md:text-[11px] font-black tracking-[0.2em] uppercase
                  ${currentCategory === cat ? "opacity-100" : "opacity-60"}`}>
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
      <main className="max-w-7xl mx-auto px-6 pb-40 min-h-[50vh] relative pt-4 md:pt-12">

        {/* Top progress bar — CSS keyframe animation only */}
        {isPending && (
          <div
            className="fixed top-0 left-0 right-0 h-1 bg-secondary z-99 origin-left shadow-sm"
            style={{ animation: 'growWidth 0.8s ease-in-out forwards' }}
          />
        )}

        <div className={`transition-opacity duration-300 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {initialPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
              {initialPosts.map((post, index) => {
                const isFeatured = index === 0 && !currentSearch && currentCategory === "Semua";
                return (
                  <div
                    key={post.id}
                    className={`${isFeatured ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4"}`}
                  >
                    <Link
                      href={`/post/${post.slug}`}
                      className={`group flex flex-col h-full bg-surface-container-lowest border border-outline-variant/10 rounded-3xl overflow-hidden transition-all duration-300 hover:border-secondary/40 hover:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)]
                        ${isFeatured ? "lg:flex-row lg:min-h-[420px]" : ""}`}
                    >
                      {/* Thumbnail */}
                      <div className={`relative overflow-hidden ${isFeatured ? "lg:w-[45%] h-56 sm:h-72 lg:h-auto" : "aspect-16/10"}`}>
                        {post.thumbnail ? (
                          <Image
                            fill
                            src={post.thumbnail}
                            alt={post.title}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={index === 0}
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-container-low flex flex-col items-center justify-center">
                             <span className="material-symbols-outlined text-outline-variant text-[48px]">auto_stories</span>
                          </div>
                        )}
                        {/* Category Badge — solid bg, no backdrop-blur */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-secondary text-on-secondary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-5 md:p-8 flex-1 flex flex-col">
                        <h2 className={`font-headline font-black text-primary leading-tight group-hover:text-secondary transition-colors duration-300
                          ${isFeatured ? "text-xl md:text-3xl mb-4" : "text-base md:text-xl mb-3 line-clamp-2"}`}>
                          {post.title}
                        </h2>
                        
                        {isFeatured && (
                           <p className="text-on-surface-variant font-medium text-sm md:text-base leading-relaxed mb-4 line-clamp-2 md:line-clamp-3 opacity-80">
                             Temukan rangkuman informasi esensial dan analisis mendalam mengenai {post.title.toLowerCase()}. Artikel ini menyajikan perspektif eksklusif dari Redaksi PCNU.
                           </p>
                        )}
                        
                        <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                             <div className="w-7 h-7 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-[14px]">person</span>
                             </div>
                             <div className="flex flex-col">
                               <span className="text-[8px] font-bold tracking-widest text-on-surface-variant uppercase leading-none">PCNU Redaksi</span>
                               <span className="text-[8px] font-bold text-outline-variant uppercase leading-none mt-0.5">{formatDate(post.createdAt)}</span>
                             </div>
                          </div>
                          
                          <div className="w-8 h-8 rounded-full border border-outline-variant/40 flex items-center justify-center text-on-surface-variant group-hover:bg-secondary group-hover:border-secondary group-hover:text-on-secondary transition-all duration-300 shrink-0">
                             <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">east</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[36px] text-outline-variant/50">search_off</span>
              </div>
              <h2 className="text-xl md:text-2xl font-headline font-bold text-primary mb-3">Tidak Menemukan Hasil</h2>
              <p className="text-on-surface-variant max-w-sm font-medium text-sm">
                Coba kata kunci lain atau ubah kategori untuk menemukan wawasan yang Anda cari.
              </p>
              <button 
                onClick={() => {
                  setSearchInput("");
                  handleFilter("Semua");
                }}
                className="mt-8 px-8 py-3 rounded-full bg-primary text-on-primary text-[10px] font-bold tracking-widest uppercase hover:-translate-y-0.5 transition-transform duration-200"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-surface-container-low py-14 md:py-24 border-t border-outline-variant/10">
         <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-1 bg-primary rounded-full" />
            <h2 className="text-2xl md:text-3xl font-headline font-black text-primary tracking-tight">Terus Mengabdi, Terus Literasi</h2>
            <p className="text-on-surface-variant max-w-lg font-medium opacity-70 text-sm md:text-base">
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
