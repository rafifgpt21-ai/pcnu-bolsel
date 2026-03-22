"use client";

import { useState, useMemo } from "react";
import { Post } from "@/app/generated/prisma/client";
import ArchiveCard from "./ArchiveCard";

interface KatalogClientProps {
  initialPosts: Post[];
}

const categories = ["Semua", "Buku", "Jurnal", "Artikel", "Opini"];

export default function KatalogClient({ initialPosts }: KatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "Semua" || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [initialPosts, searchQuery, activeCategory]);

  return (
    <div className="w-full">
      {/* Search & Filter Section */}
      <section className="relative py-12 mb-12">
        <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-secondary-fixed blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-3xl mx-auto px-6">
          {/* Header text */}
          <div className="text-center mb-10">
             <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-primary mb-4">Katalog Karya</h1>
             <p className="text-on-surface-variant text-lg">Telusuri kumpulan pemikiran, riset, dan opini terbaik.</p>
          </div>

          {/* Search Bar */}
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-linear-to-r from-secondary to-primary-container rounded-full blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
            <div className="relative bg-surface-container-low/80 glass-effect rounded-full px-6 py-4 flex items-center gap-4 border border-outline-variant/15">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
              <input
                className="bg-transparent border-none outline-none focus:ring-0 w-full font-body text-base placeholder:text-on-surface-variant/60"
                placeholder="Cari judul atau topik..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-full text-xs font-label font-bold tracking-wider uppercase transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-secondary text-on-secondary shadow-md scale-105"
                    : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/15 hover:bg-surface-container-low"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="px-6 md:px-12 lg:px-24 mb-24">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <ArchiveCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-outline-variant/20 rounded-3xl">
            <div className="inline-flex w-16 h-16 items-center justify-center rounded-2xl bg-surface-container mb-4 text-on-surface-variant/30">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <p className="text-lg font-bold text-on-surface-variant">Tidak ada hasil ditemukan</p>
            <p className="text-sm text-on-surface-variant/60 mt-1">
              Coba gunakan kata kunci lain atau pilih kategori yang berbeda.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("Semua"); }}
              className="mt-6 text-secondary font-bold text-sm hover:underline"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
