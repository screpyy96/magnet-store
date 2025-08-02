import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Create Supabase client
    const supabase = createClient();
    
    // Verifică dacă utilizatorul este autentificat și admin
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nu ești autentificat'
      }, { status: 401 });
    }
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (!profileData?.is_admin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nu ai permisiuni de admin'
      }, { status: 403 });
    }
    
    // Afișează configurația VAPID
    return NextResponse.json({
      success: true,
      message: 'Test configurație notificări',
      config: {
        publicKeyExists: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        privateKeyExists: !!process.env.VAPID_PRIVATE_KEY,
        publicKeyLength: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.length || 0,
        privateKeyLength: process.env.VAPID_PRIVATE_KEY?.length || 0,
        email: process.env.WEB_PUSH_EMAIL || 'default@example.com'
      },
      user: {
        id: session.user.id,
        isAdmin: !!profileData?.is_admin
      },
      serviceWorkerInfo: 'Deschide consola browser-ului pentru a verifica înregistrarea service worker-ului'
    });
  } catch (error) {
    console.error('Eroare server:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Eroare server internă' 
    }, { status: 500 });
  }
} 