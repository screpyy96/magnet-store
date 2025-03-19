import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { orderId, amount } = await request.json()
    
    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Lipsesc parametrii necesari' }, { status: 400 })
    }
    
    // Convertește suma în cenți pentru Stripe
    const amountInCents = Math.round(amount * 100)
    
    // Crează o sesiune de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: `Comanda #${orderId.substring(0, 8)}`,
              description: 'Plată comandă',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmation?orderId=${orderId}&status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?status=cancelled`,
    })
    
    // Actualizează comanda cu ID-ul sesiunii
    await supabase
      .from('orders')
      .update({ payment_session_id: session.id })
      .eq('id', orderId)
    
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Eroare la crearea intenției de plată:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 