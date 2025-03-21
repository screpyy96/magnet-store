import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { paymentMethodId } = await request.json()
    
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    
    return NextResponse.json(paymentMethod)
  } catch (error) {
    console.error('Payment method retrieval error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
} 