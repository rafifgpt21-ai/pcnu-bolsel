import styles from './HeroMarquee.module.css';

const messages = [
  'Merawat Tradisi, Menguatkan Ukhuwah',
  'Berkhidmah untuk Umat dan Bangsa',
  'Menjaga Aswaja, Merawat Persatuan',
];

export default function HeroMarquee() {
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
        <div aria-hidden="true" className={styles.track}>
          {[0, 1].map((copy) => (
            <div key={copy} className={styles.group}>
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
    </div>
  );
}
