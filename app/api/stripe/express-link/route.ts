import { NextResponse } from 'next/server'

export async function GET() {
  const stripeUrl = process.env.STRIPE_EXPRESS_URL ?? 'https://dashboard.stripe.com/';

  return NextResponse.json({
    url: stripeUrl,
  })
}
