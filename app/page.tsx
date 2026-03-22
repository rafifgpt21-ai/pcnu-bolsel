import Link from 'next/link';
import { getPosts } from '@/lib/actions/post';

export default async function Home() {
  const allPosts = await getPosts({ status: 'Published' });
  const latestPosts = allPosts.slice(0, 4);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[870px] flex flex-col items-center justify-center px-8 text-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-secondary-fixed blur-[120px] rounded-full"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary-fixed blur-[120px] rounded-full"></div>
        </div>

        {/* Impact Chips */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="bg-surface-container-lowest px-5 py-2 rounded-full text-xs font-label font-semibold tracking-widest uppercase text-secondary flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            10+ Buku
          </div>
          <div className="bg-surface-container-lowest px-5 py-2 rounded-full text-xs font-label font-semibold tracking-widest uppercase text-secondary flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">description</span>
            50+ Jurnal Ilmiah
          </div>
          <div className="bg-surface-container-lowest px-5 py-2 rounded-full text-xs font-label font-semibold tracking-widest uppercase text-secondary flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            Pendiri Jagat &apos;Arsy
          </div>
        </div>

        {/* Main Typography */}
        <h1 className="font-headline font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight text-primary leading-[1.1] mb-8 max-w-5xl">
          Menyemai Pemikiran,<br />
          <span className="text-secondary">Menggerakkan</span> Perubahan
        </h1>

        {/* Search Bar Area */}
        <div className="w-full max-w-2xl mt-8 relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-secondary to-primary-container rounded-full blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
          <div className="relative bg-surface-container-low/80 glass-effect rounded-full px-8 py-5 flex items-center gap-4 border border-outline-variant/15">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input
              className="bg-transparent border-none outline-none focus:ring-0 w-full font-body text-lg placeholder:text-on-surface-variant/60"
              placeholder="Cari topik tasawuf, sosial, atau judul buku..."
              type="text"
            />
            <button className="bg-secondary text-on-secondary px-6 py-2 rounded-full font-headline font-semibold text-sm hover:scale-105 transition-transform duration-200 cursor-pointer">
              Cari
            </button>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mt-16">
          <Link href="#arsip" className="group flex items-center gap-3 font-headline font-bold text-lg tracking-tight text-primary hover:text-secondary transition-colors duration-300">
            Jelajahi Pemikiran
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Content Section */}
      <section id="arsip" className="w-full px-6 md:px-12 lg:px-24 mx-auto py-24">
        <div className="mb-16">
          <span className="font-label text-xs font-bold tracking-[0.2em] text-secondary uppercase">Arsip Terkini</span>
          <h2 className="font-headline font-bold text-4xl mt-4 text-primary">Karya &amp; Diskusi Terbaru</h2>
        </div>

        {latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/15 hover:shadow-lg transition-all duration-300"
              >
                {/* Thumbnail or accent bar */}
                {post.thumbnail ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={post.title}
                      src={post.thumbnail}
                    />
                  </div>
                ) : (
                  <div className="h-2 bg-gradient-to-r from-secondary to-primary-container"></div>
                )}
                <div className="p-8">
                  <span className="text-secondary font-label text-xs font-bold tracking-widest uppercase mb-3 block">
                    {post.category}
                  </span>
                  <h3 className="font-headline font-bold text-xl text-primary mb-3 leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm">
                    {new Date(post.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <div className="mt-6 inline-flex items-center text-secondary font-bold text-sm gap-2 group-hover:gap-3 transition-all">
                    Baca Selengkapnya
                    <span className="material-symbols-outlined text-[18px]">east</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex w-20 h-20 items-center justify-center rounded-3xl bg-surface-container mb-5 text-on-surface-variant/30">
              <span className="material-symbols-outlined text-4xl">library_books</span>
            </div>
            <p className="text-lg font-bold text-on-surface-variant">Belum ada karya yang dipublikasikan</p>
            <p className="text-sm text-on-surface-variant/60 mt-1">Karya akan segera ditampilkan di sini.</p>
          </div>
        )}
      </section>
    </>
  );
}
