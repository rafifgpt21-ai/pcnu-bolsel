import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { checkRateLimit } from "@/lib/rate-limit"
import { authConfig } from "./auth.config"

if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("Missing AUTH_SECRET environment variable.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  // @ts-expect-error PrismaAdapter type expects standard @prisma/client, but we use a custom output path.
  // The runtime compatibility is verified.
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email atau Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Kredensial tidak lengkap")
        }
        
        const identifier = credentials.identifier as string
        
        // Rate Limiting Check
        const limit = await checkRateLimit(identifier);
        if (!limit.success) {
          const waitMinutes = limit.resetTime 
            ? Math.ceil((limit.resetTime.getTime() - new Date().getTime()) / 60000)
            : 15;
          throw new Error(`Terlalu banyak percobaan login. Silakan coba lagi dalam ${waitMinutes} menit.`);
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { username: identifier }
            ]
          }
        })

        if (!user || !user.password) {
          throw new Error("Pengguna tidak ditemukan atau kredensial salah")
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValidPassword) {
          throw new Error("Pengguna tidak ditemukan atau kredensial salah")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
})

