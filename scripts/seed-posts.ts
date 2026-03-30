import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

const categories = ['Berita']
const statuses = ['Published', 'Draft']

const themes = [
  'PCNU Bolsel', 'Kegiatan MWC', 'Pengajian Rutin', 'Lailatul Ijtima', 
  'Pendidikan Madrasah', 'Peringatan Hari Besar', 'Kemah Santri', 'Musyawarah Kerja',
  'Bahtsul Masail', 'Santunan Yatim'
]

const adjectives = [
  'Sukses Gelar', 'Hadiri', 'Dukung Penuh', 'Kawal', 'Selenggarakan', 'Bangun Sinergi',
  'Resmikan', 'Perkuat', 'Tingkatkan', 'Apresiasi'
]

function generateRandomTitle(index: number) {
  const theme = themes[index % themes.length]
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  return `${adjective} ${theme} di Kabupaten Bolsel`
}

const unsplashImages = [
  'https://images.unsplash.com/photo-1542869781-a272dcbc0ba4', // Mosque
  'https://images.unsplash.com/photo-1574345241065-22d7ba4e5ddc', // Abstract geometric
  'https://images.unsplash.com/photo-1579766948293-2ce16d1ba42c', // Islamic pattern
  'https://images.unsplash.com/photo-1600865588722-1d5733f37b12', // Culture
]

function getRandomImage() {
  const base = unsplashImages[Math.floor(Math.random() * unsplashImages.length)]
  return `${base}?w=1200&auto=format&fit=crop`
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

function createTextBlocks(theme: string): any[] {
  return [
    {
      id: randomUUID(),
      type: 'text',
      content: `<h2>Laporan Utama: ${theme}</h2><p>Pengurus Cabang Nahdlatul Ulama (PCNU) Kabupaten Bolaang Mongondow Selatan terus berupaya menebar maslahat melalui berbagai program kerja.</p><p>Acara ini dihadiri oleh jajaran syuriah, tanfidziyah, serta badan otonom NU se-Kabupaten Bolsel.</p>`,
    },
    {
      id: randomUUID(),
      type: 'text',
      content: '<h3>Poin Penting Agenda</h3><ul><li>Memperkuat ukhuwah nahdliyah</li><li>Membahas isu-isu keumatan</li><li>Konsolidasi organisasi di tingkat ranting</li></ul>',
    }
  ]
}

async function main() {
  console.log('🚀 Starting seed for PCNU Bolsel news portal...')

  // Turn off safety checks to allow deleting everything, or just delete many
  await prisma.post.deleteMany({})

  for (let i = 0; i < 20; i++) {
    const title = generateRandomTitle(i)
    const category = categories[0]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const slug = `${slugify(title)}-${Math.random().toString(36).substring(2, 7)}`
    const theme = themes[i % themes.length]

    const postBlocks = [...createTextBlocks(theme)]

    await prisma.post.create({
      data: {
        title,
        slug,
        category,
        status,
        thumbnail: getRandomImage(),
        blocks: postBlocks
      }
    })

    if (i % 5 === 0) {
      console.log(`📦 Generated ${i} posts...`)
    }
  }

  console.log('✨ Success! 20 posts created for PCNU Bolsel.')
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
