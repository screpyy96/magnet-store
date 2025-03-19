import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  try {
    const { orderId } = params
    const { status } = await request.json()
    
    if (!status) {
      return NextResponse.json({ error: 'Status lipsă' }, { status: 400 })
    }
    
    // Actualizează statusul comenzii
    const { error } = await supabase
      .from('orders')
      .update({ status: status })
      .eq('id', orderId)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Eroare la actualizarea statusului comenzii:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 