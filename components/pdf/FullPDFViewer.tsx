"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Document, Page, pdfjs, type DocumentProps } from 'react-pdf';
import { usePageScrollLock } from '@/lib/ui/scroll-lock';
import { findPdfMatches, highlightPdfText, pdfPageWidth } from '@/lib/ui/pdf-viewer';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type LoadedDocument = Parameters<NonNullable<DocumentProps['onLoadSuccess']>>[0];
type FullPDFViewerProps = { url: string; title?: string };

function Icon({ name }: { name: string }) {
  return <span aria-hidden="true" className="material-symbols-outlined">{name}</span>;
}

function LazyPage({ index, searchText, width, containerRef }: { index: number; searchText: string; width: number; containerRef: RefObject<HTMLDivElement | null> }) {
  const [visible, setVisible] = useState(false);
  const [ratio, setRatio] = useState(1.414);
  const [renderedWidth, setRenderedWidth] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { root: containerRef.current, rootMargin: '100% 0px', threshold: 0 });
    if (pageRef.current) observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  const placeholder = <div role="status" className="flex h-full min-h-40 items-center justify-center bg-surface-container-low p-4 text-center text-sm text-on-surface-variant">Memuat halaman {index + 1}…</div>;
  return (
    <div ref={pageRef} id={`page-container-${index + 1}`} data-pdf-page={index + 1} role="region" aria-label={`Halaman ${index + 1}`} aria-busy={renderedWidth !== width} className="relative shrink-0 bg-white shadow-lg" style={{ width, minHeight: width * ratio }}>
      {visible ? <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 flex select-none flex-wrap items-center justify-center gap-20 overflow-hidden p-10 opacity-15">
          {Array.from({ length: 12 }, (_, i) => <div key={i} className="-rotate-45 whitespace-nowrap text-4xl font-bold">BRH INTELLECTUAL PLATFORM</div>)}
        </div>
        <Page pageNumber={index + 1} width={width} renderTextLayer renderAnnotationLayer
          onLoadSuccess={(page) => setRatio(page.originalHeight / page.originalWidth)}
          onRenderSuccess={() => setRenderedWidth(width)}
          loading={placeholder}
          error={<p role="alert" className="p-6 text-center text-base text-error">Halaman {index + 1} tidak dapat dimuat. Coba muat ulang dokumen.</p>}
          customTextRenderer={({ str }) => highlightPdfText(str, searchText)}
        />
      </> : placeholder}
    </div>
  );
}

