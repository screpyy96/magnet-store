import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { userId, shippingAddressId, cartItems, cartTotal } = await request.json()
    
    if (!userId || !shippingAddressId || !cartItems || cartItems.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Verifică dacă utilizatorul există
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
    
    if (userError || !userData) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Verifică dacă adresa există
    const { data: addressData, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('id')
      .eq('id', shippingAddressId)
      .eq('user_id', userId)
      .single()
    
    if (addressError || !addressData) {
      return new Response(JSON.stringify({ error: 'Invalid shipping address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Calculează costul transportului
    const shippingCost = cartTotal >= 50 ? 0 : 4.99
    const totalAmount = cartTotal + shippingCost
    
    // Creează comanda
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          shipping_address_id: shippingAddressId,
          status: 'pending',
          subtotal: cartTotal,
          shipping_cost: shippingCost,
          total: totalAmount,
          shipping_method: 'standard'
        }
      ])
      .select()
      .single()
    
    if (orderError) {
      return new Response(JSON.stringify({ error: 'Failed to create order' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Creează elementele comenzii
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      quantity: item.quantity,
      price_per_unit: item.price,
      image_url: item.fileData,
      size: 'small'
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) {
      // Dacă eșuează adăugarea produselor, ștergem comanda
      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id)
      
      return new Response(JSON.stringify({ error: 'Failed to create order items' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Notifică administratorii despre noua comandă
    try {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `Comandă nouă #${order.id.substring(0, 8)}`,
            description: `O nouă comandă a fost plasată în valoare de ${totalAmount.toFixed(2)}£`,
            color: 5814783, // Culoare mov
            fields: [
              { name: 'ID Comandă', value: order.id, inline: true },
              { name: 'Total', value: `${totalAmount.toFixed(2)}£`, inline: true },
            ],
            url: `https://yourdomain.com/admin/orders/${order.id}`,
            timestamp: new Date().toISOString()
          }]
        })
      });
    } catch (error) {
      console.error('Failed to send Discord notification:', error)
      // Continuăm procesul, notificarea nu este critică
    }
    
    // Salvează notificarea în baza de date pentru a fi afișată în admin dashboard
    try {
      await supabase
        .from('admin_notifications')
        .insert([
          {
            type: 'new_order',
            title: 'Comandă nouă',
            message: `Comandă nouă #${order.id.substring(0, 8)} de ${totalAmount.toFixed(2)}£`,
            link: `/admin/orders/${order.id}`,
            read: false
          }
        ]);
    } catch (error) {
      console.error('Failed to create notification:', error)
      // Continuăm procesul, notificarea nu este critică
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      order: {
        id: order.id,
        total: totalAmount,
        status: order.status
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error processing checkout:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 