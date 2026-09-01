"use client";

import dynamic from "next/dynamic";

const FullPDFViewer = dynamic(
  () => import("./FullPDFViewer").then((mod) => mod.FullPDFViewer),
  { 
    ssr: false,
    loading: () => (
      <div role="status" className="public-ui min-h-[calc(100svh-var(--site-header-height))] flex flex-col items-center justify-center bg-surface-container-lowest px-4 text-center animate-pulse">
        <div aria-hidden="true" className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
        <p className="text-base font-headline font-bold text-primary">Memuat dokumen…</p>
      </div>
    ),
  }
);

interface PDFViewerClientProps {
  url: string;
  title?: string;
}

export default function PDFViewerClient({ url, title }: PDFViewerClientProps) {
  return <FullPDFViewer url={url} title={title} />;
}
