"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isPageScrollLocked, SCROLL_LOCK_EVENT } from "@/lib/ui/scroll-lock";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const instance = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const touch = window.matchMedia("(any-pointer: coarse)");
    const syncLock = () => {
      if (isPageScrollLocked()) instance.current?.stop();
      else { instance.current?.start(); instance.current?.resize(); }
    };
    const syncDevice = () => {
      if (desktop.matches && !touch.matches) {
        // Lenis reads the target's CSS scroll-margin, just like native scrolling.
        instance.current ??= new Lenis({ autoRaf: true, lerp: 0.1, duration: 1.5, smoothWheel: true, anchors: true });
        syncLock();
      } else {
        instance.current?.destroy();
        instance.current = null;
      }
    };
    syncDevice();
    desktop.addEventListener("change", syncDevice);
    touch.addEventListener("change", syncDevice);
    window.addEventListener(SCROLL_LOCK_EVENT, syncLock);
    return () => {
      desktop.removeEventListener("change", syncDevice);
      touch.removeEventListener("change", syncDevice);
      window.removeEventListener(SCROLL_LOCK_EVENT, syncLock);
      instance.current?.destroy();
      instance.current = null;
    };
  }, []);

  useEffect(() => { instance.current?.resize(); }, [pathname]);

  // Keep forms and other children mounted when the viewport changes.
  return <>{children}</>;
}
