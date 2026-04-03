import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const ScrollReveal = dynamic(() => import('@/components/home/ScrollReveal'), {
  ssr: true,
});

export const metadata: Metadata = {
  title: 'Tentang Kami - PCNU Bolaang Mongondow Selatan',
  description:
    'Profil dan susunan pengurus Pengurus Cabang Nahdlatul Ulama (PCNU) Kabupaten Bolaang Mongondow Selatan masa khidmat 2025-2030 berdasarkan SK PBNU No. 3460/PB.01/A.II.01.45/99/01/2025.',
};

// ─── Data Pengurus ─────────────────────────────────────────────────────────────

const mustasyar = [
  'Iskandar Kamaru, S.Pt., M.Si.',
  'Dedi Abdul Hamid',
  'Dr. Abdurahman Julduz E Paus, M.Pd.',
  'Achmad Gobel, Sm.H.',
  'Ahmadi Modeong, S.Pd.',
];

const syuriyah = [
  { jabatan: 'Rais', nama: 'Hajrin Saripi, Lc.' },
  { jabatan: 'Wakil Rais', nama: 'Drs. Sofyan Amu, M.Si.' },
  { jabatan: 'Wakil Rais', nama: 'Gustamil Katili, S.Pd.I.' },
  { jabatan: 'Wakil Rais', nama: "M Umar Ju'i" },
  { jabatan: 'Wakil Rais', nama: "Achmad Ma'sum Maspeke, MH." },
  { jabatan: 'Katib', nama: 'Kasman Lakibu, S.Ag.' },
  { jabatan: 'Wakil Katib', nama: 'Laarpan Lapadang, S.Sos.I.' },
  { jabatan: 'Wakil Katib', nama: 'Moh Ilham Muzhafar Lobud, SH.' },
  { jabatan: 'Wakil Katib', nama: 'Risdiyanto Van Gobel, S.Ag.' },
  { jabatan: 'Wakil Katib', nama: 'Moh Rivaldi Abdul, S.Pd., MMA.' },
  { jabatan: 'Wakil Katib', nama: 'Samsul Huda' },
];

const awan = [
  'Zulkarnain Kamaru, S.Ag.',
  'Fadli Tuliabu, SH.',
  'Rikson Paputungan, S.Pd., M.Pd., M.Si.',
  'Wahyudin Kadullah, S.IP., ME.',
  'Abdillah Gonibala, S.STP., M.Si.',
  'Rante Harttani, S.Pd., M.Pd.',
  'Suprin Mohulaingo, S.Pd., M.Si.',
  'Sudjito Laiya, S.Pd., M.Pd.',
];

const tanfidziyahPimpinan = [
  { jabatan: 'Ketua', nama: 'H. Muhammad Thaib Mokobombang, S.Ag., MH.' },
  { jabatan: 'Wakil Ketua', nama: 'Drs. Ramin Pulumuduyo' },
  { jabatan: 'Wakil Ketua', nama: 'Rahmat Hanna, S.Pd.' },
  { jabatan: 'Wakil Ketua', nama: 'Rahmat Haluti, S.Ag., M.Pd.' },
  { jabatan: 'Wakil Ketua', nama: 'Artur Waroka, ST.' },
  { jabatan: 'Wakil Ketua', nama: 'Arfan Djafar, S.Pd., M.Si.' },
  { jabatan: 'Wakil Ketua', nama: 'Ismail Huntua, S.Ag., M.Pd.I.' },
  { jabatan: 'Wakil Ketua', nama: 'Abdul Hafid Attamimi, S.HI.' },
  { jabatan: 'Sekretaris', nama: "Mas'ud Abas, S.Fil.I." },
  { jabatan: 'Wakil Sekretaris', nama: 'Irfan Eyato, S.Pd.I.' },
  { jabatan: 'Wakil Sekretaris', nama: 'Sahrul Polapa, S.Pd.I.' },
  { jabatan: 'Wakil Sekretaris', nama: 'Aspar Mooduto, S.Pd.I.' },
  { jabatan: 'Wakil Sekretaris', nama: 'Ikrar Paputungan, S.Sy.' },
  { jabatan: 'Wakil Sekretaris', nama: 'Paisal Tuliabu, S.Kom.' },
  { jabatan: 'Wakil Sekretaris', nama: 'Djuman Karenge, S.Ag.' },
  { jabatan: 'Wakil Sekretaris', nama: 'Parni R Musa, S.Pd.' },
  { jabatan: 'Bendahara', nama: 'Rivay Zulkarnain Ointu' },
  { jabatan: 'Wakil Bendahara', nama: 'Nurdin Poiyo, S.HI.' },
  { jabatan: 'Wakil Bendahara', nama: 'Noldi Tangahu, SH.' },
  { jabatan: 'Wakil Bendahara', nama: 'Ahmad, S.Pd.I.' },
  { jabatan: 'Wakil Bendahara', nama: 'Muhammad Indropurnomo' },
  { jabatan: 'Wakil Bendahara', nama: 'Rustam Pakaya' },
];

