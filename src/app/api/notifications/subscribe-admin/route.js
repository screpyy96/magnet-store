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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()
      
    console.log('Verificare admin pentru utilizatorul:', userId);
    console.log('Profil:', profile);
    console.log('Eroare profil:', profileError);
    
    if (profileError) {
      return new Response(JSON.stringify({ 
        error: 'Error checking admin status', 
        details: profileError.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    if (!profile || !profile.is_admin) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        adminStatus: profile ? profile.is_admin : null
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Salvează abonamentul de admin în tabela specifică
    const { error } = await supabase
      .from('admin_push_subscriptions')
      .upsert({ 
        admin_id: userId, 
        subscription: subscription,
        created_at: new Date().toISOString()
      }, { 
        onConflict: 'admin_id',
        ignoreDuplicates: false
      })
    
    if (error) throw error
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error saving admin push subscription:', error)
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 