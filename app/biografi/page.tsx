import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biografi - Budi Rahman Hakim",
  description: "Profil akademisi, penulis, dan pembina spiritual yang bergiat di persimpangan antara ilmu, nilai, dan gerakan transformatif.",
};

const EducationItem = ({ degree, institution, location, scholarship }: { degree: string, institution: string, location?: string, scholarship?: string }) => (
  <div className="relative pl-8 pb-8 border-l border-gray-200 last:border-0 last:pb-0">
    <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#0052d1]" />
    <h3 className="font-headline font-bold text-lg text-primary">{degree}</h3>
    <p className="font-body text-on-surface/80 mt-1">{institution}</p>
    {location && <p className="font-body text-xs text-on-surface/60">{location}</p>}
    {scholarship && <p className="font-label text-[10px] uppercase tracking-wider text-[#0052d1] mt-2 font-bold">{scholarship}</p>}
  </div>
);

const RoleItem = ({ role, organization, years }: { role: string, organization: string, years?: string }) => (
  <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 group">
    <span className="font-label text-xs uppercase tracking-widest text-on-surface/40 min-w-[120px] shrink-0">{years || "Sekarang"}</span>
    <div className="flex-1">
      <h3 className="font-headline font-bold text-primary group-hover:text-[#0052d1] transition-colors">{role}</h3>
      <p className="font-body text-sm text-on-surface/70">{organization}</p>
    </div>
  </div>
);

