'use client';

import { useState } from 'react';
import styles from './HeroMarquee.module.css';

const messages = [
  'Merawat Tradisi, Menguatkan Ukhuwah',
  'Berkhidmah untuk Umat dan Bangsa',
  'Menjaga Aswaja, Merawat Persatuan',
];

export default function HeroMarquee() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      role="region"
      aria-label="Semangat khidmah Nahdlatul Ulama"
      className={`${styles.marquee} relative z-10 mb-6 flex w-full max-w-5xl items-center rounded-2xl border border-primary/15 bg-primary/5 text-primary sm:mb-8 md:mb-10`}
    >
      <p className="sr-only">{messages.join('. ')}.</p>
      <div className="hidden shrink-0 items-center gap-2 self-stretch rounded-l-2xl bg-primary px-5 text-on-primary sm:flex">
        <span aria-hidden="true" className="text-secondary-fixed">✦</span>
        <span className="font-label text-[10px] font-bold tracking-[0.18em]">KHIDMAH NU</span>
      </div>

      <div className={styles.viewport}>
        <div
          aria-hidden="true"
          className={styles.track}
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className={`${styles.group} ${copy === 1 ? styles.copy : ''}`}>
              {messages.map((message) => (
                <span key={message} className={`${styles.message} font-headline text-xs font-semibold sm:text-sm`}>
                  <span>{message}</span>
                  <span aria-hidden="true" className="text-public-accent">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label={isPaused ? 'Lanjutkan tulisan berjalan' : 'Jeda tulisan berjalan'}
        title={isPaused ? 'Lanjutkan tulisan berjalan' : 'Jeda tulisan berjalan'}
        onClick={() => setIsPaused((paused) => !paused)}
        className={`${styles.control} m-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary/10`}
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          {isPaused ? (
            <path d="M5 3.5a.5.5 0 0 1 .76-.43l7 4.5a.5.5 0 0 1 0 .86l-7 4.5A.5.5 0 0 1 5 12.5z" />
          ) : (
            <path d="M4 3h3v10H4zm5 0h3v10H9z" />
          )}
        </svg>
      </button>
    </div>
  );
}
