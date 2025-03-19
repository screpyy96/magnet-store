import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { orderId } = params
    
    // Obține detaliile comenzii
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
    
    if (orderError) throw orderError
    
    // Obține produsele din comandă
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
    
    if (itemsError) throw itemsError
    
    // Obține adresa de livrare
    const { data: address, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('order_id', orderId)
      .single()
    
    if (addressError && addressError.code !== 'PGRST116') {
      // PGRST116 = nu s-a găsit niciun rezultat, ceea ce e ok - poate comanda nu are adresă
      throw addressError
    }
    
    // Combină datele și returnează
    return NextResponse.json({
      ...order,
      items: items || [],
      shipping_address: address || null
    })
    
  } catch (error) {
    console.error('Eroare la obținerea detaliilor comenzii:', error)
    return NextResponse.json(
      { error: 'Nu am putut obține detaliile comenzii' }, 
      { status: 500 }
    )
  }
} 