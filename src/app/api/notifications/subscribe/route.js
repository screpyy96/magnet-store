import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { userId, subscription } = await request.json()
    
    if (!userId || !subscription) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Verifică dacă există deja un abonament cu același endpoint
    const { data: existingSubscription } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('endpoint', subscription.endpoint)
      .single()
    
    if (existingSubscription) {
      // Dacă există, înseamnă că este deja abonat
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Subscription already exists'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Salvează noul abonament
    const { error: insertError } = await supabase
      .from('push_subscriptions')
      .insert([
        {
          user_id: userId,
          subscription,
          endpoint: subscription.endpoint,
          created_at: new Date().toISOString()
        }
      ])
    
    if (insertError) {
      throw insertError
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Subscription saved successfully'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error saving subscription:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 