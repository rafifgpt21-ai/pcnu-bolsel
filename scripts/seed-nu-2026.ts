import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

const newsData = [
  {
    title: "Apresiasi PBNU terhadap Kelancaran Mudik 2026",
    content: "Ketua PBNU, KH Ahmad Fahrur Rozi, memberikan apresiasi tinggi kepada Polri dan seluruh pemangku kepentingan atas kesuksesan pengamanan arus mudik Lebaran 2026 yang dinilai aman dan terkendali.",
    url: "https://news.detik.com/berita/d-8421722/ketua-pbnu-puji-kesigapan-polri-mudik-2026-sukses-dan-aman-terkendali",
    category: "Berita",
    thumbnail: "https://images.unsplash.com/photo-1594818371393-34528ff3c67d?w=1200&auto=format&fit=crop"
  },
  {
    title: "Peluncuran Program Solidaritas Ramadan 2026",
    content: "NU Care-LAZISNU PBNU resmi meluncurkan program 'Solidaritas Ramadan' yang berfokus pada bantuan kemanusiaan bagi penyintas bencana di Indonesia dan bantuan berkelanjutan untuk Palestina.",
    url: "https://nasional.sindonews.com/read/1673683/15/program-solidaritas-ramadan-2026-fokus-dampingi-penyintas-bencana-dan-palestina-1770256941",
    category: "Berita",
    thumbnail: "https://images.unsplash.com/photo-1597284099341-3968175d2ff3?w=1200&auto=format&fit=crop"
  },
  {
    title: "UNUSIDA Raih Enam Penghargaan LPTNU Award 2026",
    content: "Universitas Nahdlatul Ulama Sidoarjo (UNUSIDA) memenangkan enam kategori dalam LPTNU Award 2026, membuktikan kualitas pendidikan tinggi NU dalam bidang riset dan pengabdian masyarakat.",
    url: "https://timesindonesia.co.id/pendidikan/581525/unusida-raih-enam-penghargaan-dalam-lptnu-award-2026",
    category: "Berita",
    thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop"
  },
  {
    title: "Persiapan Muktamar ke-35 NU di Pesantren",
    content: "Ketua Umum PBNU, KH Yahya Cholil Staquf, membawa usulan dari para kiai sepuh agar Muktamar NU tahun 2026 diselenggarakan di lingkungan pesantren (Lirboyo) untuk menjaga marwah dan tradisi keilmuan.",
    url: "https://cahaya.kompas.com/aktual/26C30091400090/gus-yahya-bawa-pesan-kiai-sepuh-muktamar-nu-diusulkan-digelar-di-pesantren",
    category: "Berita",
    thumbnail: "https://images.unsplash.com/photo-1584281722573-f111ce39031c?w=1200&auto=format&fit=crop"
  },
  {
    title: "UNUSA Targetkan Peringkat 600 Besar Dunia (THE Impact Rankings)",
    content: "Universitas Nahdlatul Ulama Surabaya (UNUSA) menetapkan target ambisius untuk masuk dalam jajaran 600 besar dunia pada THE Impact Rankings 2026 sebagai bagian dari kontribusi terhadap SDG's.",
    url: "https://unusa.ac.id/2026/01/09/2026-unusa-target-masuk-600-the-impact-rangkings/",
    category: "Berita",
    thumbnail: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=1200&auto=format&fit=crop"
  },
  {
    title: "Sinergi Ekonomi NU dan Muhammadiyah",
    content: "Adanya dorongan kuat bagi kolaborasi antara dua ormas Islam terbesar, NU dan Muhammadiyah, dalam program pemberdayaan ekonomi umat guna memperkuat kemandirian ekonomi nasional.",
    url: "https://www.antaranews.com/berita/5496666/anggota-dpr-nu-dan-muhammadiyah-perlu-kolaborasi-berdayakan-ekonomi",
    category: "Berita",
    thumbnail: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&auto=format&fit=crop"
  },
  {
    title: "IPPNU Gresik Borong Penghargaan Prestasi Organisasi",
    content: "PC IPPNU Gresik meraih lima kategori penghargaan dalam PW IPPNU Jatim Award 2026, menonjolkan keunggulan dalam sistem kaderisasi dan pengelolaan media kreatif bagi generasi muda.",
    url: "https://www.nugresik.or.id/bergelimang-prestasi-pc-ippnu-gresik-rebut-juara-1-di-dua-kategori-pw-ippnu-award-2026/",
    category: "Berita",
    thumbnail: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop"
  },
  {
    title: "Penentuan Idul Fitri Berbasis Sains Falakiyah",
    content: "Lembaga Falakiyah PBNU secara konsisten memberikan edukasi publik mengenai penentuan kalender hijriah berbasis data astronomi yang akurat untuk memberikan kepastian ibadah bagi umat.",
    url: "https://madiun.jatimtimes.com/baca/3331340232/20260316/072300/hilal-belum-penuhi-imkanur-rukyah-lembaga-falakiyah-pbnu-prediksi-lebaran-21-maret-2026",
    category: "Berita",
    thumbnail: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1200&auto=format&fit=crop"
  },
  {
    title: "Penyaluran Zakat dan Sosmed untuk Pemberdayaan",
    content: "NU Care-LAZISNU di tingkat daerah (seperti Depok dan Lampung) melaporkan peningkatan penghimpunan dana sosial yang langsung disalurkan untuk program pemberdayaan ekonomi dan bantuan sosial sepanjang Ramadan 1447 H.",
    url: "https://www.nucare.id/nasional/solidaritas-ramadan-2026-nu-care-lazisnu-fokus-dampingi-penyintas-bencana-dan-palestina",
    category: "Berita",
    thumbnail: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&auto=format&fit=crop"
  },
  {
    title: "Diplomasi Internasional dan Moderasi Beragama",
    content: "PBNU terus aktif mendorong agenda strategis melalui diplomasi internasional dan dialog lintas agama, memperkuat posisi NU sebagai pilar moderasi beragama di tingkat global.",
    url: "https://cahaya.kompas.com/aktual/26C30080011790/muktamar-nu-2026-makin-dekat-gus-ipul-panitia-sudah-dibentuk-calon-ketum-belum",
    category: "Berita",
    thumbnail: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop"
  }
]

async function main() {
  console.log('🚀 Seeding Berita Positif NU 2026...')

  for (const item of newsData) {
    const slug = slugify(item.title)
    
    // Check if post already exists to avoid unique constraint error on slug
    const existing = await prisma.post.findUnique({
      where: { slug }
    })

    if (existing) {
      console.log(`⏩ Skipping "${item.title}" (slug exists)`)
      continue
    }

    await prisma.post.create({
      data: {
        title: item.title,
        slug,
        category: item.category,
        status: 'Published',
        thumbnail: item.thumbnail,
        blocks: [
          {
            id: randomUUID(),
            type: 'text',
            content: `<p>${item.content}</p>`,
          },
          {
            id: randomUUID(),
            type: 'link',
            content: 'Baca selengkapnya',
            url: item.url,
            title: 'Sumber Berita'
          }
        ]
      }
    })
    console.log(`✅ Created: ${item.title}`)
  }

  console.log('✨ Seeding completion successful!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed!')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
