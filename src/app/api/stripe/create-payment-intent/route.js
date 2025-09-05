import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { cart, currency = 'gbp', metadata = {} } = await request.json()
    console.log('Received cart for payment intent:', JSON.stringify(cart, null, 2));
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: 'A valid cart is required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get Stripe instance
    const stripe = getStripe()

    // Calculate total amount securely on the server
    let totalAmount = 0
    for (const item of cart) {
      const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1

      if (item.stripePriceId) {
        try {
          const price = await stripe.prices.retrieve(item.stripePriceId)
          const add = price.unit_amount * qty
          totalAmount += add
          console.log('Item contribution (stripe price):', {
            name: item.name,
            stripePriceId: item.stripePriceId,
            qty,
            unit_amount: price.unit_amount,
            add,
          })
        } catch (priceError) {
          console.error(`Error fetching price for ${item.stripePriceId}:`, priceError)
          return NextResponse.json(
            { error: `Invalid item in cart: ${item.name}` },
            { status: 400 }
          )
        }
      } else {
        // Fallback for items without a Stripe price (e.g., custom magnets)
        const linePricePounds =
          typeof item.totalPrice === 'number' && !isNaN(item.totalPrice)
            ? item.totalPrice
            : typeof item.price === 'number' && !isNaN(item.price)
              ? item.price * qty
              : 0
        const add = Math.round(linePricePounds * 100)
        totalAmount += add
        console.log('Item contribution (fallback):', {
          name: item.name,
          qty,
          linePricePounds,
          add,
        })
      }
    }

    console.log('Calculated total amount:', totalAmount);

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid cart total is required' },
        { status: 400 }
      )
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount, // Amount is already in cents
      currency: currency,
      metadata: {
        user_id: user.id,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
} 