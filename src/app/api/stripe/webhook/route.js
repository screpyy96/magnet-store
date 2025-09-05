import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  try {
    const stripe = getStripe()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    console.log('Received webhook event:', event.type)

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
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)
  
  // Update order status in database
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('orders')
    .update({ 
      payment_status: 'paid',
      status: 'processing'
    })
    .eq('payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('Error updating order:', error)
  }
}

async function handlePaymentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id)
  
  // Update order status in database
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('orders')
    .update({ 
      payment_status: 'failed',
      status: 'cancelled'
    })
    .eq('payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('Error updating order:', error)
  }
} 