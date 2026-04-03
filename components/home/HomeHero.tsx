'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import HeroSearch from '@/components/HeroSearch';
import { ReactNode } from 'react';

export default function HomeHero() {
  return (
    <section 
      className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 text-center overflow-hidden pt-20 animate-in fade-in duration-1000"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-surface to-surface"></div>
        
        {/* Blobs only on desktop/mid-range and up, non-infinite on mobile if possible */}
        <div className="hidden md:block absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-secondary/20 blur-[130px] rounded-full mix-blend-multiply opacity-40 animate-[pulse_15s_ease-in-out_infinite]"></div>
        <div className="hidden md:block absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply opacity-30 animate-[pulse_20s_ease-in-out_infinite]"></div>
      </div>

      {/* Impact Chips (Floating Glass) */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 w-full max-w-4xl mx-auto z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
        {[
          { icon: 'account_balance', text: '7 MWC' },
          { icon: 'location_city', text: '81 Ranting' },
          { icon: 'verified', text: 'Lembaga & Banom' },
        ].map((chip, i) => (
          <div 
            key={i} 
            className="group relative bg-surface/90 md:bg-surface/60 hover:bg-surface/90 md:backdrop-blur-xl px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-[11px] sm:text-xs font-label font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 shadow-lg shadow-primary/5 border border-primary/10 md:border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-default"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-secondary group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{chip.icon}</span>
            <span className="opacity-90">{chip.text}</span>
          </div>
        ))}
      </div>

      {/* Main Typography */}
      <div className="relative mb-12 max-w-5xl z-10 group animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 fill-mode-both">
        <h1 className="font-headline font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] tracking-tight text-on-surface leading-[1.1] sm:leading-[1.05]">
          <span className="block mb-2">Portal Resmi,</span>
          <span className="relative inline-block mt-1 sm:mt-2">
            <span className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary" style={{ backgroundSize: '200% auto', animation: 'gradient 8s linear infinite' }}>
              Nahdlatul Ulama
            </span>
          </span>
          <br className="hidden sm:block" />
          <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-[2.75rem] mt-3 sm:mt-5 font-bold tracking-tight text-on-surface/80">
            Bolaang Mongondow Selatan
          </span>
        </h1>
      </div>

      {/* Search Bar Area */}
      <div className="w-full max-w-3xl px-4 z-20 flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
        <HeroSearch />
      </div>

      {/* Primary CTA Scroll Down */}
      <div className="mt-16 z-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 fill-mode-both">
        <Link href="#arsip" scroll={true} className="group flex flex-col items-center gap-4 font-headline font-bold text-lg tracking-tight text-primary hover:text-secondary transition-all duration-500">
          <span className="opacity-60 text-[10px] sm:text-xs tracking-[0.3em] font-label mb-1 group-hover:opacity-100 transition-opacity uppercase drop-shadow-sm">Jelajah Bersama</span>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-surface/80 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10 md:backdrop-blur-md group-hover:-translate-y-1 transition-all">
             <span className="material-symbols-outlined md:animate-bounce text-xl">south</span>
          </div>
        </Link>
      </div>

      {/* Custom Keyframes for Text Gradient */}
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
      `}} />
    </section>
  );
}
