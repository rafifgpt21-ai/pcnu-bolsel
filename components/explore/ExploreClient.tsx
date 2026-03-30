"use client";

import { motion, AnimatePresence } from "framer-motion";
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
      {/* Minimalist Mobile Header / Extended Desktop Hero */}
      <header className="relative pt-6 md:pt-32 pb-6 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-surface-container-low/50 to-transparent" />
        <div className="absolute top-0 right-0 -z-10 opacity-30 blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2">
           <div className="w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary-fixed rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-12 text-center lg:text-left">
            <div className="hidden md:flex flex-col space-y-3 md:space-y-6 max-w-2xl mx-auto lg:mx-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-surface-container-high border border-outline-variant/5 shadow-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-label text-8px] md:text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
                  Khazanah Digital
                </span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-7xl font-headline font-black text-primary leading-tight tracking-tight"
              >
                Jelajah <span className="text-secondary italic">PCNU Bolsel</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs md:text-lg text-on-surface-variant font-medium max-w-lg mx-auto lg:mx-0 opacity-70"
              >
                Wawasan transformatif dari keluarga besar PCNU.
              </motion.p>
            </div>

            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSearch}
              className="relative w-full lg:max-w-md group"
            >
              <div className="relative overflow-hidden rounded-full p-0.5 bg-surface-container-highest border border-outline-variant/10 focus-within:ring-4 focus-within:ring-secondary/10 transition-all duration-500 shadow-lg shadow-black/5">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari khazanah..."
                  className="w-full bg-transparent border-none rounded-full py-2.5 md:py-5 pl-11 md:pl-14 pr-6 text-on-surface font-semibold focus:ring-0 placeholder:text-on-surface-variant/30 text-sm md:text-lg"
                />
                <span className="material-symbols-outlined absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-secondary transition-all text-lg md:text-2xl font-light">
                  search
                </span>
              </div>
            </motion.form>
          </div>
        </div>
      </header>


      {/* Professional Horizontal Scrolling Navigation */}
      <nav className="sticky top-[64px] md:top-24 z-50 w-full px-0 md:px-6 mb-4 md:mb-16">
        <div className="relative flex items-center bg-surface-container-low/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none border-b md:border-none border-outline-variant/10">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-6 md:px-0 py-3 md:py-0 w-full md:justify-center">
            {categories.map((cat, index) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleFilter(cat)}
                className={`group relative flex items-center gap-2 px-5 py-2 md:py-4 rounded-full transition-all duration-500 whitespace-nowrap
                  ${currentCategory === cat 
                    ? "bg-primary text-on-primary md:bg-primary" 
                    : "text-on-surface-variant hover:text-primary md:bg-surface-container-low/40 md:backdrop-blur-3xl md:border md:border-outline-variant/10"
                  }`}
              >
                <span className={`material-symbols-outlined text-[16px] md:text-[22px] transition-all duration-700 
                  ${currentCategory === cat ? "scale-110 md:rotate-360 text-secondary" : "opacity-30"}`}>
                  {getIcon(cat)}
                </span>
                <span className={`text-[9px] md:text-[11px] font-black tracking-[0.2em] uppercase
                  ${currentCategory === cat ? "opacity-100" : "opacity-60"}`}>
                  {cat}
                </span>
              </motion.button>
            ))}
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-surface-container-low to-transparent pointer-events-none md:hidden" />
        </div>
      </nav>

      {/* Main Content Area with Transition Overlay */}
      <main className="max-w-7xl mx-auto px-6 pb-40 min-h-[50vh] relative pt-4 md:pt-12">

        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory + currentSearch}
            className={`transition-opacity duration-700 ${isPending ? 'opacity-40 pointer-events-none grayscale-[0.3]' : 'opacity-100'}`}
          >
            {initialPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                {initialPosts.map((post, index) => {
                  const isFeatured = index === 0 && !currentSearch && currentCategory === "Semua";
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`${isFeatured ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4"}`}
                    >
                      <Link
                        href={`/post/${post.slug}`}
                        className={`group flex flex-col h-full bg-surface-container-lowest border border-outline-variant/10 rounded-3xl overflow-hidden transition-all duration-700 hover:border-secondary/40 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]
                          ${isFeatured ? "lg:flex-row lg:min-h-[420px]" : ""}`}
                      >
                        <div className={`relative overflow-hidden ${isFeatured ? "lg:w-[45%] h-72 lg:h-auto" : "aspect-16/10"}`}>
                          {post.thumbnail ? (
                            <Image
                              fill
                              src={post.thumbnail}
                              alt={post.title}
                              className="object-cover transition-transform duration-1000 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-surface-container-low flex flex-col items-center justify-center">
                               <span className="material-symbols-outlined text-outline-variant text-[48px]">auto_stories</span>
                            </div>
                          )}
                          <div className="absolute top-5 left-5 flex flex-col gap-2">
                            <span className="bg-secondary/90 backdrop-blur-md text-on-secondary text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-black/5">
                              {post.category}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
                        
                        <div className="p-6 md:p-8 flex-1 flex flex-col">
                          <h2 className={`font-headline font-black text-primary leading-tight hover:text-secondary group-hover:translate-x-1 transition-all duration-500
                            ${isFeatured ? "text-2xl md:text-3xl mb-4" : "text-lg md:text-xl mb-4 line-clamp-2"}`}>
                            {post.title}
                          </h2>
                          
                          {isFeatured && (
                             <p className="text-on-surface-variant font-medium text-base leading-relaxed mb-6 line-clamp-2 md:line-clamp-3 opacity-80">
                               Temukan rangkuman informasi esensial dan analisis mendalam mengenai {post.title.toLowerCase()}. Artikel ini menyajikan perspektif eksklusif dari Redaksi PCNU.
                             </p>
                          )}
                          
                          <div className="mt-auto pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-primary">
                                  <span className="material-symbols-outlined text-[16px]">person</span>
                               </div>
                               <div className="flex flex-col">
                                 <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase">PCNU Redaksi</span>
                                 <span className="text-[9px] font-bold text-outline-variant uppercase">{formatDate(post.createdAt)}</span>
                               </div>
                            </div>
                            
                            <div className="w-10 h-10 rounded-full border border-outline-variant/40 flex items-center justify-center text-on-surface-variant group-hover:bg-secondary group-hover:border-secondary group-hover:text-on-secondary transition-all duration-700">
                               <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">east</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-40 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-[40px] text-outline-variant/50">search_off</span>
                </div>
                <h2 className="text-2xl font-headline font-bold text-primary mb-4">Tidak Menemukan Hasil</h2>
                <p className="text-on-surface-variant max-w-sm font-medium">
                  Coba kata kunci lain atau ubah kategori untuk menemukan wawasan yang Anda cari.
                </p>
                <button 
                  onClick={() => {
                    setSearchInput("");
                    handleFilter("Semua");
                  }}
                  className="mt-10 px-8 py-3 rounded-full bg-primary text-on-primary text-[10px] font-bold tracking-widest uppercase shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all"
                >
                  Reset Pencarian
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Global Loading Indicator (Progress Bar) */}
        <AnimatePresence>
          {isPending && (
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="fixed top-0 left-0 right-0 h-1 bg-secondary z-99 origin-left shadow-[0_4px_12px_rgba(var(--color-secondary),0.5)]"
            />
          )}
        </AnimatePresence>
      </main>

      {/* Modern Footer Section */}
      <footer className="bg-surface-container-low py-24 border-t border-outline-variant/10">
         <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-8">
            <div className="w-16 h-1 bg-primary rounded-full mb-4" />
            <h2 className="text-3xl font-headline font-black text-primary tracking-tight">Terus Mengabdi, Terus Literasi</h2>
            <p className="text-on-surface-variant max-w-lg font-medium opacity-70">
              Gerakan Literasi Digital PCNU Bolaang Mongondow Selatan didedikasikan untuk menyebarkan wawasan transformatif di era informasi.
            </p>
            <div className="flex gap-4 mt-8">
               {[1,2,3].map(i => (
                 <div key={i} className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center hover:bg-secondary/10 transition-colors cursor-pointer">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                 </div>
               ))}
            </div>
         </div>
      </footer>
    </div>
  );
}
