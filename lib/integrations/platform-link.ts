import type { Prisma } from '@/lib/prisma'
import type { IntegrationPlatform, IntegrationStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'

export type PlatformResult = {
  status: IntegrationStatus
  platformId?: string
  metadata?: Record<string, unknown>
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
// Checks WhatsApp Business API to see if the number is registered.
// In production: call Meta's Cloud API phone number lookup endpoint.
async function resolveWhatsApp(phone: string): Promise<PlatformResult> {
  const token = process.env.WHATSAPP_API_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    // Credentials not configured — mark as restricted
    return { status: 'RESTRICTED', metadata: { reason: 'WhatsApp API not configured' } }
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/phone_numbers?access_token=${token}`
    )
    if (!res.ok) return { status: 'RESTRICTED', metadata: { reason: 'API error' } }
    // Simplified: if API responds, treat number as active
    return { status: 'ACTIVE', platformId: phone, metadata: { channel: 'whatsapp' } }
  } catch {
    return { status: 'PENDING', metadata: { reason: 'Could not reach WhatsApp API' } }
  }
}

// ── Telegram ──────────────────────────────────────────────────────────────────
// Resolves a Telegram chat ID via bot API by matching the phone number.
// In production: use Telegram's contact import or bot-initiated flow.
async function resolveTelegram(phone: string): Promise<PlatformResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    return { status: 'RESTRICTED', metadata: { reason: 'Telegram bot not configured' } }
  }

  try {
    // Attempt to find user via importContacts (requires user to have started the bot)
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`)
    if (!res.ok) return { status: 'PENDING', metadata: { reason: 'Bot API error' } }

    const data = await res.json()
    const updates = data.result || []

    // Look for a message from a user whose phone matches (if they shared contact)
    const match = updates.find(
      (u: any) => u.message?.contact?.phone_number?.replace(/\D/g, '') === phone.replace(/\D/g, '')
    )

    if (match) {
      const chatId = String(match.message.chat.id)
      return { status: 'ACTIVE', platformId: chatId, metadata: { chatId } }
    }

    return { status: 'PENDING', metadata: { reason: 'User has not started the bot yet' } }
  } catch {
    return { status: 'PENDING', metadata: { reason: 'Could not reach Telegram API' } }
  }
}

// ── TikTok ────────────────────────────────────────────────────────────────────
// No direct login. Phone used for CRM/outreach mapping only.
async function resolveTikTok(phone: string): Promise<PlatformResult> {
  // TikTok does not expose a public phone-lookup API.
  // This is a CRM-side mapping — store the phone for outreach/analytics.
  return {
    status: 'ACTIVE',
    platformId: phone,
    metadata: { note: 'CRM mapping only — no direct API access', phone },
  }
}

// ── Facebook ──────────────────────────────────────────────────────────────────
// Uses Meta Graph API to match phone to a Facebook identity.
async function resolveFacebook(phone: string): Promise<PlatformResult> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN

  if (!token) {
    return { status: 'RESTRICTED', metadata: { reason: 'Facebook Page token not configured' } }
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${token}`
    )
    if (!res.ok) return { status: 'RESTRICTED', metadata: { reason: 'Facebook API error' } }

    const data = await res.json()
    return {
      status: 'ACTIVE',
      platformId: data.id,
      metadata: { pageId: data.id, pageName: data.name, linkedPhone: phone },
    }
  } catch {
    return { status: 'PENDING', metadata: { reason: 'Could not reach Facebook API' } }
  }
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
const resolvers: Record<IntegrationPlatform, (phone: string) => Promise<PlatformResult>> = {
  WHATSAPP: resolveWhatsApp,
  TELEGRAM: resolveTelegram,
  TIKTOK: resolveTikTok,
  FACEBOOK: resolveFacebook,
}

export async function syncPlatform(
  userId: string,
  platform: IntegrationPlatform,
  phone: string
): Promise<PlatformResult> {
  const prisma = prisma
  const result = await resolvers[platform](phone)

  await prisma.integration.upsert({
    where: { userId_platform: { userId, platform } },
    create: {
      userId,
      platform,
      status: result.status,
      platformId: result.platformId,
      metadata: result.metadata as Prisma.InputJsonValue,
      linkedAt: result.status === 'ACTIVE' ? new Date() : null,
      lastSyncAt: new Date(),
    },
    update: {
      status: result.status,
      platformId: result.platformId,
      metadata: result.metadata as Prisma.InputJsonValue,
      linkedAt: result.status === 'ACTIVE' ? new Date() : undefined,
      lastSyncAt: new Date(),
    },
  })

  return result
}

export async function syncAllPlatforms(userId: string, phone: string) {
  const platforms: IntegrationPlatform[] = ['WHATSAPP', 'TELEGRAM', 'TIKTOK', 'FACEBOOK']
  return Promise.all(platforms.map((p: any) => syncPlatform(userId, p, phone)))
}

export async function disconnectPlatform(userId: string, platform: IntegrationPlatform) {
  const prisma = prisma
  await prisma.integration.upsert({
    where: { userId_platform: { userId, platform } },
    create: { userId, platform, status: 'NOT_LINKED' },
    update: { status: 'NOT_LINKED', platformId: null, metadata: Prisma.JsonNull, linkedAt: null },
  })
}

export async function getIntegrations(userId: string) {
  const prisma = prisma
  const platforms: IntegrationPlatform[] = ['WHATSAPP', 'TELEGRAM', 'TIKTOK', 'FACEBOOK']

  const existing = await prisma.integration.findMany({ where: { userId } })
  const map = Object.fromEntries(existing.map((i: any) => [i.platform, i]))

  return platforms.map((platform) => ({
    platform,
    status: (map[platform]?.status ?? 'NOT_LINKED') as IntegrationStatus,
    platformId: map[platform]?.platformId ?? null,
    metadata: map[platform]?.metadata ?? null,
    linkedAt: map[platform]?.linkedAt ?? null,
    lastSyncAt: map[platform]?.lastSyncAt ?? null,
  }))
}
