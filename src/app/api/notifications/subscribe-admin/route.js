import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import webpush from 'web-push';

// Definirea directă a cheilor VAPID (doar pentru debugging)
const FIXED_VAPID_PUBLIC_KEY = 'BJKt-ejZ1-mkWojXS43_DPs1IOnsosD_G-Rn1XX3FWLVHPXuqocQJtYsopqWYZLOfsflWMYwJhG0Jc639EGT62U';
const FIXED_VAPID_PRIVATE_KEY = '6kWgmY26MUf3JvDOlzBVMffC70kJaCAOO4AmtfrwcWA';

export async function POST(request) {
  try {
    // Try to extract subscription data with detailed error handling
    let requestData;
    try {
      requestData = await request.json();
      console.log('Received request data:', JSON.stringify(requestData));
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: parseError.message
      }, { status: 400 });
    }
    
    const { subscription } = requestData;
    
    if (!subscription) {
      console.error('No subscription data provided, received:', requestData);
      return NextResponse.json({ 
        error: 'No subscription data provided',
        received: requestData
      }, { status: 400 });
    }
    
    // Validate subscription object
    if (!subscription.endpoint) {
      console.error('Invalid subscription object, missing endpoint:', subscription);
      return NextResponse.json({ 
        error: 'Invalid subscription object (missing endpoint)',
        received: subscription
      }, { status: 400 });
    }
    
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verificăm configurarea VAPID
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY;
    const webPushEmail = process.env.WEB_PUSH_EMAIL || 'iosifscrepy@gmail.com';
    
    // Verificăm autentificarea utilizatorului
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Utilizator neautentificat' },
        { status: 401 }
      );
    }
    
    // Verificăm dacă utilizatorul este admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error('Eroare la verificarea profilului:', profileError);
      return NextResponse.json(
        { success: false, message: 'Eroare la verificarea profilului' },
        { status: 500 }
      );
    }
    
    if (!profile?.is_admin) {
      return NextResponse.json(
        { success: false, message: 'Acces interzis - utilizator nu este admin' },
        { status: 403 }
      );
    }
    
    // IMPORTANT: Verificăm dacă cheile sunt setate corect
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('Cheile VAPID nu sunt configurate corect:', { 
        publicKeyExists: !!vapidPublicKey, 
        privateKeyExists: !!vapidPrivateKey 
      });
      
      return NextResponse.json(
        { success: false, message: 'Configurare server incompletă pentru notificări push' },
        { status: 500 }
      );
    }
    
    // Configurăm web-push
    webpush.setVapidDetails(
      `mailto:${webPushEmail}`,
      vapidPublicKey,
      vapidPrivateKey
    );
    
    // Ensure we have a valid subscription object for database storage
    const subscriptionToStore = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      expirationTime: subscription.expirationTime
    };
    
    console.log('Processing subscription:', 
      `Endpoint: ${subscriptionToStore.endpoint.substring(0, 30)}...`, 
      `Keys present: ${!!subscriptionToStore.keys}`
    );
    
    // Salvăm abonamentul în baza de date
    const { error: subscriptionError } = await supabase
      .from('admin_push_subscriptions')
      .upsert({
        endpoint: subscriptionToStore.endpoint,
        subscription: subscriptionToStore,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (subscriptionError) {
      console.error('Eroare la salvarea abonamentului:', subscriptionError);
      return NextResponse.json(
        { success: false, message: 'Eroare la salvarea abonamentului', error: subscriptionError },
        { status: 500 }
      );
    }
    
    // Trimitem o notificare de test pentru a confirma funcționalitatea
    try {
      const payload = JSON.stringify({
        title: 'Subscription Successful!',
        body: 'You will now receive notifications for new orders.',
        data: {
          url: '/admin/orders',
          time: new Date().toISOString()
        }
      });
      
      await webpush.sendNotification(subscription, payload);
      console.log('Test notification sent successfully!');
    } catch (notifError) {
      console.error('Error sending test notification:', notifError);
      // Nu întrerupem procesul, doar logăm eroarea
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription registered, but test notification failed',
        error: notifError.message
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription registered successfully' 
    });
  } catch (error) {
    console.error('Server error in subscription API:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 