import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'crypto'

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  }

  return createClient(url, key)
}

function verifySecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-webhook-secret')
  const expected = process.env.SUPABASE_WEBHOOK_SECRET
  if (!secret || !expected) return false
  try {
    return timingSafeEqual(Buffer.from(secret), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: { type: string; table: string; record: Record<string, unknown>; old_record?: Record<string, unknown> }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, table, record } = payload

  try {
    createSupabaseClient()
    console.log(`[supabase webhook] ${type.replace(/[\r\n]/g, '')} on ${table.replace(/[\r\n]/g, '')}`, record.id ?? '')

    switch (table) {
      case 'jobs': {
        if (type === 'UPDATE' && record.status === 'COMPLETED') {
          // TODO: trigger payout release
          console.log('[supabase webhook] job completed, releasing payout', String(record.id).replace(/[\r\n]/g, ''))
        }
        break
      }

      case 'users': {
        if (type === 'INSERT') {
          console.log('[supabase webhook] new user registered', String(record.id).replace(/[\r\n]/g, ''))
          // TODO: send welcome email via Resend
        }
        break
      }

      default:
        console.log('[supabase webhook] unhandled table', table.replace(/[\r\n]/g, ''))
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[supabase webhook] handler error', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}
