"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (query.trim()) {
      router.push(`/explore?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/explore");
    }
  };


  return (
    <div 
      className="w-full max-w-2xl relative"
    >
      <form onSubmit={handleSearch} className="relative z-10">
        <div 
          className={`
            relative flex items-center gap-2 p-1.5 
            bg-white/90 md:bg-white/70 dark:bg-black/10 md:glass-effect
            rounded-[2.5rem] border transition-all duration-500 ease-out
            ${isFocused 
              ? "border-primary/40 shadow-[0_20px_40px_-15px_rgba(1,110,69,0.2)] md:ring-8 ring-primary/5 -translate-y-1" 
              : "border-outline-variant/30 md:border-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)]"
            }
          `}
        >
          <div className="flex-1 flex items-center gap-3 md:gap-4 pl-4 md:pl-6">
            <span className={`material-symbols-outlined transition-all duration-500 scale-100 md:scale-110 ${
              isSubmitting ? 'text-primary animate-spin' : 
              isFocused ? 'text-primary' : 'text-on-surface-variant/30'
            }`}>
              {isSubmitting ? 'sync' : 'search'}
            </span>
            <input
              className="bg-transparent border-none outline-none focus:ring-0 w-full font-body text-sm md:text-lg text-primary placeholder:text-on-surface-variant/40 selection:bg-primary/20"
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
            disabled={isSubmitting}
            className="
              relative overflow-hidden group/btn
              bg-primary text-white 
              px-5 md:px-7 py-3 md:py-4 rounded-full 
              font-headline font-black text-[10px] md:text-[11px] uppercase tracking-[0.15em]
              transition-all duration-300
              hover:bg-primary/95 
              active:scale-95 disabled:opacity-50
              flex items-center gap-2
            "
          >
            <span className="relative z-10 hidden md:inline">Cari</span>
            <span className="material-symbols-outlined text-[18px] md:hidden">search</span>
            <span className="material-symbols-outlined text-[16px] md:text-[18px] transition-transform duration-300 group-hover/btn:translate-x-1">east</span>
          </button>
        </div>
      </form>

    </div>
  );
}


