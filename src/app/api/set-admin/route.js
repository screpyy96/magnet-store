import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Obține ID-ul utilizatorului din request
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'ID utilizator lipsă' }, { status: 400 })
    }
    
    // Actualizează profilul pentru a seta utilizatorul ca admin
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        is_admin: true,
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Eroare la setarea rolului admin:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 