import Link from 'next/link';
import NewsCard from '@/components/home/NewsCard';
import dynamic from 'next/dynamic';
import { getPosts } from '@/lib/actions/post';
import HomeHero from '@/components/home/HomeHero';

// Dynamically import components that are below the fold


const ScrollReveal = dynamic(() => import('@/components/home/ScrollReveal'), {
  ssr: true,
});

export default async function Home() {
  const allPosts = await getPosts({ status: 'Published' });
  const latestPosts = allPosts.slice(0, 4);

  return (
    <div className="public-ui">
      {/* Hero Section */}
      <HomeHero />



      {/* Content Section - News Hub */}
      <section id="arsip" className="w-full px-4 sm:px-8 md:px-12 lg:px-24 mx-auto py-16 md:py-32 bg-surface relative z-20">
        <ScrollReveal className="mb-8 md:mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-b border-outline-variant/25 pb-6 md:pb-12">
            <div className="max-w-3xl">
              <span className="font-label text-xs font-bold tracking-widest md:tracking-[0.4em] text-public-accent uppercase block mb-6 px-4 py-1.5 bg-secondary/5 rounded-full w-fit border border-secondary/10">WARTA & INFORMASI</span>
              <h2 className="font-headline font-black text-4xl md:text-6xl lg:text-7xl text-primary leading-[1.1] tracking-tighter">
                Berita Terkini & <span className="text-public-accent italic">Wawasan</span> Islam
              </h2>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-on-surface-variant/80 font-label text-xs tracking-widest uppercase mb-2">Terakhir Diperbarui</p>
              <p className="text-primary font-bold text-sm tracking-tight">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-5 sm:gap-6 xl:gap-8">
            {latestPosts.map((post, index) => (
              <ScrollReveal key={post.id} delay={index * 0.1}>
                <NewsCard post={post} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal>
            <div className="relative overflow-hidden bg-surface-container-lowest/40 backdrop-blur-xl rounded-[3rem] border border-outline-variant/20 p-8 md:p-16 lg:p-24 shadow-2xl shadow-primary/5">
              {/* Decorative Background for Empty State */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 blur-[100px] rounded-full -mr-48 -mt-48"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full -ml-48 -mb-48"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-10 group">
                  <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full scale-50 group-hover:scale-100 transition-transform duration-1000"></div>
                  <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-[2.5rem] bg-linear-to-br from-surface-container-highest to-surface-container border border-outline-variant/30 shadow-xl group-hover:rotate-12 transition-transform duration-700">
                    <span aria-hidden="true" className="material-symbols-outlined text-5xl md:text-6xl text-public-accent select-none">news</span>
                  </div>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black text-primary mb-4 tracking-tighter leading-tight">
                  Warta Baru Sedang <br className="sm:hidden" />
                  <span className="text-public-accent italic">Dipersiapkan</span>
                </h3>
                
                <p className="text-on-surface-variant/80 text-lg md:text-xl max-w-xl mx-auto font-body leading-relaxed mb-12">
                  Tim redaksi kami sedang merangkum informasi terkini dan artikel bermanfaat untuk Anda. Pantau terus halaman ini.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 opacity-40 grayscale pointer-events-none select-none">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-1.5 w-12 md:w-20 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.4} className="mt-10 md:mt-20 text-center">
           <Link 
             href="/explore" 
             className="inline-flex max-w-full min-h-11 items-center justify-center gap-3 px-5 sm:px-10 py-4 sm:py-5 bg-primary text-on-primary rounded-full font-headline font-bold text-lg hover:bg-secondary transition-all duration-500 hover:shadow-xl hover:shadow-secondary/20 hover:-translate-y-1"
           >
             Jelajah Semua Berita
             <span aria-hidden="true" className="material-symbols-outlined">grid_view</span>
           </Link>
        </ScrollReveal>
      </section>

      <section className="w-full py-16 md:py-32 bg-surface relative overflow-hidden">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute inset-0 opacity-20 md:opacity-40">
           <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[80vw] max-w-[600px] h-[80vw] max-h-[600px] bg-primary/20 md:blur-[130px] blur-[60px] rounded-full mix-blend-multiply pointer-events-none"></div>
           <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[70vw] max-w-[500px] h-[70vw] max-h-[500px] bg-secondary/20 md:blur-[100px] blur-[50px] rounded-full mix-blend-multiply pointer-events-none"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 relative z-10">
          <ScrollReveal className="relative bg-surface-container-lowest/80 sm:bg-surface-container-lowest/60 sm:backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3.5rem] p-5 sm:p-8 md:p-14 lg:p-20 border border-outline-variant/20 shadow-xl shadow-primary/5 text-center group overflow-hidden">
            <span aria-hidden="true" className="material-symbols-outlined text-public-accent text-8xl md:text-[10rem] mb-0 opacity-10 absolute top-0 w-full left-0 text-center -z-10 group-hover:scale-110 transition-transform duration-1000">format_quote</span>
            <div className="inline-flex w-20 h-20 rounded-full bg-primary/5 items-center justify-center mb-8 border border-primary/10 group-hover:bg-primary/10 transition-colors">
               <span aria-hidden="true" className="material-symbols-outlined text-public-accent text-4xl drop-shadow-sm">auto_awesome</span>
            </div>
            
            <h2 className="font-headline font-black text-2xl md:text-4xl lg:text-[2.75rem] text-primary leading-normal tracking-tight mb-12 italic relative z-10 opacity-90 group-hover:opacity-100 transition-opacity duration-500">
              &quot;Jangan jadikan perbedaan pendapat sebagai sebab perpecahan dan permusuhan. Karena yang demikian itu merupakan kejahatan besar yang bisa meruntuhkan bangunan masyarakat, dan menutup pintu kebaikan di penjuru mana saja.&quot;
            </h2>
            
            <div className="flex flex-col items-center relative z-10">
               <div className="h-[2px] w-16 bg-linear-to-r from-transparent via-secondary to-transparent mb-6"></div>
               <p className="font-headline font-black text-xl md:text-2xl text-primary tracking-tight">Hadratussyekh KH. Hasyim Asy&apos;ari</p>
               <p className="font-label text-public-accent tracking-[0.3em] uppercase font-bold text-xs md:text-xs mt-3">Muassis Nahdlatul Ulama</p>
            </div>
            
            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 rounded-[2.5rem] md:rounded-[3.5rem] ring-1 ring-inset ring-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
