import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe-server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

// Verifică dacă cheile VAPID sunt configurate
if (process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    'mailto:' + process.env.NEXT_PUBLIC_WEB_PUSH_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY
  );
  console.log('VAPID keys configured for push notifications');
} else {
  console.warn('VAPID keys not configured, push notifications will not work');
}

export async function POST(request) {
  try {
    const { 
      items, 
      shippingAddressId,
      paymentMethodId,
      userId // Accept userId directly
    } = await request.json()

    console.log('Received order request with:', {
      itemsCount: items?.length,
      hasShippingAddress: !!shippingAddressId,
      hasPaymentMethod: !!paymentMethodId,
      hasUserId: !!userId
    })

    // Validate required fields
    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    if (!shippingAddressId) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      )
    }

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      )
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get all cookies for debugging
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log('Available cookies:', allCookies.map(c => ({ name: c.name, path: c.path })))
    
    // Create Supabase client with explicit cookie handling
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Create a service role client for operations that need to bypass RLS
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false
        }
      }
    )
    
    // Optional session check - but we'll use the provided userId anyway
    const { data, error: sessionError } = await supabase.auth.getSession()
    console.log('Auth session check:', {
      hasSession: !!data?.session,
      sessionError: sessionError ? sessionError.message : null,
      usingProvidedUserId: true
    })
    
    // Use the provided userId instead of relying on session
    const user_id = userId;
    console.log('Using user_id:', user_id);

    // Mai întâi obținem sau creăm customer-ul Stripe
    let stripeCustomerId
    
    // Verifică dacă userul are deja un customer ID în Stripe
    const { data: stripeCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .single()

    if (stripeCustomer) {
      stripeCustomerId = stripeCustomer.stripe_customer_id
    } else {
      // Creează un nou customer în Stripe
      const customer = await stripe.customers.create({
        email: data?.session?.user.email,
        metadata: {
          supabase_user_id: user_id
        }
      })

      // Salvează customer ID-ul în baza de date
      await supabase
        .from('stripe_customers')
        .insert([
          {
            user_id: user_id,
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

    // Check if we're using a mock payment method (for development)
    const isMockPaymentMethod = paymentMethodId && paymentMethodId.startsWith('pm_mock_');
    
    let paymentIntent;
    
    if (isMockPaymentMethod && process.env.NODE_ENV === 'development') {
      // In development mode with mock payment, create a mock payment intent
      console.log('Using mock payment method in development mode');
      paymentIntent = {
        id: 'pi_mock_' + Math.random().toString(36).substring(2, 15),
        status: 'succeeded',
        amount: Math.round(totalPrice * 100),
        currency: 'gbp',
        customer: stripeCustomerId
      };
    } else {
      // Real Stripe payment
      // Creează payment intent în Stripe cu customer ID-ul
      const paymentIntentParams = {
        amount: Math.round(totalPrice * 100),
        currency: 'gbp',
        customer: stripeCustomerId,
        metadata: {
          user_id: user_id
        }
      };
  
      // Only add payment_method and confirm if we have a valid payment method
      if (paymentMethodId) {
        paymentIntentParams.payment_method = paymentMethodId;
        paymentIntentParams.confirm = true;
        paymentIntentParams.payment_method_types = ['card'];
      } else {
        // If no payment method, create a PaymentIntent without confirming
        paymentIntentParams.payment_method_types = ['card'];
        paymentIntentParams.setup_future_usage = 'off_session';
      }
  
      // Create the PaymentIntent
      paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    }

    // Creează comanda în baza de date - using service role client
    const { data: order, error: orderError } = await serviceRoleClient
      .from('orders')
      .insert([
        {
          user_id: user_id,
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

    if (orderError) {
      console.error('Failed to create order:', orderError);
      throw orderError;
    }

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

    // Inserăm datele în tabela order_items - using service role client
    const { data: orderItemsData, error: orderItemsError } = await serviceRoleClient
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      console.error('Failed to insert order items:', orderItemsError);
      throw orderItemsError;
    }

    // Adaugă tranzacția de plată - using service role to bypass RLS
    const { error: paymentError } = await serviceRoleClient
      .from('payment_transactions')
      .insert([
        {
          order_id: order.id,
          user_id: user_id,
          payment_method: isMockPaymentMethod ? 'stripe_mock' : 'stripe',
          amount: totalPrice,
          status: paymentIntent.status,
          stripe_payment_intent_id: paymentIntent.id
        }
      ])

    if (paymentError) {
      console.error('Failed to insert payment transaction:', paymentError);
      throw paymentError;
    }

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
    console.log('Starting admin notification process for order:', orderId);
    
    // Verifică dacă cheile VAPID sunt configurate
    if (!process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      console.error('VAPID keys not configured, cannot send notifications');
      console.log('VAPID Private Key exists:', !!process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY);
      console.log('VAPID Public Key exists:', !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
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
    
    if (adminError) {
      console.error('Error fetching admin users:', adminError);
      return;
    }
    
    if (!admins || admins.length === 0) {
      console.log('No admin users found in the system');
      return;
    }
    
    console.log('Found admin users:', admins.length);
    
    // Obține toate abonamentele push pentru administratori
    const adminIds = admins.map(admin => admin.id);
    
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .in('user_id', adminIds);
    
    if (subError) {
      console.error('Error fetching push subscriptions:', subError);
      return;
    }
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for admin users');
      console.log('Admin IDs checked:', adminIds);
      return;
    }
    
    console.log(`Sending notifications to ${subscriptions.length} admin devices`);
    
    // Debug output of subscription data (with sensitive data masked)
    subscriptions.forEach((sub, index) => {
      console.log(`Subscription ${index + 1}:`, {
        user_id: sub.user_id,
        endpoint: sub.endpoint ? sub.endpoint.substring(0, 30) + '...' : 'missing',
        has_valid_data: !!sub.subscription
      });
    });
    
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
      // Verifică dacă avem un obiect de abonament valid
      if (!subscription.subscription) {
        console.error('Invalid subscription object for user:', subscription.user_id);
        return Promise.resolve();
      }
      
      // Utilizăm direct obiectul subscription stocat în jsonb
      const pushSubscription = subscription.subscription;
      
      return webpush.sendNotification(pushSubscription, payload)
        .then(() => {
          console.log(`Successfully sent notification to endpoint: ${pushSubscription.endpoint.substring(0, 30)}...`);
        })
        .catch(error => {
          console.error('Error sending notification:', error.message, error.statusCode);
          console.log('Failed subscription details:', { 
            user_id: subscription.user_id,
            endpoint: pushSubscription.endpoint.substring(0, 30) + '...'
          });
          
          // Dacă abonamentul nu mai este valid, îl ștergem din baza de date
          if (error.statusCode === 404 || error.statusCode === 410) {
            console.log('Subscription expired or invalid, removing from database');
            return supabaseClient
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subscription.endpoint);
          }
        });
    });
    
    await Promise.all(notificationPromises);
    console.log('Notification process completed');
    
  } catch (error) {
    console.error('Error in admin notification process:', error);
  }
} 