import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    // Create Supabase client
    const supabase = createClient();
    
    // Verifică dacă utilizatorul este admin
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, message: 'Nu ești autentificat' },
        { status: 401 }
      );
    }
    
    // Creează function SQL pentru a crea tabela dacă nu există
    const { error: functionError } = await supabase.rpc('create_push_subscriptions_function');
    
    if (functionError) {
      console.error('Eroare la crearea funcției SQL:', functionError);
      return NextResponse.json(
        { success: false, message: 'Eroare la configurarea sistemului de notificări' },
        { status: 500 }
      );
    }
    
    // Verifică și creează tabela
    const { error: tableError } = await supabase.rpc('create_push_subscriptions_if_not_exists');
    
    if (tableError) {
      console.error('Eroare la crearea tabelei push_subscriptions:', tableError);
      return NextResponse.json(
        { success: false, message: 'Eroare la configurarea tabelei pentru notificări' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sistemul de notificări a fost configurat cu succes',
      vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'Lipsește cheia publică'
    });
  } catch (error) {
    console.error('Eroare server:', error);
    return NextResponse.json(
      { success: false, message: 'Eroare server internă' },
      { status: 500 }
    );
  }
} 