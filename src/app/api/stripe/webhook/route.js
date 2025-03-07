import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase credentials are available
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
}

const supabase = createClient(supabaseUrl, supabaseKey)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing stripe signature or webhook secret' },
        { status: 400 }
      )
    }

    // Verify the webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        
        // Update order status in database
        if (session.metadata?.orderId) {
          const { error } = await supabase
            .from('orders')
            .update({ 
              payment_status: 'paid',
              stripe_session_id: session.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.metadata.orderId)
          
          if (error) {
            console.error('Error updating order:', error)
            return NextResponse.json(
              { error: 'Error updating order' },
              { status: 500 }
            )
          }
        }
        break
        
      // Add other event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(`Webhook error: ${err.message}`)
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 500 }
    )
  }
} 