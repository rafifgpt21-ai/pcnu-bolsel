import { prisma } from "./prisma";

interface RateLimitResult {
  success: boolean;
  attempts: number;
  remaining: number;
  resetTime?: Date;
}

/**
 * Mengecek dan memperbarui rate limit di MongoDB
 * @param identifier IP Address atau Email user
 * @param limit Batas maksimal percobaan (default: 5)
 * @param windowMs Waktu blokir/cooldown dalam milidetik (default: 15 menit)
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000
): Promise<RateLimitResult> {
  const now = new Date();
  const newExpiresAt = new Date(now.getTime() + windowMs);

  // 1. Coba cari record yang ada
  const record = await prisma.rateLimit.findUnique({
    where: { identifier },
  });

  // 2. Jika tidak ada record, buat baru
  if (!record) {
    await prisma.rateLimit.create({
      data: {
        identifier,
        attempts: 1,
        expiresAt: newExpiresAt,
      },
    });
    return { success: true, attempts: 1, remaining: limit - 1 };
  }

  // 3. Jika record ada tetapi sudah kedaluwarsa (waktu blokir habis), reset hitungan
  if (now > record.expiresAt) {
    await prisma.rateLimit.update({
      where: { identifier },
      data: {
        attempts: 1,
        expiresAt: newExpiresAt, // Set ulang waktu kedaluwarsa
      },
    });
    return { success: true, attempts: 1, remaining: limit - 1 };
  }

  // 4. Jika masih dalam waktu window dan batas sudah tercapai, blokir!
  if (record.attempts >= limit) {
    return {
      success: false,
      attempts: record.attempts,
      remaining: 0,
      resetTime: record.expiresAt,
    };
  }

  // 5. Jika masih dalam waktu window dan batas belum tercapai, tambah hitungan
  const updatedRecord = await prisma.rateLimit.update({
    where: { identifier },
    data: {
      attempts: record.attempts + 1,
    },
  });

  return {
    success: true,
    attempts: updatedRecord.attempts,
    remaining: limit - updatedRecord.attempts,
  };
}
