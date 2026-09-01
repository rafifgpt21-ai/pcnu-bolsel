"use client";

import { useEffect } from "react";

export const SCROLL_LOCK_EVENT = "pcnu:scroll-lock";
let locks = 0;
let restore: (() => void) | undefined;

export function isPageScrollLocked() { return locks > 0; }

// A nested overlay must not unlock the page underneath another overlay.
export function lockPageScroll() {
  if (locks === 0) {
    const body = document.body;
    const root = document.documentElement;
    const { scrollX, scrollY } = window;
    const previous = { position: body.style.position, top: body.style.top, left: body.style.left, width: body.style.width, paddingRight: body.style.paddingRight };
    const attribute = root.getAttribute("data-scroll-locked");
    const scrollbar = window.innerWidth - root.clientWidth;
    const paddingRight = getComputedStyle(body).paddingRight;
    root.setAttribute("data-scroll-locked", "true");
    Object.assign(body.style, { position: "fixed", top: `-${scrollY}px`, left: `-${scrollX}px`, width: "100%" });
    if (scrollbar > 0) body.style.paddingRight = `calc(${paddingRight} + ${scrollbar}px)`;
    restore = () => {
      Object.assign(body.style, previous);
      if (attribute === null) root.removeAttribute("data-scroll-locked");
      else root.setAttribute("data-scroll-locked", attribute);
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    };
  }
  locks += 1;
  window.dispatchEvent(new Event(SCROLL_LOCK_EVENT));
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) { restore?.(); restore = undefined; }
    window.dispatchEvent(new Event(SCROLL_LOCK_EVENT));
  };
}

export function usePageScrollLock(active: boolean) {
  useEffect(() => {
    if (active) return lockPageScroll();
  }, [active]);
}
