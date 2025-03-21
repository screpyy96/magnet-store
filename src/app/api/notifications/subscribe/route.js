import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import webpush from 'web-push';

export async function POST(request) {
  try {
    // Parse request with better error handling
    let requestData;
    try {
      requestData = await request.json();
      console.log('Received user subscription request data');
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: parseError.message
      }, { status: 400 });
    }
    
    const { subscription } = requestData;
    
    if (!subscription) {
      console.error('No subscription data provided');
      return NextResponse.json({ error: 'No subscription data provided' }, { status: 400 });
    }
    
    if (!subscription.endpoint) {
      console.error('Invalid subscription format: missing endpoint');
      return NextResponse.json({ error: 'Invalid subscription format' }, { status: 400 });
    }
    
    // Use await with cookies()
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Configure webpush with environment variables
    // Fixed to use the correct variable name NEXT_PUBLIC_VAPID_PRIVATE_KEY
    const webPushEmail = process.env.WEB_PUSH_EMAIL || 'iosifscrepy@gmail.com';
    webpush.setVapidDetails(
      `mailto:${webPushEmail}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY
    );
    
    // Ensure we have a valid subscription object for database storage
    const subscriptionToStore = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      expirationTime: subscription.expirationTime
    };
    
    console.log(`Processing user subscription: Endpoint: ${subscriptionToStore.endpoint.substring(0, 30)}...`);
    
    // Save the subscription to the database
    const { error: subscriptionError } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        subscription: subscriptionToStore,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (subscriptionError) {
      console.error('Error saving subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to save subscription', details: subscriptionError },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription registered successfully'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
} 