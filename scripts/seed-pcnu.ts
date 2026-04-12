import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = 'adminpcnubolsel'
  const password = 'pcnubolsel301074'
  const email = 'admin@bolsel.pcnu.or.id'

  const hashedPassword = await bcrypt.hash(password, 10)

  // Upsert using username as the unique identifier
  const admin = await prisma.user.upsert({
    where: { username: username },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      name: 'Admin PCNU Bolsel',
    },
    create: {
      username: username,
      email: email,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      name: 'Admin PCNU Bolsel',
    },
  })

  console.log(`✅ Admin user seeded successfully!`)
  console.log(`Username: ${admin.username}`)
  console.log(`Email:    ${admin.email}`)
  console.log(`Password: ${password}`)
  console.log(`Role:     ${admin.role}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
