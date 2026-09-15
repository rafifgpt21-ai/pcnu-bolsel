import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LenisProvider } from "@/components/providers/LenisProvider";
import {
  absoluteUrl,
  ORGANIZATION_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PCNU Bolaang Mongondow Selatan | Portal Resmi",
    template: "%s | PCNU Bolsel",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  creator: ORGANIZATION_NAME,
  publisher: ORGANIZATION_NAME,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "PCNU Bolaang Mongondow Selatan | Portal Resmi",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "PCNU Bolaang Mongondow Selatan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PCNU Bolaang Mongondow Selatan | Portal Resmi",
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/opengraph-image")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body 
        className="bg-background font-body text-on-surface selection:bg-secondary-fixed min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <LenisProvider>
          <Header />
          <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 pt-[var(--site-header-height)]">
            {children}
          </main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
