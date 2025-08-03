import { createClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    // Temporarily disabled - notifications will be implemented later
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Notifications temporarily disabled' 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
    /*
    const supabase = createClient();
    const subscription = await request.json();

    // Validate subscription data
    if (!subscription.endpoint || !subscription.keys) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid subscription data' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Authentication required' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Admin access required' 
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if subscription already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('admin_push_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('endpoint', subscription.endpoint)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing subscription:', checkError);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Database error' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let result;

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('admin_push_subscriptions')
        .update({
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Failed to update subscription' 
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      result = { success: true, message: 'Subscription updated' };
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('admin_push_subscriptions')
        .insert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Failed to create subscription' 
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      result = { success: true, message: 'Subscription created' };
    }

    // Send a test notification
    try {
      const testResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription,
          title: 'Notification Test',
          body: 'You will now receive notifications for new orders.',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png'
        })
      });

      if (testResponse.ok) {
        result.message += ' - Test notification sent';
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      // Don't fail the subscription if test notification fails
    }

    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    */

  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 