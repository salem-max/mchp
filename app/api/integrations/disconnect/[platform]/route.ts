import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserFromSession } from '@/lib/auth'
import { disconnectPlatform } from '@/lib/integrations/platform-link'

type IntegrationPlatform = 'WHATSAPP' | 'TELEGRAM' | 'TIKTOK' | 'FACEBOOK'
const VALID_PLATFORMS: IntegrationPlatform[] = ['WHATSAPP', 'TELEGRAM', 'TIKTOK', 'FACEBOOK']

async function getUser() {
  const cookieStore = await cookies()
  const jwtToken = cookieStore.get('auth-token')?.value
  return getUserFromSession(jwtToken)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { platform: platformParam } = await params
    const normalized = platformParam?.toUpperCase() as IntegrationPlatform

    if (!normalized || !VALID_PLATFORMS.includes(normalized)) {
      return NextResponse.json({ error: 'Unsupported integration platform' }, { status: 400 })
    }

    await disconnectPlatform(user.id, normalized)
    return NextResponse.json({ success: true, platform: normalized })
  } catch (error) {
    console.error('POST /api/integrations/disconnect/[platform] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
