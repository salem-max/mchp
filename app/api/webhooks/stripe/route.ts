import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent
        console.log('[stripe] payment_intent.succeeded', intent.id.replace(/[\r\n]/g, ''))
        // TODO: update transaction status to RELEASED
        break
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent
        console.log('[stripe] payment_intent.payment_failed', intent.id.replace(/[\r\n]/g, ''))
        // TODO: update transaction status to REFUNDED
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        console.log('[stripe] account.updated', account.id.replace(/[\r\n]/g, ''))
        // TODO: update technician Stripe onboarding status
        break
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        console.log('[stripe] transfer.created', transfer.id.replace(/[\r\n]/g, ''))
        break
      }

      default:
        console.log('[stripe] unhandled event', event.type.replace(/[\r\n]/g, ''))
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe] webhook handler error', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
