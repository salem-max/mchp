import { NextResponse } from 'next/server'

export async function GET() {
  const stripeUrl = process.env.STRIPE_ONBOARDING_URL ?? 'https://connect.stripe.com/express/oauth/authorize';

  return NextResponse.json({
    url: stripeUrl,
  })
}
