import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client for webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    
    // Get the signature from the headers
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }
    
    // Get the raw body as text
    const body = await request.text()
    
    // Verify and construct the event
    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        
        // Get the order ID from the metadata
        const orderId = paymentIntent.metadata.orderId
        
        if (!orderId) {
          console.error('No order ID found in payment intent metadata')
          return NextResponse.json(
            { error: 'No order ID found in payment intent metadata' },
            { status: 400 }
          )
        }
        
        // Update the payment transaction status
        const { error: transactionError } = await supabaseAdmin
          .from('payment_transactions')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        if (transactionError) {
          console.error('Error updating payment transaction:', transactionError)
          return NextResponse.json(
            { error: 'Error updating payment transaction' },
            { status: 500 }
          )
        }
        
        // Update the order status
        const { error: orderError } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)
        
        if (orderError) {
          console.error('Error updating order status:', orderError)
          return NextResponse.json(
            { error: 'Error updating order status' },
            { status: 500 }
          )
        }
        
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        
        // Find the payment transaction with this payment intent
        const { error: updateError } = await supabaseAdmin
          .from('payment_transactions')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        if (updateError) {
          console.error('Error updating payment transaction:', updateError)
          return NextResponse.json(
            { error: 'Error updating payment transaction' },
            { status: 500 }
          )
        }
        
        break
      }
      
      case 'payment_intent.requires_action': {
        const paymentIntent = event.data.object
        
        // Update the payment transaction status
        const { error: updateError } = await supabaseAdmin
          .from('payment_transactions')
          .update({
            status: 'requires_action',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        if (updateError) {
          console.error('Error updating payment transaction:', updateError)
          return NextResponse.json(
            { error: 'Error updating payment transaction' },
            { status: 500 }
          )
        }
        
        break
      }
      
      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object
        
        // Update the payment transaction status
        const { error: updateError } = await supabaseAdmin
          .from('payment_transactions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        if (updateError) {
          console.error('Error updating payment transaction:', updateError)
          return NextResponse.json(
            { error: 'Error updating payment transaction' },
            { status: 500 }
          )
        }
        
        break
      }
    }
    
    // Return a response to acknowledge receipt of the event
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
} 