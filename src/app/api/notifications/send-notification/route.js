import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import webpush from 'web-push';

export async function POST(request) {
  try {
    // 1. Check if VAPID keys are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      console.log('VAPID Private Key exists:', !!process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY);
      return NextResponse.json(
        { error: 'Web Push not configured' },
        { status: 500 }
      );
    }

    // 2. Set up VAPID details for web push
    webpush.setVapidDetails(
      'mailto:' + process.env.NEXT_PUBLIC_WEB_PUSH_EMAIL,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY
    );

    // 3. Get notification data from request
    const requestData = await request.json();
    const { title, body, data } = requestData;

    // 4. Get Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 5. Get all subscriptions from database
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');
    
    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    // If no subscriptions, return early
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'No subscriptions to notify' },
        { status: 200 }
      );
    }

    // 6. Create notification payload
    const notificationPayload = JSON.stringify({
      title: title || 'New Notification',
      body: body || 'You have a new notification',
      data: data || {}
    });

    // 7. Send notification to all devices
    const sendPromises = subscriptions.map(sub => {
      // Use subscription stored in database
      const pushSubscription = sub.subscription;
      
      // Send notification
      return webpush.sendNotification(pushSubscription, notificationPayload)
        .catch(error => {
          console.error(`Error sending notification to ${sub.endpoint}:`, error);
          
          // If subscription is no longer valid, delete it
          if (error.statusCode === 404 || error.statusCode === 410) {
            return supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
        });
    });
    
    // Wait for all notifications to be sent
    await Promise.all(sendPromises);
    
    return NextResponse.json(
      { success: true, count: subscriptions.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-notification route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
} 