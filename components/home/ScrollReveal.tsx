'use client';

import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  duration?: number;
}

export default function ScrollReveal({ children, delay = 0, direction = 'up', className = '', duration = 0.6 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia('(min-width: 769px) and (hover: hover) and (prefers-reduced-motion: no-preference)');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.dataset.reveal = 'visible';
        observer.unobserve(element);
      }
    }, { threshold: 0.05 });
    const sync = () => {
      observer.disconnect();
      delete element.dataset.reveal;
      // Content is visible in SSR, with JS disabled, and on touch devices.
      if (motion.matches && element.getBoundingClientRect().top >= window.innerHeight) {
        element.dataset.reveal = 'pending';
        observer.observe(element);
      }
    };
    sync();
    motion.addEventListener('change', sync);
    return () => { observer.disconnect(); motion.removeEventListener('change', sync); };
  }, []);
  return <div ref={ref} className={`public-reveal ${className}`} style={{ '--reveal-delay': `${delay}s`, '--reveal-duration': `${duration}s`, '--reveal-x': direction === 'left' ? '20px' : direction === 'right' ? '-20px' : '0px', '--reveal-y': direction === 'up' ? '20px' : direction === 'down' ? '-20px' : '0px' } as CSSProperties}>{children}</div>;
}
