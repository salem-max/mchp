import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserFromSession } from '@/lib/auth'
import { getVerifiedPhone } from '@/lib/integrations/phone-identity'
import { syncPlatform, syncAllPlatforms } from '@/lib/integrations/platform-link'

type IntegrationPlatform = 'WHATSAPP' | 'TELEGRAM' | 'TIKTOK' | 'FACEBOOK'
const VALID_PLATFORMS: IntegrationPlatform[] = ['WHATSAPP', 'TELEGRAM', 'TIKTOK', 'FACEBOOK']

async function getUser() {
  const cookieStore = await cookies()
  const jwtToken = cookieStore.get('auth-token')?.value
  return getUserFromSession(jwtToken)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const platform = body?.platform as string | undefined
    const phone = await getVerifiedPhone(user.id)

    if (!phone) {
      return NextResponse.json({ error: 'Phone verification required before syncing integrations' }, { status: 400 })
    }

    if (platform) {
      const normalized = platform.toUpperCase() as IntegrationPlatform
      if (!VALID_PLATFORMS.includes(normalized)) {
        return NextResponse.json({ error: 'Unsupported integration platform' }, { status: 400 })
      }

      const result = await syncPlatform(user.id, normalized, phone)
      return NextResponse.json({ success: true, platform: normalized, result })
    }

    const results = await syncAllPlatforms(user.id, phone)
    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error('POST /api/integrations/sync error:', error)
    return NextResponse.json({ error: error?.message ?? 'Internal server error' }, { status: 500 })
  }
}
