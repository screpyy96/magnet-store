import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { endpoint } = await request.json()

    // Create Supabase client
    const supabase = createClient()
    
    // Verifică autentificarea
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Obține datele din request
    const { subscription } = await request.json()
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription data provided' },
        { status: 400 }
      )
    }
    
    // Șterge abonamentul din baza de date
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', session.user.id)
      .eq('subscription->endpoint', subscription.endpoint)
    
    if (error) {
      console.error('Error deleting subscription:', error)
      return NextResponse.json(
        { error: 'Failed to delete subscription' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unsubscription error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 