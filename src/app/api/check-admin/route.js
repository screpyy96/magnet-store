import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
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