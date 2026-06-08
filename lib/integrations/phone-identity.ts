import type { Prisma } from '@/lib/prisma'

/** Normalize to E.164: strip spaces/dashes, ensure leading + */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s\-().]/g, '')
  return digits.startsWith('+') ? digits : `+${digits}`
}

/** Basic E.164 validation: + followed by 7–15 digits */
export function isValidPhone(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone)
}

/** Generate a 6-digit OTP and persist it (5-min expiry) */
export async function generateOtp(userId: string, phone: string): Promise<string> {
  const prisma = prisma
  const normalized = normalizePhone(phone)

  if (!isValidPhone(normalized)) throw new Error('Invalid phone number format')

  // Enforce one phone per user globally
  const existing = await prisma.phoneVerification.findFirst({
    where: { phone: normalized, userId: { not: userId } },
  })
  if (existing) throw new Error('Phone number already linked to another account')

  const otp = String(Math.floor(100000 + Math.random() * 900000))
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

  await prisma.phoneVerification.upsert({
    where: { userId },
    create: { userId, phone: normalized, otp, otpExpiry, verified: false },
    update: { phone: normalized, otp, otpExpiry, verified: false },
  })

  return otp
}

/** Verify OTP and mark phone as verified */
export async function verifyOtp(userId: string, otp: string): Promise<string> {
  const prisma = prisma
  const record = await prisma.phoneVerification.findUnique({ where: { userId } })

  if (!record || !record.otp || !record.otpExpiry) throw new Error('No pending verification')
  if (record.otp !== otp) throw new Error('Invalid OTP')
  if (record.otpExpiry < new Date()) throw new Error('OTP expired')

  await prisma.phoneVerification.update({
    where: { userId },
    data: { verified: true, otp: null, otpExpiry: null },
  })

  // Sync phone to User record
  await prisma.user.update({ where: { id: userId }, data: { phone: record.phone } })

  return record.phone
}

export async function getVerifiedPhone(userId: string): Promise<string | null> {
  const prisma = prisma
  const record = await prisma.phoneVerification.findUnique({ where: { userId } })
  return record?.verified ? record.phone : null
}
