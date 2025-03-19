import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
import webpush from 'https://esm.sh/web-push@3.5.0'

serve(async (req) => {
  // Configurare webpush
  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT') || '',
    Deno.env.get('VAPID_PUBLIC_KEY') || '',
    Deno.env.get('VAPID_PRIVATE_KEY') || ''
  )

  try {
    // Creează un client Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obține datele webhook-ului 
    const payload = await req.json()
    const { record } = payload
    
    // Verifică dacă este o comandă nouă
    if (!record || payload.type !== 'INSERT' || payload.table !== 'orders') {
      return new Response(JSON.stringify({ message: 'Not a new order' }), { status: 200 })
    }

    // Obține abonamentele admin
    const { data: adminSubscriptions, error } = await supabaseAdmin
      .from('admin_push_subscriptions')
      .select('subscription')
    
    if (error) throw error
    
    if (!adminSubscriptions || adminSubscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No admin subscriptions found' }), { status: 200 })
    }
    
    // Trimite notificări către toți administratorii
    await Promise.all(
      adminSubscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub.subscription,
            JSON.stringify({
              title: 'Comandă nouă',
              body: `Comandă nouă #${record.id.substring(0, 8)} de ${parseFloat(record.total).toFixed(2)}€`,
              url: `/admin/orders/${record.id}`
            })
          )
        } catch (error) {
          console.error('Notification error:', error)
          
          // Curăță abonamentele invalide
          if (error.statusCode === 410) {
            await supabaseAdmin
              .from('admin_push_subscriptions')
              .delete()
              .eq('endpoint', sub.subscription.endpoint)
          }
        }
      })
    )
    
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}) 