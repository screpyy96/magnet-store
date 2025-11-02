import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  console.log('[Stripe Webhook] Received request')

  if (!signature) {
    console.error('[Stripe Webhook] No signature provided')
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured!')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  try {
    const stripe = getStripe()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    console.log('[Stripe Webhook] Event verified:', event.type, 'ID:', event.id)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error.message)
    console.error('[Stripe Webhook] Full error:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  console.log('[Stripe Webhook] Payment succeeded:', paymentIntent.id)
  console.log('[Stripe Webhook] Amount:', paymentIntent.amount, paymentIntent.currency)
  
  // Update order status in database
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      payment_status: 'succeeded',
      status: 'processing'
    })
    .eq('payment_intent_id', paymentIntent.id)
    .select()

  if (error) {
    console.error('[Stripe Webhook] Error updating order:', error)
  } else if (data && data.length > 0) {
    console.log('[Stripe Webhook] Order updated successfully:', data[0].id)
  } else {
    console.warn('[Stripe Webhook] No order found with payment_intent_id:', paymentIntent.id)
    console.warn('[Stripe Webhook] This might mean the order was not created yet or payment_intent_id mismatch')
  }
}

async function handlePaymentFailed(paymentIntent) {
  console.log('[Stripe Webhook] Payment failed:', paymentIntent.id)
  console.log('[Stripe Webhook] Failure reason:', paymentIntent.last_payment_error?.message || 'Unknown')
  
  // Update order status in database
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      payment_status: 'failed',
      status: 'cancelled'
    })
    .eq('payment_intent_id', paymentIntent.id)
    .select()

  if (error) {
    console.error('[Stripe Webhook] Error updating order:', error)
  } else if (data && data.length > 0) {
    console.log('[Stripe Webhook] Order marked as failed:', data[0].id)
  } else {
    console.warn('[Stripe Webhook] No order found to mark as failed:', paymentIntent.id)
  }
} 
