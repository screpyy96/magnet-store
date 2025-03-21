import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import webpush from 'web-push';

// Definirea directă a cheilor VAPID (doar pentru debugging)
const FIXED_VAPID_PUBLIC_KEY = 'BJKt-ejZ1-mkWojXS43_DPs1IOnsosD_G-Rn1XX3FWLVHPXuqocQJtYsopqWYZLOfsflWMYwJhG0Jc639EGT62U';
const FIXED_VAPID_PRIVATE_KEY = '6kWgmY26MUf3JvDOlzBVMffC70kJaCAOO4AmtfrwcWA';

export async function POST(request) {
  try {
    // Folosește await cu cookies()
    const cookieStore = cookies();
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
      console.error('Cheile VAPID nu sunt configurate corect');
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
    
    // Citim datele de abonament
    let subscription;
    try {
      const body = await request.json();
      // Verifică dacă subscription este direct în body sau în body.subscription
      subscription = body.subscription || body;
      
      console.log('Abonament primit:', subscription.endpoint ? 
        `${subscription.endpoint.substring(0, 30)}...` : 'Invalid');
    } catch (parseError) {
      console.error('Eroare la parsarea abonamentului:', parseError);
      return NextResponse.json(
        { success: false, message: 'Format invalid de abonament' },
        { status: 400 }
      );
    }
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { success: false, message: 'Date de abonament invalide' },
        { status: 400 }
      );
    }
    
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
      console.error('Eroare la salvarea abonamentului:', subscriptionError);
      return NextResponse.json(
        { success: false, message: 'Eroare la salvarea abonamentului' },
        { status: 500 }
      );
    }
    
    // Trimitem o notificare de test pentru a confirma funcționalitatea
    try {
      const payload = JSON.stringify({
        title: 'Abonare reușită!',
        body: 'Vei primi notificări pentru comenzile noi.',
        data: {
          url: '/admin/orders',
          time: new Date().toISOString()
        }
      });
      
      await webpush.sendNotification(subscription, payload);
      console.log('Notificare de test trimisă cu succes!');
    } catch (notifError) {
      console.error('Eroare la trimiterea notificării de test:', notifError);
      // Nu întrerupem procesul, doar logăm eroarea
      return NextResponse.json({ 
        success: true, 
        message: 'Abonament înregistrat, dar notificarea de test a eșuat',
        error: notifError.message
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Abonament înregistrat cu succes' 
    });
  } catch (error) {
    console.error('Eroare server la API-ul de subscribere:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Eroare server internă' },
      { status: 500 }
    );
  }
} 