const tanfidziyahAnggota = [
  'Harmin Manoppo, S.Pd.',
  'Raston Mooduto, S.Pd.',
  'Ibnu Hajar Yakasa, S.HI.',
  'Fudhail Attamimi, S.HI.',
  'Sulaiman, S.Pd.I.',
  'Ais Abdjul, S.Pd.I.',
  'Arianto Mooduto',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPrimaryJabatan(jabatan: string) {
  return (
    jabatan === 'Rais' ||
    jabatan === 'Katib' ||
    jabatan === 'Ketua' ||
    jabatan === 'Sekretaris' ||
    jabatan === 'Bendahara'
  );
}

function getJabatanGroup(jabatan: string): 'ketua' | 'sekretaris' | 'bendahara' | 'wakil' | 'other' {
  if (jabatan === 'Ketua' || jabatan === 'Rais' || jabatan === 'Katib') return 'ketua';
  if (jabatan === 'Sekretaris') return 'sekretaris';
  if (jabatan === 'Bendahara') return 'bendahara';
  if (jabatan.startsWith('Wakil')) return 'wakil';
  return 'other';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ label, icon, title, subtitle }: { label: string; icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-start gap-4 mb-12">
      <span className="font-label text-xs font-bold tracking-[0.4em] text-secondary uppercase px-4 py-1.5 bg-secondary/8 rounded-full border border-secondary/15 flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
        {label}
      </span>
      <h2 className="font-headline font-black text-3xl md:text-4xl lg:text-5xl text-primary tracking-tighter leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-on-surface-variant/60 text-base font-body max-w-2xl leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

function OrgBadge({ level, color }: { level: string; color: 'primary' | 'secondary' | 'tertiary' }) {
  const colors = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    tertiary: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  };
  return (
    <span className={`text-[10px] font-bold font-label tracking-[0.2em] uppercase px-3 py-1 rounded-full border ${colors[color]}`}>
      {level}
    </span>
  );
}

function MemberCard({ nama, jabatan, index, isHighlighted = false }: { nama: string; jabatan?: string; index: number; isHighlighted?: boolean }) {
  return (
    <div className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 ${
      isHighlighted
        ? 'bg-primary/5 border-primary/20 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10'
        : 'bg-surface-container-lowest/60 border-outline-variant/15 hover:border-outline-variant/30 hover:shadow-sm'
    }`}>
      <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold font-label transition-colors ${
        isHighlighted
          ? 'bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary/20'
          : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant/50 group-hover:text-on-surface-variant'
      }`}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        {jabatan && (
          <p className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40 mb-0.5">{jabatan}</p>
        )}
        <p className="font-headline font-semibold text-sm text-on-surface leading-snug tracking-tight truncate">{nama}</p>
      </div>
    </div>
  );
}

