import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import webpush from 'web-push';

export async function POST(request) {
  try {
    // Obține cookie-urile corect, cu await
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verifică autentificarea
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Obține datele din request
    const subscription = await request.json();
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription data provided' },
        { status: 400 }
      );
    }
    
    // Configurează webpush cu variabilele de mediu
    webpush.setVapidDetails(
      'mailto:your-email@example.com', // Înlocuiește cu emailul tău
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    
    // Salvăm abonamentul în baza de date
    const { error: subscriptionError } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        subscription: subscription,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (subscriptionError) {
      console.error('Error saving subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, id: subscription.endpoint });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 