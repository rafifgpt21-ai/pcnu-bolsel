"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, href: '#' },
    { name: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>, href: '#' },
    { name: 'Twitter', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>, href: '#' },
    { name: 'Youtube', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 12 12 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 12 12 0 0 1-15 0 2 2 0 0 1-2-2z"/><path d="m10 15 5-3-5-3z"/></svg>, href: '#' },
  ];

  return (
    <footer className="w-full bg-[#0A0F1D] text-[#fcf8fa] pt-24 pb-12 relative overflow-hidden">
      {/* Decorative Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#016E45]/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      
      <div className="w-full px-6 md:px-8 lg:px-12 xl:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black tracking-tighter font-headline text-white">
                PCNU<span className="text-[#016E45]">Bolsel</span>
              </span>
              <div className="h-1 w-12 bg-[#016E45] rounded-full" />
            </div>
            <p className="text-[#fcf8fa]/60 text-sm leading-relaxed max-w-xs font-body">
              Portal berita dan informasi resmi Pengurus Cabang Nahdlatul Ulama Kabupaten Bolaang Mongondow Selatan. Menyebarkan kedamaian dan Islam yang Rahmatan lil Alamin.
            </p>
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#fcf8fa]/70 hover:bg-[#016E45] hover:text-white hover:border-[#016E45] transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-6">
            <h3 className="text-white font-headline font-bold text-lg tracking-tight">Tautan Cepat</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-[#fcf8fa]/50 hover:text-[#016E45] transition-colors text-sm font-medium flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#016E45]/30 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-[#fcf8fa]/50 hover:text-[#016E45] transition-colors text-sm font-medium flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#016E45]/30 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                  Jelajah Berita
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="text-[#fcf8fa]/50 hover:text-[#016E45] transition-colors text-sm font-medium flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#016E45]/30 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                  Tentang PCNU
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#fcf8fa]/50 hover:text-[#016E45] transition-colors text-sm font-medium flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#016E45]/30 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                  Struktur Organisasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Layanan Column */}
          <div className="space-y-6">
            <h3 className="text-white font-headline font-bold text-lg tracking-tight">Layanan</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/admin/login" className="text-[#fcf8fa]/50 hover:text-[#016E45] transition-colors text-sm font-medium flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#016E45]/30 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                  Portal Admin
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#fcf8fa]/50 hover:text-[#016E45] transition-colors text-sm font-medium flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#016E45]/30 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                  Informasi ZISWAF
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#fcf8fa]/50 hover:text-[#016E45] transition-colors text-sm font-medium flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#016E45]/30 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                  Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#fcf8fa]/50 hover:text-[#016E45] transition-colors text-sm font-medium flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#016E45]/30 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h3 className="text-white font-headline font-bold text-lg tracking-tight">Kontak Kami</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[#016E45]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <p className="text-[#fcf8fa]/50 text-sm leading-relaxed font-body">
                  Jl. Trans Sulawesi, Bolaang Mongondow Selatan, Sulawesi Utara.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[#fcf8fa]/50 hover:text-[#016E45] transition-colors group cursor-pointer">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[#016E45] group-hover:bg-[#016E45] group-hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <span className="text-sm font-body">info@pcnubolsel.or.id</span>
              </div>
              <div className="flex items-center gap-3 text-[#fcf8fa]/50 hover:text-[#016E45] transition-colors group cursor-pointer">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[#016E45] group-hover:bg-[#016E45] group-hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <span className="text-sm font-body">+62 812-3456-7890</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-[#fcf8fa]/30 text-[10px] uppercase font-label tracking-[0.2em] font-medium italic">
              "Merawat Jagat, Membangun Peradaban"
            </p>
            <p className="text-[#fcf8fa]/40 text-xs font-body">
              &copy; {currentYear} PCNU Kab. Bolaang Mongondow Selatan. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

