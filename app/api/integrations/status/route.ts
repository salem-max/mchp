import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserFromSession } from '@/lib/auth'
import { getIntegrations } from '@/lib/integrations/platform-link'
import { getVerifiedPhone } from '@/lib/integrations/phone-identity'

async function getUser() {
  const cookieStore = await cookies()
  const jwtToken = cookieStore.get('auth-token')?.value
  return getUserFromSession(jwtToken)
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const phone = await getVerifiedPhone(user.id)
    const integrations = await getIntegrations(user.id)
    const summary = integrations.reduce(
      (acc: Record<string, number>, record) => {
        acc[record.status] = (acc[record.status] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({ phone, integrations, summary })
  } catch (error) {
    console.error('GET /api/integrations/status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