function JabatanRow({ item, index }: { item: { jabatan: string; nama: string }; index: number }) {
  const isMain = isPrimaryJabatan(item.jabatan);
  const group = getJabatanGroup(item.jabatan);
  
  const colorMap = {
    ketua:      { dot: 'bg-primary', label: 'text-primary', name: 'font-black text-primary', bg: 'bg-primary/5 border-primary/20 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10', streak: 'from-primary/8' },
    sekretaris: { dot: 'bg-secondary', label: 'text-secondary', name: 'font-black text-secondary', bg: 'bg-secondary/5 border-secondary/20 hover:border-secondary/40 hover:shadow-md hover:shadow-secondary/10', streak: 'from-secondary/8' },
    bendahara:  { dot: 'bg-tertiary', label: 'text-tertiary', name: 'font-black text-tertiary', bg: 'bg-tertiary/5 border-tertiary/20 hover:border-tertiary/40 hover:shadow-md hover:shadow-tertiary/10', streak: 'from-tertiary/8' },
    wakil:      { dot: 'bg-outline-variant', label: 'text-on-surface-variant/50', name: 'font-semibold text-on-surface', bg: 'bg-surface-container-lowest/50 border-outline-variant/15 hover:border-outline-variant/30', streak: '' },
    other:      { dot: 'bg-outline-variant', label: 'text-on-surface-variant/50', name: 'font-semibold text-on-surface', bg: 'bg-surface-container-lowest/50 border-outline-variant/15 hover:border-outline-variant/30', streak: '' },
  };

  const c = colorMap[group];

  return (
    <div
      className={`group relative flex items-center gap-4 rounded-2xl border px-6 py-4 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden ${c.bg}`}
    >
      {isMain && (
        <div className={`absolute top-0 right-0 w-32 h-full bg-linear-to-l ${c.streak} to-transparent pointer-events-none`} />
      )}
      <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 relative z-10">
        <span className={`font-label text-[11px] font-bold tracking-[0.22em] uppercase shrink-0 min-w-[130px] ${c.label}`}>
          {item.jabatan}
        </span>
        <span className={`font-headline text-base tracking-tight ${c.name}`}>
          {item.nama}
        </span>
      </div>
      {isMain && (
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant/20 shrink-0 relative z-10">
          verified
        </span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TentangKamiPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-[65vh] flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 text-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-surface">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--tw-gradient-stops))] from-primary/8 via-surface to-surface" />
          <div className="absolute -top-[15%] -left-[5%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-secondary/12 blur-[140px] rounded-full mix-blend-multiply animate-pulse" />
          <div className="absolute top-[10%] -right-[5%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-primary/12 blur-[130px] rounded-full mix-blend-multiply" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-outline-variant/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 mb-8 font-label text-xs font-bold tracking-[0.3em] uppercase text-on-surface-variant/40">
            <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary">Tentang Kami</span>
          </div>

          {/* Tag */}
          <span className="inline-flex items-center gap-2 font-label text-xs font-bold tracking-[0.4em] text-secondary uppercase px-5 py-2 bg-secondary/8 rounded-full border border-secondary/15 mb-8">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Masa Khidmat 2025–2030
          </span>

          {/* Headline */}
          <h1 className="font-headline font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter text-on-surface leading-[1.02] mb-6">
            Profil{' '}
            <span
              className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary"
              style={{ backgroundSize: '200% auto', animation: 'gradient-flow 8s linear infinite' }}
            >
              PCNU Bolsel
            </span>
          </h1>

          <p className="text-on-surface-variant/65 text-lg md:text-xl max-w-2xl mx-auto font-body leading-relaxed mb-10">
            Pengurus Cabang Nahdlatul Ulama Kabupaten Bolaang Mongondow Selatan, disahkan berdasarkan Surat Keputusan Pengurus Besar Nahdlatul Ulama.
          </p>

          {/* SK Info Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl border border-outline-variant/20 shadow-lg shadow-primary/5">
              <span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
              <div className="text-left">
                <p className="font-label text-[9px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40">Nomor SK</p>
                <p className="font-headline font-bold text-sm text-primary tracking-tight">3460/PB.01/A.II.01.45/99/01/2025</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl border border-outline-variant/20 shadow-lg shadow-primary/5">
              <span className="material-symbols-outlined text-[18px] text-secondary">calendar_month</span>
              <div className="text-left">
                <p className="font-label text-[9px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40">Ditetapkan</p>
                <p className="font-headline font-bold text-sm text-primary tracking-tight">20 Januari 2025 · Jakarta</p>
              </div>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes gradient-flow { 
            0% { background-position: 0% 50%; } 
            100% { background-position: 200% 50%; } 
          }
        ` }} />
      </section>

      {/* ── Stats Bar ── */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-24 py-16 bg-surface border-b border-outline-variant/15">
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: 'groups', value: '5', label: 'Mustasyar', sub: 'Dewan Penasehat' },
              { icon: 'account_balance', value: '11', label: 'Syuriyah', sub: 'Pengurus Harian' },
              { icon: 'people', value: '8', label: "A'wan", sub: 'Anggota Syuriyah' },
              { icon: 'corporate_fare', value: '29+', label: 'Tanfidziyah', sub: 'Pengurus Eksekutif' },
            ].map((stat, i) => (
              <div key={i} className="group flex flex-col items-center text-center gap-3 bg-surface-container-lowest/60 backdrop-blur-xl rounded-2xl border border-outline-variant/15 px-4 py-6 hover:border-primary/25 hover:shadow-md hover:shadow-primary/8 transition-all duration-300 hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/12 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-secondary">{stat.icon}</span>
                </div>
                <div>
                  <p className="font-headline font-black text-3xl text-primary tracking-tight">{stat.value}</p>
                  <p className="font-headline font-bold text-sm text-on-surface mt-0.5">{stat.label}</p>
                  <p className="font-body text-xs text-on-surface-variant/50 mt-0.5">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── Struktur Hierarki ── */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-24 py-24 bg-surface-container-low relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-[-5%] -translate-y-1/2 w-80 h-80 bg-secondary/20 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 right-[-5%] -translate-y-1/2 w-80 h-80 bg-primary/15 blur-[120px] rounded-full" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollReveal>
            <SectionTitle
              label="Hierarki Kepengurusan"
              icon="account_tree"
              title="Struktur Organisasi"
              subtitle="Tatanan kepengurusan PCNU Kabupaten Bolaang Mongondow Selatan sesuai dengan Anggaran Dasar dan Anggaran Rumah Tangga Nahdlatul Ulama."
            />
          </ScrollReveal>

          {/* Org Chart */}
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col items-center gap-0">

              {/* Mustasyar */}
              <div className="w-full max-w-sm">
                <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/20 px-6 py-5 text-center shadow-sm hover:shadow-md hover:shadow-primary/8 hover:border-primary/20 transition-all duration-300 group">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <OrgBadge level="Penasehat" color="secondary" />
                  </div>
                  <div className="mt-2">
                    <span className="material-symbols-outlined text-[24px] text-secondary mb-2 block">star</span>
                    <p className="font-headline font-black text-lg text-on-surface tracking-tight">Mustasyar</p>
                    <p className="font-body text-xs text-on-surface-variant/50 mt-1">Dewan Penasehat · 5 orang</p>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="w-px h-8 bg-linear-to-b from-outline-variant/30 to-outline-variant/60" />

              {/* Syuriyah row */}
              <div className="w-full grid grid-cols-2 gap-4 max-w-xl">
                <div className="relative bg-surface-container-lowest rounded-2xl border border-primary/20 px-5 py-5 text-center shadow-sm hover:shadow-md hover:shadow-primary/10 hover:border-primary/35 transition-all duration-300 group col-span-2 sm:col-span-1">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <OrgBadge level="Legislatif" color="primary" />
                  </div>
                  <div className="mt-2">
                    <span className="material-symbols-outlined text-[24px] text-primary mb-2 block">account_balance</span>
                    <p className="font-headline font-black text-lg text-primary tracking-tight">Syuriyah</p>
                    <p className="font-body text-xs text-on-surface-variant/50 mt-1">Lembaga Tertinggi · 11 orang</p>
                  </div>
                </div>
                <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/20 px-5 py-5 text-center shadow-sm hover:shadow-md hover:shadow-primary/8 hover:border-outline-variant/40 transition-all duration-300 group col-span-2 sm:col-span-1">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <OrgBadge level="Anggota" color="tertiary" />
                  </div>
                  <div className="mt-2">
                    <span className="material-symbols-outlined text-[24px] text-tertiary mb-2 block">groups</span>
                    <p className="font-headline font-black text-lg text-on-surface tracking-tight">A&apos;wan</p>
                    <p className="font-body text-xs text-on-surface-variant/50 mt-1">Anggota Syuriyah · 8 orang</p>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="w-px h-8 bg-linear-to-b from-outline-variant/60 to-outline-variant/30" />

              {/* Tanfidziyah */}
              <div className="w-full max-w-sm">
                <div className="relative bg-linear-to-br from-secondary/8 to-primary/5 rounded-2xl border border-secondary/25 px-6 py-5 text-center shadow-sm hover:shadow-lg hover:shadow-secondary/10 hover:border-secondary/40 transition-all duration-300 group">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <OrgBadge level="Eksekutif" color="secondary" />
                  </div>
                  <div className="mt-2">
                    <span className="material-symbols-outlined text-[24px] text-secondary mb-2 block">corporate_fare</span>
                    <p className="font-headline font-black text-lg text-on-surface tracking-tight">Tanfidziyah</p>
                    <p className="font-body text-xs text-on-surface-variant/50 mt-1">Badan Pelaksana · 29+ orang</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* PBNU Info */}
          <ScrollReveal delay={0.2}>
            <div className="mt-12 flex items-start gap-4 bg-surface-container-lowest/60 backdrop-blur-xl rounded-2xl border border-outline-variant/15 p-6">
              <span className="material-symbols-outlined text-[22px] text-secondary shrink-0 mt-0.5">info</span>
              <div>
                <p className="font-headline font-bold text-sm text-on-surface mb-1">Berdasarkan Konferensi Cabang II</p>
                <p className="font-body text-sm text-on-surface-variant/60 leading-relaxed">
                  Kepengurusan ini terbentuk melalui Konferensi Cabang II pada <strong className="text-on-surface">14 Desember 2024</strong> di Bolaang Uki, dan disahkan oleh PBNU pada <strong className="text-on-surface">20 Januari 2025</strong> dengan masa khidmat hingga <strong className="text-on-surface">20 Januari 2030</strong>.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Mustasyar ── */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-24 py-24 bg-surface relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/8 blur-[140px] rounded-full opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <SectionTitle
              label="Dewan Penasehat"
              icon="star"
              title="Mustasyar"
              subtitle="Para sesepuh dan penasehat yang berperan memberikan arahan strategis dalam perjalanan kepengurusan PCNU Kabupaten Bolaang Mongondow Selatan."
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mustasyar.map((nama, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <div className="group flex items-center gap-4 bg-surface-container-lowest/70 backdrop-blur-xl rounded-2xl border border-secondary/12 px-6 py-5 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/8 transition-all duration-400 hover:-translate-y-0.5">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-secondary">person</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label text-[9px] font-bold tracking-[0.2em] uppercase text-secondary/50 mb-0.5">Mustasyar #{i + 1}</p>
                    <p className="font-headline font-semibold text-sm text-on-surface leading-snug tracking-tight">{nama}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Syuriyah ── */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-24 py-24 bg-surface-container-low relative overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/10 blur-[130px] rounded-full opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <SectionTitle
              label="Lembaga Tertinggi"
              icon="account_balance"
              title="Syuriyah"
              subtitle="Lembaga pengambilan keputusan tertinggi di tingkat cabang yang bertugas memimpin dan mengawasi jalannya kepengurusan berdasarkan nilai-nilai Islam Ahlussunnah wal Jamaah."
            />
          </ScrollReveal>
          <div className="space-y-2.5">
            {syuriyah.map((item, i) => (
              <ScrollReveal key={i} delay={Math.min(i * 0.04, 0.3)}>
                <JabatanRow item={item} index={i} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── A'wan ── */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-24 py-24 bg-surface relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-tertiary/8 blur-[120px] rounded-full opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <SectionTitle
              label="Anggota Syuriyah"
              icon="groups"
              title="A&apos;wan"
              subtitle="Anggota Dewan Syuriyah yang bersama-sama dengan pimpinan Syuriyah mengemban tanggung jawab kelembagaan dan keagamaan di Kabupaten Bolaang Mongondow Selatan."
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {awan.map((nama, i) => (
              <ScrollReveal key={i} delay={Math.min(i * 0.05, 0.3)}>
                <MemberCard nama={nama} index={i} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tanfidziyah ── */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-24 py-24 bg-surface-container-low relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/8 blur-[150px] rounded-full opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <SectionTitle
              label="Badan Pelaksana"
              icon="corporate_fare"
              title="Tanfidziyah"
              subtitle="Pengurus harian yang bertanggung jawab atas pelaksanaan program kerja dan operasional harian organisasi Nahdlatul Ulama di Kabupaten Bolaang Mongondow Selatan."
            />
          </ScrollReveal>

          {/* Pimpinan Tanfidziyah */}
          <ScrollReveal delay={0.05}>
            <h3 className="font-label text-xs font-bold tracking-[0.3em] uppercase text-on-surface-variant/40 mb-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-outline-variant/30" />
              Pimpinan Tanfidziyah
              <span className="h-px flex-1 bg-outline-variant/30" />
            </h3>
          </ScrollReveal>
          <div className="space-y-2.5 mb-14">
            {tanfidziyahPimpinan.map((item, i) => (
              <ScrollReveal key={i} delay={Math.min(i * 0.035, 0.4)}>
                <JabatanRow item={item} index={i} />
              </ScrollReveal>
            ))}
          </div>

          {/* Anggota Tanfidziyah */}
          <ScrollReveal delay={0.05}>
            <h3 className="font-label text-xs font-bold tracking-[0.3em] uppercase text-on-surface-variant/40 mb-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-outline-variant/30" />
              Anggota Tanfidziyah
              <span className="h-px flex-1 bg-outline-variant/30" />
            </h3>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tanfidziyahAnggota.map((nama, i) => (
              <ScrollReveal key={i} delay={Math.min(i * 0.05, 0.25)}>
                <MemberCard nama={nama} index={i} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Legalitas CTA ── */}
      <section className="w-full py-24 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[70vw] max-w-[550px] h-[70vw] max-h-[550px] bg-primary/12 blur-[140px] rounded-full" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[60vw] max-w-[450px] h-[60vw] max-h-[450px] bg-secondary/12 blur-[110px] rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-8 relative z-10">
          <ScrollReveal>
            <div className="relative bg-surface-container-lowest/60 backdrop-blur-2xl rounded-[2rem] border border-outline-variant/20 shadow-2xl shadow-primary/5 p-8 md:p-12 text-center group overflow-hidden">
              <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/12 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/15 transition-colors">
                <span className="material-symbols-outlined text-[26px] text-secondary">description</span>
              </div>

              <h2 className="font-headline font-black text-2xl md:text-3xl text-primary tracking-tighter mb-3">
                Legalitas &amp; Keabsahan Kepengurusan
              </h2>
              <p className="text-on-surface-variant/60 text-base max-w-xl mx-auto font-body leading-relaxed mb-8">
                Komposisi dan personalia pengurus ini telah disahkan secara resmi oleh Pengurus Besar Nahdlatul Ulama. Ditandatangani secara elektronik dan distempel digital oleh Peruri Tera.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-3 px-5 py-3 bg-primary/5 border border-primary/15 rounded-xl">
                  <span className="material-symbols-outlined text-[18px] text-primary">verified_user</span>
                  <div className="text-left">
                    <p className="font-label text-[9px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40">Status</p>
                    <p className="font-headline font-bold text-sm text-primary">Resmi &amp; Sah</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-3 px-5 py-3 bg-secondary/5 border border-secondary/15 rounded-xl">
                  <span className="material-symbols-outlined text-[18px] text-secondary">calendar_month</span>
                  <div className="text-left">
                    <p className="font-label text-[9px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40">Berlaku Hingga</p>
                    <p className="font-headline font-bold text-sm text-primary">20 Januari 2030</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-3 px-5 py-3 bg-surface-container border border-outline-variant/20 rounded-xl">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant/50">location_city</span>
                  <div className="text-left">
                    <p className="font-label text-[9px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40">Ditetapkan di</p>
                    <p className="font-headline font-bold text-sm text-on-surface">Jakarta</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
