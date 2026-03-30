'use client';

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface CounterProps {
  value: number;
  direction?: 'up' | 'down';
}

function Counter({ value, direction = 'up' }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("id-ID").format(
          Number(latest.toFixed(0))
        );
      }
    });
  }, [springValue]);

  return <span ref={ref} />;
}

export default function ImpactMetrics() {
  const metrics = [
    {
      label: 'Majelis Wakil Cabang',
      value: 7,
      suffix: '',
      icon: 'account_balance',
    },
    {
      label: 'Pengurus Ranting',
      value: 81,
      suffix: '',
      icon: 'location_city',
    },
    {
      label: 'Lembaga & Banom',
      value: 18,
      suffix: '',
      icon: 'group_work',
    },
    {
      label: 'Berita Diterbitkan',
      value: 100,
      suffix: '+',
      icon: 'article',
    },
  ];

  return (
    <section className="w-full py-24 relative overflow-hidden bg-surface z-10">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-secondary/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.8,
                type: "spring",
                stiffness: 80,
                damping: 15
              }}
              className="group relative flex flex-col items-center text-center p-8 rounded-4xl bg-surface-container-lowest/40 backdrop-blur-md border border-outline-variant/20 hover:border-primary/30 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 hover:-translate-y-2 overflow-hidden"
            >
              {/* Card Glow Effect on Hover */}
              <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              <div className="w-20 h-20 rounded-3xl bg-surface border border-outline-variant/30 flex items-center justify-center mb-6 shadow-xs group-hover:scale-110 group-hover:rotate-3 group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:shadow-primary/10 transition-all duration-500 relative z-10">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:text-secondary transition-colors duration-500">
                  {metric.icon}
                </span>
              </div>
              
              <div className="font-headline font-black text-4xl md:text-5xl lg:text-[3.5rem] text-primary mb-3 tracking-tighter flex items-center justify-center relative z-10">
                <Counter value={metric.value} />
                <span className="ml-1 bg-clip-text text-transparent bg-linear-to-r from-secondary to-primary">{metric.suffix}</span>
              </div>
              
              <p className="font-label text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-on-surface-variant/80 relative z-10 group-hover:text-primary transition-colors duration-500">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
