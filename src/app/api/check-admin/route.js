import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Build server client with cookies-based session
    await cookies(); // ensure headers are available in this context
    const supabase = await createClient();
    
    // Verificăm autentificarea utilizatorului
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ isAdmin: false });
    }
    
    // Verificăm dacă utilizatorul este admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (profileError || !profile) {
      return NextResponse.json({ isAdmin: false });
    }
    
    return NextResponse.json({ isAdmin: !!profile.is_admin });
  } catch (error) {
    console.error('Eroare la verificarea adminului:', error);
    return NextResponse.json({ isAdmin: false });
  }
} 
