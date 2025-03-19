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
    
    // Verifică dacă utilizatorul este admin
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()
    
    if (userError) throw userError
    
    if (!userData || !userData.is_admin) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin privileges required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Verificăm dacă există deja un abonament pentru acest admin
    const { data: existingSubscriptions, error: fetchError } = await supabase
      .from('admin_push_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('endpoint', subscription.endpoint)
    
    if (fetchError) throw fetchError
    
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      // Actualizăm abonamentul existent
      const { error: updateError } = await supabase
        .from('admin_push_subscriptions')
        .update({
          subscription: subscription,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscriptions[0].id)
      
      if (updateError) throw updateError
    } else {
      // Creăm un nou abonament
      const { error: insertError } = await supabase
        .from('admin_push_subscriptions')
        .insert({
          user_id: userId,
          endpoint: subscription.endpoint,
          subscription: subscription,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (insertError) throw insertError
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error saving admin subscription:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 