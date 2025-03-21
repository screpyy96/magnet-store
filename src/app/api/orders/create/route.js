import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe-server'
import { v4 as uuidv4 } from 'uuid'
import webpush from 'web-push'

// Verifică dacă cheile VAPID sunt configurate
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    'mailto:' + process.env.WEB_PUSH_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request) {
  try {
    const { 
      items, 
      total, 
      shippingAddressId,
      paymentMethodId 
    } = await request.json()

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Verifică autentificarea
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mai întâi obținem sau creăm customer-ul Stripe
    let stripeCustomerId
    
    // Verifică dacă userul are deja un customer ID în Stripe
    const { data: stripeCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single()

    if (stripeCustomer) {
      stripeCustomerId = stripeCustomer.stripe_customer_id
    } else {
      // Creează un nou customer în Stripe
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          supabase_user_id: session.user.id
        }
      })

      // Salvează customer ID-ul în baza de date
      await supabase
        .from('stripe_customers')
        .insert([
          {
            user_id: session.user.id,
            stripe_customer_id: customer.id
          }
        ])

      stripeCustomerId = customer.id
    }

    // Get shipping address details
    const { data: addressData, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('id', shippingAddressId)
      .single()

    if (addressError) throw addressError

    // Calculate order totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shippingCost = subtotal >= 50 ? 0 : 4.99
    const tax = subtotal * 0.20 // 20% VAT
    const totalPrice = subtotal + shippingCost + tax

    // Creează payment intent în Stripe cu customer ID-ul
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'gbp',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      payment_method_types: ['card'],
      metadata: {
        user_id: session.user.id
      }
    })

    // Creează comanda în baza de date
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: session.user.id,
          status: 'processing',
          total_price: totalPrice,
          shipping_address: `${addressData.street}, ${addressData.city}, ${addressData.postal_code}`,
          shipping_address_id: shippingAddressId,
          shipping_method: 'standard',
          shipping_cost: shippingCost,
          subtotal: subtotal,
          tax: tax,
          total: totalPrice,
          notes: '',
        }
      ])
      .select()
      .single()

    if (orderError) throw orderError

    // Creăm array-ul de order_items fără product_id
    const orderItems = items.map(item => {
      // Try to extract image from all possible sources
      const imageUrl = item.image_url || item.fileData || item.image || 
                        (item.custom_data && typeof item.custom_data === 'string' ? 
                          JSON.parse(item.custom_data).image || JSON.parse(item.custom_data).imageUrl || 
                          JSON.parse(item.custom_data).url : 
                          item.custom_data?.image || item.custom_data?.imageUrl || item.custom_data?.url);
                          
      console.log('Processing order item:', {
        itemId: item.id,
        foundImageUrl: imageUrl,
        originalData: {
          image_url: item.image_url,
          fileData: item.fileData,
          image: item.image
        }
      });
                          
      return {
        order_id: order.id,
        product_name: item.name || 'Custom Magnet',
        quantity: item.quantity || 1,
        size: item.size || 'standard',
        price_per_unit: item.price,
        special_requirements: item.special_requirements || '',
        image_url: imageUrl || null
      };
    });

    // Inserăm datele în tabela order_items
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      throw orderItemsError;
    }

    // Adaugă tranzacția de plată
    const { error: paymentError } = await supabase
      .from('payment_transactions')
      .insert([
        {
          order_id: order.id,
          user_id: session.user.id,
          payment_method: 'stripe',
          amount: totalPrice,
          status: paymentIntent.status,
          stripe_payment_intent_id: paymentIntent.id
        }
      ])

    if (paymentError) throw paymentError

    // Adaugă notificarea către admin
    await sendAdminNotification(supabase, order.id, { total: totalPrice, ...order })

    // După ce creezi comanda, actualizează adresa existentă în loc să creezi una nouă
    const { error: shippingAddressError } = await supabase
      .from('shipping_addresses')
      .update({
        is_default: true,  // Marchează adresa ca fiind implicită pentru acest utilizator
        updated_at: new Date().toISOString()
      })
      .eq('id', shippingAddressId);  // Actualizează adresa existentă în loc să creezi una nouă

    if (shippingAddressError) {
      console.error('Eroare la actualizarea adresei de livrare:', shippingAddressError);
      throw shippingAddressError;
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      paymentIntentId: paymentIntent.id 
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

// Funcție pentru trimiterea notificării către admin
async function sendAdminNotification(supabaseClient, orderId, orderDetails) {
  try {
    // Verifică dacă cheile VAPID sunt configurate
    if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      console.log('Cheile VAPID nu sunt configurate, nu pot trimite notificări');
      return;
    }

    // Configurează sau reconfirmă cheile Web Push
    webpush.setVapidDetails(
      'mailto:' + process.env.NEXT_PUBLIC_WEB_PUSH_EMAIL,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY
    );
    
    // Obține toți administratorii din sistem
    const { data: admins, error: adminError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('is_admin', true);
    
    if (adminError || !admins || admins.length === 0) {
      console.log('Nu există administratori sau eroare la obținerea lor:', adminError);
      return;
    }
    
    // Obține toate abonamentele push pentru administratori
    const adminIds = admins.map(admin => admin.id);
    
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .in('user_id', adminIds);
    
    if (subError || !subscriptions || subscriptions.length === 0) {
      console.log('Nu există abonamente sau eroare la obținerea lor:', subError);
      return;
    }
    
    console.log(`Trimit notificări la ${subscriptions.length} dispozitive administrative`);
    
    // Pregătește payload-ul pentru notificare
    const payload = JSON.stringify({
      title: 'Comandă nouă!',
      body: `Comanda #${orderId.substring(0, 8)} în valoare de £${orderDetails.total.toFixed(2)}`,
      data: {
        orderId: orderId,
        total: orderDetails.total,
        url: `/admin/orders/${orderId}`
      }
    });
    
    // Trimite notificări la toate dispozitivele
    const notificationPromises = subscriptions.map(subscription => {
      // Utilizăm direct obiectul subscription stocat în jsonb
      const pushSubscription = subscription.subscription;
      
      return webpush.sendNotification(pushSubscription, payload)
        .catch(error => {
          console.error('Eroare la trimiterea notificării:', error);
          
          // Dacă abonamentul nu mai este valid, îl ștergem din baza de date
          if (error.statusCode === 404 || error.statusCode === 410) {
            return supabaseClient
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subscription.endpoint);
          }
        });
    });
    
    await Promise.all(notificationPromises);
    console.log('Notificări trimise cu succes');
    
  } catch (error) {
    console.error('Eroare la trimiterea notificărilor admin:', error);
  }
} 