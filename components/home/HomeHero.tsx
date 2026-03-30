'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import HeroSearch from '@/components/HeroSearch';
import { ReactNode } from 'react';

export default function HomeHero() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as any,
        stiffness: 70,
        damping: 15,
      }
    },
  };

  return (
    <motion.section 
      variants={container}
      initial="hidden"
      animate="show"
      className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 text-center overflow-hidden pt-20"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-surface to-surface"></div>
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-secondary/20 blur-[130px] rounded-full mix-blend-multiply"
        ></motion.div>
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -10, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply"
        ></motion.div>
      </div>

      {/* Impact Chips (Floating Glass) */}
      <motion.div variants={item} className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 w-full max-w-4xl mx-auto z-10">
        {[
          { icon: 'account_balance', text: '7 MWC' },
          { icon: 'location_city', text: '81 Ranting' },
          { icon: 'verified', text: 'Lembaga & Banom' },
        ].map((chip, i) => (
          <div 
            key={i} 
            className="group relative bg-surface/60 hover:bg-surface/90 backdrop-blur-xl px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-[11px] sm:text-xs font-label font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 shadow-xl shadow-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-500 cursor-default"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-secondary group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{chip.icon}</span>
            <span className="opacity-90">{chip.text}</span>
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </motion.div>

      {/* Main Typography */}
      <motion.div variants={item} className="relative mb-12 max-w-5xl z-10 group">
        <h1 className="font-headline font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] tracking-tight text-on-surface leading-[1.05]">
          <span className="block mb-2">Portal Resmi,</span>
          <span className="relative inline-block mt-1 sm:mt-2">
            <span className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary" style={{ backgroundSize: '200% auto', animation: 'gradient 8s linear infinite' }}>
              Nahdlatul Ulama
            </span>
            {/* Subtle glow behind the text */}
            <span className="absolute inset-0 bg-primary/20 blur-3xl z-0 rounded-full mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></span>
          </span>
          <br className="hidden sm:block" />
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] mt-3 sm:mt-5 font-bold tracking-tight text-on-surface/80">
            Bolaang Mongondow Selatan
          </span>
        </h1>
        <p className="mt-8 text-on-surface-variant max-w-2xl mx-auto text-sm sm:text-base lg:text-lg font-body leading-relaxed px-4 opacity-80 group-hover:opacity-100 transition-opacity duration-700">
          Menyebarkan nilai-nilai Islam Ahlussunnah wal Jama&apos;ah an-Nahdliyyah, merajut ukhuwah Islamiyah, Wathaniyah, dan Basyariyah di ujung selatan BMR.
        </p>
      </motion.div>

      {/* Search Bar Area */}
      <motion.div variants={item} className="w-full max-w-3xl px-4 z-20 flex justify-center">
        <HeroSearch />
      </motion.div>

      {/* Primary CTA Scroll Down */}
      <motion.div variants={item} className="mt-16 z-20">
        <Link href="#arsip" scroll={true} className="group flex flex-col items-center gap-4 font-headline font-bold text-lg tracking-tight text-primary hover:text-secondary transition-all duration-500">
          <span className="opacity-60 text-[10px] sm:text-xs tracking-[0.3em] font-label mb-1 group-hover:opacity-100 transition-opacity uppercase drop-shadow-sm">Jelajah Bersama</span>
          <div className="w-14 h-14 rounded-full bg-surface/80 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10 group-hover:shadow-secondary/30 group-hover:border-secondary transition-all duration-500 backdrop-blur-md group-hover:-translate-y-1">
             <span className="material-symbols-outlined transition-transform animate-bounce text-xl">south</span>
          </div>
        </Link>
      </motion.div>

      {/* Custom Keyframes for Text Gradient */}
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}} />
    </motion.section>
  );
}
