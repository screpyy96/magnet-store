import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    // Initialize Stripe with the secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    
    // Parse the request body
    const body = await request.json()
    const { orderId } = body
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fetch the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        shipping_addresses (*),
        order_items (*)
      `)
      .eq('id', orderId)
      .single()
    
    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Verify the order belongs to the user
    if (order.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if there's already a payment intent for this order
    const { data: existingTransaction, error: txError } = await supabase
      .from('payment_transactions')
      .select('stripe_payment_intent_id, stripe_client_secret, status')
      .eq('order_id', orderId)
      .eq('payment_method', 'stripe')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    let paymentIntent
    
    // If there's an existing payment intent that's not completed or failed, reuse it
    if (existingTransaction && existingTransaction.stripe_payment_intent_id && 
        (existingTransaction.status === 'pending' || existingTransaction.status === 'requires_payment_method')) {
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(existingTransaction.stripe_payment_intent_id)
        
        // If the payment intent is still valid, return it
        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'canceled') {
          return NextResponse.json({
            clientSecret: existingTransaction.stripe_client_secret,
            paymentIntentId: paymentIntent.id,
            amount: order.total
          })
        }
      } catch (error) {
        console.error('Error retrieving payment intent:', error)
        // If there's an error retrieving the payment intent, create a new one
      }
    }
    
    // Create a new payment intent
    paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents/pence
      currency: 'gbp',
      metadata: {
        orderId: orderId,
        userId: user.id
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Order #${orderId}`,
    })
    
    // Create or update the payment transaction
    if (existingTransaction) {
      await supabase
        .from('payment_transactions')
        .update({
          amount: order.total,
          status: 'pending',
          stripe_payment_intent_id: paymentIntent.id,
          stripe_client_secret: paymentIntent.client_secret,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .eq('payment_method', 'stripe')
    } else {
      await supabase
        .from('payment_transactions')
        .insert({
          order_id: orderId,
          amount: order.total,
          currency: 'GBP',
          status: 'pending',
          payment_method: 'stripe',
          stripe_payment_intent_id: paymentIntent.id,
          stripe_client_secret: paymentIntent.client_secret,
        })
    }
    
    // Return the client secret to the client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.total
    })
  } catch (error) {
    console.error('Stripe API error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    )
  }
} 