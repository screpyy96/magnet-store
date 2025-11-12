import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe-server'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { cart, currency = 'gbp', metadata = {}, guest = null } = await request.json()
    const pubMode = request.headers.get('x-publishable-key-mode') // 'live' | 'test' | null
    const secret = process.env.STRIPE_SECRET_KEY || ''
    const secMode = secret.startsWith('sk_live') ? 'live' : (secret.startsWith('sk_test') ? 'test' : 'unknown')

    if (pubMode && secMode !== 'unknown' && pubMode !== secMode) {
      return NextResponse.json(
        { error: `Stripe keys mode mismatch: client is '${pubMode}' but server is '${secMode}'. Ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY are both test or both live.` },
        { status: 400 }
      )
    }
    
    // Strip out large image data from cart for logging and processing
    const sanitizedCart = cart.map(item => {
      const { fileData, image, image_url, images, thumbnails, ...rest } = item
      return rest
    })
    
    console.log('Received cart for payment intent (sanitized):', JSON.stringify(sanitizedCart, null, 2));
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: 'A valid cart is required' },
        { status: 400 }
      )
    }

    // Get Stripe instance
    const stripe = getStripe()

    // Server-authoritative package pricing and totals
    const PACKAGE_PRICES = {
      '1': 5.00,
      '6': 17.00,
      '9': 23.00,
      '12': 28.00,
      '16': 36.00,
    }

    const computeTotals = (items) => {
      let subtotal = 0
      for (const item of items) {
        let lineTotal = 0
        try {
          const custom = item.custom_data ? JSON.parse(item.custom_data) : {}
          const isPackage = custom?.type === 'custom_magnet_package'
          if (isPackage && custom.packageId && PACKAGE_PRICES[custom.packageId]) {
            // Server authoritative package price
            lineTotal = PACKAGE_PRICES[custom.packageId]
          } else {
            const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1
            if (typeof item.totalPrice === 'number' && !isNaN(item.totalPrice)) {
              lineTotal = item.totalPrice
            } else if (typeof item.price === 'number' && !isNaN(item.price)) {
              lineTotal = item.price * qty
            } else {
              lineTotal = 0
            }
          }
        } catch {
          const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1
          const price = typeof item.totalPrice === 'number' && !isNaN(item.totalPrice)
            ? item.totalPrice
            : (typeof item.price === 'number' && !isNaN(item.price) ? item.price * qty : 0)
          lineTotal = price
        }
        subtotal += lineTotal
      }
      const shipping = 0 // Free shipping per store policy
      const tax = 0 // Prices include taxes or no VAT applied
      const total = subtotal + shipping + tax
      return { subtotal, shipping, tax, total }
    }

    const totals = computeTotals(cart)
    const totalAmount = Math.round(totals.total * 100)

    console.log('Calculated totals (GBP):', totals)

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
        is_guest: guest ? 'true' : 'false',
        guest_email: guest?.email || '',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: guest?.email || undefined,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totals,
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