export const FullPDFViewer = ({ url, title }: FullPDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState(() => window.innerWidth < 768 ? 1 : 1.2);
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [allPagesText, setAllPagesText] = useState<string[]>([]);
  const [indexState, setIndexState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [pageMessage, setPageMessage] = useState('');
  const [containerWidth, setContainerWidth] = useState(0);
  const [retry, setRetry] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadVersion = useRef(0);
  usePageScrollLock(true);

  const proxiedUrl = url.startsWith('http') && new URL(url).origin !== window.location.origin
    ? `/api/proxy-pdf?url=${encodeURIComponent(url)}` : url;
  const searchResults = useMemo(() => findPdfMatches(allPagesText, searchText), [allPagesText, searchText]);
  const pageWidth = pdfPageWidth(containerWidth, scale);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const css = getComputedStyle(container);
      setContainerWidth(Math.max(0, container.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight)));
    };
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => { loadVersion.current += 1; }, []);

  const onDocumentLoadSuccess = async (pdf: LoadedDocument) => {
    const version = ++loadVersion.current;
    setNumPages(pdf.numPages);
    setLoadError(false);
    setIndexState('loading');
    try {
      const text: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        if (version !== loadVersion.current) return;
        text.push(content.items.map((item) => 'str' in item ? item.str : '').join(' '));
      }
      setAllPagesText(text);
      setIndexState('ready');
    } catch {
      if (version === loadVersion.current) setIndexState('error');
    }
  };

  const scrollToPage = useCallback((page: number) => {
    const container = containerRef.current;
    const target = container?.querySelector<HTMLElement>(`[data-pdf-page="${page}"]`);
    if (!container || !target) return;
    const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 16;
    container.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    setCurrentPage(page);
    setPageInput(String(page));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !numPages || !pageWidth) return;
    let frame = 0;
    const trackPage = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = container.getBoundingClientRect();
        let bestPage = 1, bestHeight = 0;
        for (const page of container.querySelectorAll<HTMLElement>('[data-pdf-page]')) {
          const rect = page.getBoundingClientRect();
          const height = Math.max(0, Math.min(rect.bottom, bounds.bottom) - Math.max(rect.top, bounds.top));
          if (height > bestHeight) { bestHeight = height; bestPage = Number(page.dataset.pdfPage); }
        }
        if (bestHeight > 0) {
          setCurrentPage(bestPage);
          if (document.activeElement !== pageInputRef.current) setPageInput(String(bestPage));
        }
      });
    };
    trackPage();
    container.addEventListener('scroll', trackPage, { passive: true });
    const observer = new ResizeObserver(trackPage);
    observer.observe(container);
    return () => { container.removeEventListener('scroll', trackPage); observer.disconnect(); cancelAnimationFrame(frame); };
  }, [numPages, pageWidth]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        alert('Pencetakan tidak diizinkan.');
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault(); searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearSearch = () => { setSearchInput(''); setSearchText(''); setCurrentMatchIndex(-1); };
  const moveMatch = (direction: number) => {
    if (!searchResults.length) return;
    const next = (currentMatchIndex + direction + searchResults.length) % searchResults.length;
    setCurrentMatchIndex(next); scrollToPage(searchResults[next].pageIndex + 1);
  };
  const reloadDocument = () => {
    loadVersion.current += 1;
    setNumPages(undefined); setLoadError(false); setAllPagesText([]); setIndexState('loading');
    setPageInput('1'); setCurrentPage(1); setPageMessage(''); clearSearch(); setRetry((value) => value + 1);
  };
  const iconButton = 'grid size-11 shrink-0 place-items-center rounded-xl text-primary transition-colors hover:bg-surface-container-high disabled:opacity-40';

  return (
    <div className="public-ui public-pdf-viewer fixed inset-0 z-100 flex h-dvh min-w-0 flex-col overflow-hidden bg-surface-container-lowest text-on-surface">
      <header className="public-scroll z-30 flex max-h-[65dvh] shrink-0 flex-wrap items-center justify-between gap-2 overflow-y-auto border-b border-outline-variant/30 bg-surface-container-low px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-sm md:px-8 md:py-3">
        <div className="flex min-w-0 items-center gap-2 md:gap-4">
          <button type="button" onClick={() => window.history.back()} className={iconButton} aria-label="Kembali"><Icon name="arrow_back" /></button>
          <div className="min-w-0 sm:max-w-40 lg:max-w-48 xl:max-w-sm">
            <h1 className="break-words font-headline text-base font-bold leading-snug text-primary sm:truncate" title={title}>{title || 'Dokumen PDF'}</h1>
            <p className="hidden text-xs text-on-surface-variant md:block">Continuous Scroll Mode</p>
          </div>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-1 sm:justify-end md:gap-3">
          <div role="group" aria-label="Zoom dokumen" className="flex items-center rounded-xl border border-outline-variant/30 bg-surface-container-highest/40">
            <button type="button" onClick={() => setScale((value) => Math.max(0.5, Number((value - 0.1).toFixed(1))))} disabled={!numPages || scale <= 0.5} className={iconButton} aria-label="Perkecil dokumen"><Icon name="zoom_out" /></button>
            <output aria-label="Tingkat zoom" className="min-w-[3.5ch] px-1 text-center text-xs font-bold text-primary">{Math.round(scale * 100)}%</output>
            <button type="button" onClick={() => setScale((value) => Math.min(3, Number((value + 0.1).toFixed(1))))} disabled={!numPages || scale >= 3} className={iconButton} aria-label="Perbesar dokumen"><Icon name="zoom_in" /></button>
          </div>
          <form aria-label="Lompat ke halaman" className="ml-auto flex min-w-0 items-center gap-1 rounded-xl border border-outline-variant/30 bg-surface-container-highest/40 px-1 sm:ml-0" onSubmit={(event) => {
            event.preventDefault();
            const page = Number(pageInput.trim());
            if (Number.isInteger(page) && page >= 1 && page <= (numPages || 0)) {
              setPageMessage(''); scrollToPage(page); pageInputRef.current?.blur();
            } else { setPageMessage(`Masukkan halaman 1 sampai ${numPages || 1}.`); setPageInput(String(currentPage)); }
          }}>
            <input ref={pageInputRef} aria-label="Nomor halaman" aria-describedby={pageMessage ? 'pdf-page-message' : undefined} inputMode="numeric" pattern="[0-9]*" type="text" value={pageInput} disabled={!numPages} onChange={(event) => setPageInput(event.target.value)} className="h-11 w-11 rounded-lg bg-transparent text-center text-base font-bold text-primary" />
            <span className="whitespace-nowrap text-xs text-on-surface-variant">/ {numPages || '–'}</span>
            <button type="submit" disabled={!numPages} className={iconButton} aria-label="Buka halaman"><Icon name="arrow_forward" /></button>
          </form>
          <form role="search" aria-label="Cari dalam dokumen" className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:max-w-xs sm:flex-1" onSubmit={(event) => {
            event.preventDefault();
            const query = searchInput.trim();
            setSearchText(query);
            const matches = findPdfMatches(allPagesText, query);
            setCurrentMatchIndex(matches.length ? 0 : -1);
            if (matches.length) scrollToPage(matches[0].pageIndex + 1);
          }}>
            <div className="relative min-w-0 flex-1">
              <input ref={searchInputRef} type="search" aria-label="Kata kunci dalam dokumen" enterKeyHint="search" placeholder="Cari dalam dokumen…" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="h-11 w-full min-w-0 rounded-xl border border-outline-variant/40 bg-white px-3 pr-12 text-base placeholder:text-on-surface-variant/80" />
              {searchInput && <button type="button" onClick={clearSearch} className="absolute right-0 top-0 grid size-11 place-items-center rounded-xl text-on-surface-variant" aria-label="Bersihkan pencarian"><Icon name="close" /></button>}
            </div>
            <button type="submit" disabled={indexState !== 'ready' || loadError} className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-white disabled:opacity-50" aria-label="Cari teks dalam dokumen"><Icon name="search" /></button>
          </form>
        </div>
        <p id="pdf-page-message" role="status" className={pageMessage ? 'w-full text-sm text-error' : 'sr-only'}>{pageMessage}</p>
        <p role="status" className="sr-only">{loadError ? '' : indexState === 'loading' ? 'Menyiapkan pencarian dokumen…' : indexState === 'ready' ? 'Pencarian dokumen siap.' : 'Pencarian teks tidak tersedia. Dokumen tetap dapat dibaca.'}</p>
      </header>

      {searchText && <div className="public-scroll max-h-[25dvh] shrink-0 overflow-y-auto border-b border-outline-variant/30 bg-primary/5 px-4 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p role="status" className="min-w-0 break-words text-sm text-on-surface-variant">Hasil untuk <b className="text-primary">&quot;{searchText}&quot;</b>: {searchResults.length ? `${currentMatchIndex + 1} / ${searchResults.length}` : 'Tidak ditemukan'}</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => moveMatch(-1)} disabled={!searchResults.length} className={iconButton} aria-label="Hasil sebelumnya"><Icon name="keyboard_arrow_up" /></button>
            <button type="button" onClick={() => moveMatch(1)} disabled={!searchResults.length} className={iconButton} aria-label="Hasil berikutnya"><Icon name="keyboard_arrow_down" /></button>
            <button type="button" onClick={clearSearch} className="min-h-11 rounded-xl px-3 text-sm font-bold text-primary">Bersihkan</button>
          </div>
        </div>
      </div>}
      {indexState === 'error' && !loadError && <p role="status" className="px-4 py-2 text-sm text-error">Pencarian teks tidak tersedia. Dokumen tetap dapat dibaca.</p>}

      <div ref={containerRef} data-lenis-prevent aria-label="Halaman dokumen" tabIndex={0} className="public-scroll relative min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain bg-surface-dim/30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-8" onContextMenu={(event) => event.preventDefault()}>
        {containerWidth > 0 && <Document key={retry} file={proxiedUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={() => { loadVersion.current += 1; setLoadError(true); }} className="mx-auto flex w-max min-w-full flex-col items-center gap-6 md:gap-8"
          loading={<div role="status" className="flex min-h-60 w-full max-w-sm flex-col items-center justify-center gap-4 p-4 text-center"><span aria-hidden="true" className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /><p className="text-base text-primary">Menyiapkan dokumen…</p></div>}
          error={<div role="alert" className="w-full max-w-sm rounded-2xl border border-outline-variant/30 bg-white p-6 text-center"><h2 className="text-xl font-bold text-primary">Dokumen gagal dimuat</h2><p className="mt-3 text-base text-on-surface-variant">Periksa koneksi internet, lalu coba lagi.</p><button type="button" onClick={reloadDocument} className="mt-5 min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white">Muat ulang dokumen</button></div>}
        >
          {Array.from({ length: numPages || 0 }, (_, index) => <LazyPage key={index} index={index} width={pageWidth} searchText={searchText} containerRef={containerRef} />)}
        </Document>}
        {numPages && !loadError && <p className="py-12 text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant">Akhir Dokumen</p>}
      </div>
    </div>
  );
};
