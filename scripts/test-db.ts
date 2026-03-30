import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const posts = await prisma.post.findMany({})
    console.log('--- DB CHECK ---')
    console.log(`Found ${posts.length} posts.`)
    posts.forEach(p => console.log(`- [${p.status}] ${p.title} (${p.slug})`))
    console.log('----------------')
  } catch (err) {
    console.error('Prisma query failed:', err)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
