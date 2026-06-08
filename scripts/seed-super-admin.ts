/**
 * Seed script — upserts the super admin account.
 * Run: npm run seed:super-admin
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scrypt, randomBytes } from 'node:crypto'
import { promisify } from 'node:util'

// Manually load .env.local before anything else
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !process.env[key]) process.env[key] = val
  }
} catch {
  // .env.local not found — rely on existing env
}

import { PrismaClient } from '@prisma/client'

const scryptAsync = promisify(scrypt)

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${buf.toString('hex')}.${salt}`
}

const SUPER_ADMIN_EMAIL = 'hbibibarokah@gmail.com'
const SUPER_ADMIN_NAME = 'Habibi Barokah'
const DEFAULT_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Malaysia Co (Maintenance Services)@SuperAdmin2025!'

async function main() {
  const datasourceUrl =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.DATABASE_URL

  if (!datasourceUrl) {
    throw new Error(
      'Missing database URL. Set POSTGRES_PRISMA_URL or DATABASE_URL in .env.local'
    )
  }

  const prisma = new PrismaClient()

  try {
    const hashed = await hashPassword(DEFAULT_PASSWORD)

    const user = await prisma.user.upsert({
      where: { email: SUPER_ADMIN_EMAIL },
      create: {
        email: SUPER_ADMIN_EMAIL,
        name: SUPER_ADMIN_NAME,
        password: hashed,
        role: 'ADMIN',
        isSuperAdmin: true,
      },
      update: {
        role: 'ADMIN',
        isSuperAdmin: true,
        name: SUPER_ADMIN_NAME,
      },
    })

    console.log('\n✅ Super admin upserted:')
    console.log(`   ID:    ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role:  ${user.role}`)
    console.log(`   Super: ${user.isSuperAdmin}`)
    console.log('\n   Login at /login with:')
    console.log(`   Email:    ${SUPER_ADMIN_EMAIL}`)
    console.log(`   Password: ${DEFAULT_PASSWORD}`)
    console.log('\n   ⚠️  Change the password after first login!\n')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

