"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const [isSubmitting, startTransition] = useTransition();
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(query.trim() ? `/explore?search=${encodeURIComponent(query.trim())}` : "/explore");
    });
  };


  return (
    <div 
      className="w-full max-w-2xl relative"
    >
      <form role="search" aria-label="Cari artikel" aria-busy={isSubmitting} onSubmit={handleSearch} className="relative z-10">
        <div 
          className={`
            relative flex items-center gap-2 p-1.5 
            bg-white/95 md:bg-white/80 md:glass-effect
            rounded-[2.5rem] border transition-all duration-500 ease-out
            ${isFocused 
              ? "border-primary/40 shadow-[0_20px_40px_-15px_rgba(1,110,69,0.2)] md:ring-8 ring-primary/5 -translate-y-1" 
              : "border-outline-variant/30 md:border-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)]"
            }
          `}
        >
          <div className="min-w-0 flex-1 flex items-center gap-2 md:gap-4 pl-3 md:pl-6">
            <span aria-hidden="true" className={`material-symbols-outlined transition-all duration-500 scale-100 md:scale-110 ${
              isSubmitting ? 'text-primary animate-spin' : 
              isFocused ? 'text-primary' : 'text-on-surface-variant/30'
            }`}>
              {isSubmitting ? 'sync' : 'search'}
            </span>
            <input
              aria-label="Kata kunci pencarian artikel"
              enterKeyHint="search"
              className="min-w-0 min-h-11 bg-transparent border-none outline-none focus:ring-0 w-full font-body text-base md:text-lg text-primary placeholder:text-on-surface-variant/80 selection:bg-primary/20"
              placeholder="Cari topik pemikiran..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isSubmitting}
            />
          </div>
          
          <button 
            type="submit"
            aria-label="Cari artikel"
            disabled={isSubmitting}
            className="
              relative min-h-11 min-w-11 shrink-0 overflow-hidden group/btn
              bg-primary text-white 
              px-3 md:px-7 py-3 md:py-4 rounded-full
              font-headline font-bold text-xs uppercase tracking-wider
              transition-all duration-300
              hover:bg-primary/95 
              active:scale-95 disabled:opacity-50
              flex items-center gap-2
            "
          >
            <span className="relative z-10 hidden md:inline">Cari</span>
            <span aria-hidden="true" className="md:hidden"><span aria-hidden="true" className="material-symbols-outlined">search</span></span>
            <span aria-hidden="true" className="hidden md:inline-flex"><span aria-hidden="true" className="material-symbols-outlined transition-transform duration-300 group-hover/btn:translate-x-1">east</span></span>
          </button>
        </div>
      </form>
      <p role="status" className="sr-only">{isSubmitting ? "Mencari artikel…" : ""}</p>

    </div>
  );
}
