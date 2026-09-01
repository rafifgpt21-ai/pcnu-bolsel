'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavLinks } from './NavLinks';
import { usePageScrollLock } from '@/lib/ui/scroll-lock';

export const MobileMenu = ({ isAdmin }: { isAdmin?: boolean }) => {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const isOpen = openPath === pathname;
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  usePageScrollLock(isOpen);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (isOpen) {
      element.showModal();
      element.querySelector<HTMLButtonElement>('button')?.focus();
    } else if (element.open) element.close();
    return () => { if (element.open) element.close(); };
  }, [isOpen]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setOpenPath(null); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <div className="lg:hidden shrink-0">
      <button ref={trigger} type="button" onClick={() => setOpenPath(isOpen ? null : pathname)} aria-label="Buka menu navigasi" aria-expanded={isOpen} aria-controls={id} aria-haspopup="dialog" className="grid size-11 place-items-center rounded-xl text-primary transition-colors hover:bg-primary/5 active:bg-primary/10">
        <span aria-hidden="true" className="material-symbols-outlined">menu</span>
      </button>
      <dialog
        ref={dialog} id={id} aria-label="Menu navigasi" aria-modal="true"
        onCancel={() => setOpenPath(null)}
        onClick={(event) => { if (event.target === event.currentTarget) setOpenPath(null); }}
        onClose={() => {
          setOpenPath(null);
          if (trigger.current?.getClientRects().length) trigger.current.focus({ preventScroll: true });
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); setOpenPath(null); return; }
          if (event.key !== 'Tab') return;
          const controls = dialog.current?.querySelectorAll<HTMLElement>('a[href], button');
          if (!controls?.length) return;
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }}
        className="public-ui mobile-navigation m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-on-surface backdrop:bg-slate-900/45"
      >
        <div data-lenis-prevent className="ml-auto flex h-full w-[min(320px,calc(100vw-24px))] flex-col overflow-y-auto overscroll-contain bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] shadow-xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-primary">PCNU Bolsel</p>
            <button type="button" onClick={() => setOpenPath(null)} className="grid size-11 shrink-0 place-items-center rounded-xl text-on-surface-variant hover:bg-primary/5" aria-label="Tutup menu"><span aria-hidden="true" className="material-symbols-outlined">close</span></button>
          </div>
          <nav aria-label="Navigasi mobile" className="space-y-3">
            {getNavLinks(isAdmin).map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} onClick={() => setOpenPath(null)} className={`flex min-h-14 items-center rounded-xl px-3 py-2 font-headline text-2xl font-bold tracking-tight transition-colors ${active ? 'bg-primary/5 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'}`}>{link.label}</Link>;
            })}
          </nav>
          <div className="mt-auto border-t border-outline-variant/30 pt-6">
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-primary">Portal Resmi</p>
            <p className="mt-2 text-base leading-relaxed text-on-surface-variant">Merawat Jagat,<br />Membangun Peradaban</p>
          </div>
        </div>
      </dialog>
    </div>
  );
};
