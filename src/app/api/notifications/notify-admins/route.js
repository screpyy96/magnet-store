import webpush from 'web-push';
import { createClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    // Check if VAPID keys are configured
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY;
    
    if (!vapidPublic || !vapidPrivate) {
      console.log('VAPID keys not configured - skipping notification');
      return new Response(JSON.stringify({ 
        message: 'Notifications not configured' 
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      'mailto:iosifscrepy@gmail.com',
      vapidPublic,
      vapidPrivate
    );

    const supabase = createClient();
    const { message } = await request.json();

    // Get admin subscriptions
    const { data: subscriptions, error } = await supabase
      .from('admin_push_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No admin subscriptions found' 
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send notifications
    const notificationPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          JSON.stringify({
            title: 'New Order Received! 🎉',
            body: message || 'A new magnet order has been placed',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png'
          })
        );
        return { success: true, id: sub.id };
      } catch (error) {
        console.error('Failed to send notification:', error);
        return { success: false, id: sub.id, error: error.message };
      }
    });

    const results = await Promise.allSettled(notificationPromises);
    
    return new Response(JSON.stringify({ 
      message: 'Notifications sent',
      results: results.map(r => r.value || r.reason)
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Notification error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send notifications',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 