const BookItem = ({ title, year }: { title: string, year: string }) => (
  <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-secondary/5 flex items-center justify-center text-[#0052d1] shrink-0 group-hover:bg-[#0052d1] group-hover:text-white transition-colors">
        <span className="material-symbols-outlined text-xl">book</span>
      </div>
      <div>
        <h4 className="font-headline font-bold text-sm text-primary leading-tight">{title}</h4>
        <p className="font-label text-[10px] text-on-surface/40 mt-1">{year}</p>
      </div>
    </div>
  </div>
);

export default function BiografiPage() {
  const expertise = [
    "Spiritualitas & Tasawuf",
    "Kesejahteraan & Pembangunan Sosial",
    "Komunikasi & Penulisan",
    "Kajian Peradaban",
    "Pendidikan Karakter"
  ];

  const books = [
    { title: "Genealogi Neosufisme di Indonesia: Dari Asketisme ke Aktivisme Sosial", year: "2025" },
    { title: "Akhlak Tasawuf: Pendidikan Karakter Berbasis Tarekat Sufi", year: "2025" },
    { title: "Pengantar Ilmu Tasawuf: Fondasi Konseptual, Kerangka Filsafat dan Relevansi Zaman", year: "2025" },
    { title: "Selayang Pandang Tasawuf & Tarekat Sufi", year: "2024" },
    { title: "Neosufisme, Perjuangan Kemerdekaan & Cita-cita Negara Modern: Biografi Abah Sepuh", year: "2022" },
    { title: "Seri Lautan Tanpa Tepi jilid 1–9", year: "2021" },
    { title: "Actualization of Neo-Sufisme: A Case Study of the Tariqa Qadiriyya Naqshabandiyya Pondok Pesantren Suryalaya", year: "2020" },
    { title: "Tuntunan Sholat Thoriqoh", year: "2018" },
    { title: "Kanzul Arsy jilid 1–5", year: "2017" },
    { title: "Rethinking Social Work Indonesia", year: "2015" },
    { title: "Kenapa Berthoriqoh", year: "2015" },
    { title: "Menembus Ruang dan Waktu Jilid 1-2", year: "2014" },
    { title: "Teologi Penanggulangan Kemiskinan", year: "2006" },
  ];

  const journals = [
    { title: "Karakteristik dan Isu-Isu Social Work Mutakhir di Indonesia", ref: "Empati: Jurnal Ilmu Kesejahteraan Sosial. 3(1).", url: "https://journal.uinjkt.ac.id/index.php/empati/article/view/9758", year: "2014" },
    { title: "Tasawuf, Nasionalisme, dan Gerakan Sosial: Studi Spiritualitas Transformasional Abah Sepuh dalam Konteks Kolonialisme dan Kemerdekaan", ref: "Jurnal Sosial Humaniora Dan Pendidikan, 2(2), 213–226.", url: "https://doi.org/10.55606/inovasi.v2i2.4761", year: "2023" },
    { title: "Neosufisme sebagai Etika Pembangunan: Studi Atas Transformasi Spiritual Tarekat Qadiriyah Naqsyabandiyah Suryalaya di Era Orde Baru", ref: "Jurnal Riset Rumpun Agama Dan Filsafat, 2(2), 267–278.", url: "https://doi.org/10.55606/jurrafi.v2i2.5982", year: "2023" },
    { title: "Integration of Neo-Sufism in the Social Welfare Education Curriculum in Indonesian Islamic Universities", ref: "International Journal of Education, Language, Literature, Arts, Culture, and Social Humanities, 1(4), 157–167.", url: "https://doi.org/10.59024/ijellacush.v1i4.1504", year: "2023" },
    { title: "Genealogi Tarekat Neosufi di Indonesia: dari Ritual Eksklusif ke Aksi Sosial Kolektif", ref: "Jurnal Riset Rumpun Ilmu Sosial, Politik Dan Humaniora, 3(1), 247–259.", url: "https://doi.org/10.55606/jurrish.v3i1.5983", year: "2024" },
    { title: "Integrasi Sociopreneurship dalam Pendidikan Kesejahteraan Sosial: Analisis Kebutuhan dan Model Kurikulum di Perguruan Tinggi Islam Indonesia", ref: "Jurnal Riset Rumpun Ilmu Pendidikan, 3(1), 187–200.", url: "https://doi.org/10.55606/jurripen.v4i1.4963", year: "2024" },
    { title: "Transformasi dari Sociopreneurship ke Sufipreneurship: Kerangka Konseptual untuk Menspiritualkan Dunia Kewirausahaan dalam Islam Kontemporer", ref: "International Journal of Teaching and Learning, 2(9), 2695-2707.", url: "https://injotel.org/index.php/12/article/view/396", year: "2024" },
    { title: "Neo-Sufism as a Social Da’wah Paradigm: Addressing Challenges and Transforming Spirituality in Modern Indonesia", ref: "International Journal of Educational Technology and Society, 1(3), 14–33.", url: "https://doi.org/10.61132/ijets.v1i3.336", year: "2024" },
    { title: "Optimizing ZIS for Social Welfare: Integrating Religious Values, State Policy, and the Role of Social Workers in Indonesia", ref: "Smart Society : Community Service and Empowerment Journal, 5(1), 21-29.", url: "https://doi.org/10.58524/smartsociety.v5i1.746", year: "2025" },
    { title: "Neo-Sufism and Social Welfare: The Perspective Of Indonesian Muslim Social Workers", ref: "EMPATI: Jurnal Ilmu Kesejahteraan Sosial. 14(1), 1-17.", url: "https://journal.uinjkt.ac.id/index.php/empati/article/view/46314/pdf", year: "2025" },
    { title: "Transformation of Sufistic Da’wah and Islamic Psychotherapy Through Online Manaqib: A Qualitative Case Study on Tarekat Qadiriyah Naqsyabandiyah Community in Indonesia.", ref: "G-Couns: Jurnal Bimbingan Dan Konseling, 9(3), 2278–2291.", url: "https://doi.org/10.31316/g-couns.v9i3.7780", year: "2025" },
    { title: "Sufi Social Work dalam konteks Indonesia Modern: Tinjauan tematik atas kerangka teoretis dan praktik (1990–2024)", ref: "SHARE Social Work Journal, 15(1), 1-12.", url: "https://jurnal.unpad.ac.id/share/article/view/63635/26197", year: "2025" },
  ];

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/5 -skew-x-12 translate-x-1/4 z-0" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="relative group">
            <div className="absolute -inset-4 bg-[#0052d1]/10 rounded-full blur-2xl group-hover:bg-[#0052d1]/20 transition-all duration-700" />
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-8 border-white shadow-2xl">
              <img 
                src="https://brh.co.id/Profil.jpeg" 
                alt="Budi Rahman Hakim" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-headline font-black text-5xl md:text-7xl text-primary tracking-tighter leading-none mb-6">
              Budi Rahman <span className="text-[#0052d1]">Hakim</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface/70 font-light max-w-2xl leading-relaxed italic">
              "Merintis jalan tengah antara dzikir dan pikir, antara spiritualitas dan transformasi sosial."
            </p>
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
              {expertise.map((skill) => (
                <span key={skill} className="px-4 py-2 rounded-full bg-secondary/5 text-secondary text-[10px] font-label font-bold uppercase tracking-wider border border-secondary/10">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <div className="px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sidebar Info */}
        <aside className="lg:col-span-4 space-y-12">
          {/* Contact Card */}
          <div className="p-8 rounded-3xl bg-secondary-container/30 border border-secondary/10 sticky top-32">
            <h2 className="font-headline font-black text-2xl text-primary mb-8 tracking-tight">Kontak & Info</h2>
            <div className="space-y-6">
              <a href="mailto:budi.rahman@uinjkt.ac.id" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#0052d1] group-hover:bg-[#0052d1] group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </div>
                <div>
                  <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface/40">Email</p>
                  <p className="font-body text-sm font-medium">budi.rahman@uinjkt.ac.id</p>
                </div>
              </a>
              <a href="https://www.brh.co.id" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#0052d1] group-hover:bg-[#0052d1] group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-lg">language</span>
                </div>
                <div>
                  <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface/40">Situs Web</p>
                  <p className="font-body text-sm font-medium">www.brh.co.id</p>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#0052d1]">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                </div>
                <div>
                  <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface/40">Lokasi</p>
                  <p className="font-body text-sm font-medium">Tangerang Selatan, Indonesia</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-secondary/10">
              <p className="font-body text-sm text-on-surface/60 leading-relaxed">
                Akademisi, penulis, dan pembina spiritual yang bergiat di persimpangan antara ilmu, nilai, dan gerakan transformatif.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Sections */}
        <main className="lg:col-span-8 space-y-24">
          
          {/* Profile Section */}
          <section>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-label text-4xl font-black text-[#0052d1]/20">01</span>
              <h2 className="font-headline font-black text-4xl text-primary tracking-tight">Profil Profesional</h2>
            </div>
            <div className="prose prose-lg max-w-none text-on-surface/80 font-body leading-relaxed">
              <p>
                Tumbuh dalam tradisi pesantren sebelum menapaki jalan keilmuan lintas benua yang mempertemukan nilai-nilai tasawuf dengan praksis peradaban. 
                Fokus utama dalam pengabdian beliau adalah merancang integrasi antara kearifan spiritual Islam dengan solusi tantangan sosial modern.
              </p>
            </div>
          </section>

          {/* Education Section */}
          <section>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-label text-4xl font-black text-[#0052d1]/20">02</span>
              <h2 className="font-headline font-black text-4xl text-primary tracking-tight">Pendidikan</h2>
            </div>
            <div className="mt-8">
              <EducationItem 
                degree="Doctor of Philosophy (Ph.D.)"
                institution="Tilburg University School of Humanities and Digital Science, Belanda"
                scholarship="MORA Scholarship"
              />
              <EducationItem 
                degree="Master of Social Work (M.S.W.)"
                institution="McGill University School of Social Work, Montreal, Kanada"
                scholarship="CIDA Scholarship"
              />
              <EducationItem 
                degree="Bachelor of Social Work (B.S.W.)"
                institution="McGill University School of Social Work, Montreal, Kanada"
                location="Kajian Sosial Tradisional"
                scholarship="CIDA Scholarship"
              />
              <EducationItem 
                degree="Sarjana Agama (S.Ag.)"
                institution="UIN Syarif Hidayatullah Jakarta"
                location="Jurusan Komunikasi & Penyiaran Islam"
                scholarship="MORA Scholarship"
              />
            </div>
          </section>

          {/* Roles Section */}
          <section>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-label text-4xl font-black text-[#0052d1]/20">03</span>
              <h2 className="font-headline font-black text-4xl text-primary tracking-tight">Kiprah & Pengalaman</h2>
            </div>
            <div className="space-y-10">
              <RoleItem role="Dosen Tetap" organization="UIN Syarif Hidayatullah Jakarta" />
              <RoleItem role="Pendiri & Pengasuh" organization="Pesantren Peradaban Dunia JAGAT 'ARSY" />
              <RoleItem role="Penasehat Keruhanian" organization="Keraton KESULTANAN KACIREBONAN & SUMEDANG LARANG" years="2021—Sekarang" />
              <RoleItem role="Ketua Penasehat" organization="Madrosah Pusat Thoriqoh Qoodiriyyah Naqsyabandiyyah Mahad Suryalaya Sirnarasa" years="2019—Sekarang" />
              <RoleItem role="Staf Khusus" organization="Menteri Negara BUMN" years="2010—2014" />
              <RoleItem role="Konsultan Media" organization="Presiden RI" years="2009" />
              <RoleItem role="Wartawan Senior" organization="Koran Politik Rakyat Merdeka" />
              <RoleItem role="Bendahara Umum" organization="Persatuan Wartawan Indonesia (PWI) Pusat" years="2008—2018" />
            </div>
          </section>

          {/* Publications Section */}
          <section>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-label text-4xl font-black text-[#0052d1]/20">04</span>
              <h2 className="font-headline font-black text-4xl text-primary tracking-tight">Karya Tulis</h2>
            </div>
            
            <div className="mt-12">
              <h3 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0052d1]">menu_book</span>
                Buku Pilihan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book) => (
                  <BookItem key={book.title} title={book.title} year={book.year} />
                ))}
              </div>
            </div>

            <div className="mt-16">
              <h3 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0052d1]">article</span>
                Publikasi Jurnal
              </h3>
              <div className="space-y-6">
                {journals.map((journal) => (
                  <div key={journal.title} className="group border-b border-gray-100 pb-6 last:border-0 hover:border-[#0052d1]/20 transition-colors">
                    <p className="font-label text-[10px] text-on-surface/40 uppercase tracking-widest mb-2">{journal.year}</p>
                    <a href={journal.url} target="_blank" rel="noopener noreferrer" className="block group">
                      <h4 className="font-headline font-bold text-primary group-hover:text-[#0052d1] transition-colors leading-snug text-balance">
                        {journal.title}
                      </h4>
                      <p className="font-body text-sm text-on-surface/60 mt-2 italic">{journal.ref}</p>
                      <div className="mt-3 flex items-center gap-2 text-[10px] font-label font-bold text-[#0052d1] opacity-0 group-hover:opacity-100 transition-opacity">
                        LIHAT DOKUMEN 
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
