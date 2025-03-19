import webpush from 'web-push'
import { supabase } from '@/lib/supabase'

// Configurăm web-push cu cheile VAPID
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function POST(request) {
  try {
    const { title, body, url } = await request.json()
    
    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Obținem toate abonamentele admin
    const { data: adminSubscriptions, error: fetchError } = await supabase
      .from('admin_push_subscriptions')
      .select('subscription')
    
    if (fetchError) throw fetchError
    
    if (!adminSubscriptions || adminSubscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No admin subscriptions found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Trimitem notificarea către toți administratorii
    const results = await Promise.all(
      adminSubscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub.subscription,
            JSON.stringify({
              title,
              body,
              url
            })
          )
          return { success: true, endpoint: sub.subscription.endpoint }
        } catch (error) {
          // Dacă abonamentul nu mai este valid, îl ștergem
          if (error.statusCode === 410) {
            await supabase
              .from('admin_push_subscriptions')
              .delete()
              .eq('endpoint', sub.subscription.endpoint)
          }
          return { success: false, endpoint: sub.subscription.endpoint, error: error.message }
        }
      })
    )
    
    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error sending admin notifications:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 