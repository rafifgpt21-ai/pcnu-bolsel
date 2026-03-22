"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function LenisRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      lenis.resize();
      
      // Sync with global window object for debugging and external scripts
      if (typeof window !== 'undefined') {
        (window as any).lenis = lenis;
      }
    }
  }, [pathname, lenis]);

  return <>{children}</>;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <LenisRoot>
        {children}
      </LenisRoot>
    </ReactLenis>
  );
}
