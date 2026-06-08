import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserFromSession } from '@/lib/auth'
import { generateOtp, verifyOtp, normalizePhone, isValidPhone } from '@/lib/integrations/phone-identity'

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  return getUserFromSession(token)
}

// POST /api/user/phone
// body: { phone } → generate OTP
// body: { phone, otp } → verify OTP
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { phone, otp } = body

  if (!phone) return NextResponse.json({ error: 'Phone number required' }, { status: 400 })

  const normalized = normalizePhone(phone)
  if (!isValidPhone(normalized)) {
    return NextResponse.json({ error: 'Invalid phone number format (E.164 required)' }, { status: 400 })
  }

  try {
    if (otp) {
      // Verify OTP
      const verifiedPhone = await verifyOtp(user.id, otp)
      return NextResponse.json({ success: true, phone: verifiedPhone, verified: true })
    } else {
      // Generate OTP
      const generatedOtp = await generateOtp(user.id, normalized)

      // In production: send via SMS (Twilio, etc.)
      // For dev: return OTP in response
      const isDev = process.env.NODE_ENV === 'development'
      return NextResponse.json({
        success: true,
        message: 'OTP sent to your phone number',
        ...(isDev && { otp: generatedOtp }), // expose in dev only
      })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
