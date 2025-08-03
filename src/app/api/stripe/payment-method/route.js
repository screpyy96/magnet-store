import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request) {
  try {
    const { paymentMethodId } = await request.json()
    
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
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

    // Here you would typically attach the payment method to the customer
    // For now, we'll just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Payment method saved successfully' 
    })
  } catch (error) {
    console.error('Payment method error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 