import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { amount, currency = 'usd' } = await request.json()
    
    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
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

    // Create a SetupIntent
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/create-setup-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: user.id,
        amount,
        currency,
      }),
    })

    const setupIntent = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: setupIntent.error || 'Failed to create setup intent' },
        { status: response.status }
      )
    }

    return NextResponse.json(setupIntent)
  } catch (error) {
    console.error('Setup intent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 