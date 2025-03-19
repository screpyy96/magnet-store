import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { userId, endpoint } = await request.json()
    
    if (!userId || !endpoint) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Șterge abonamentul
    const { error: deleteError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
    
    if (deleteError) {
      throw deleteError
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Subscription removed successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error removing subscription:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 