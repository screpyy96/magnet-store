import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getStripe } from '@/lib/stripe-server'

export const runtime = 'nodejs'


export async function POST(request) {
  try {
    console.log('API route called');
    
    const { 
      items, 
      shippingAddressId,
      paymentMethodId,
      userId,
      total,
      paymentIntentId
    } = await request.json()

    console.log('Received order request with:', {
      itemsCount: items?.length,
      hasShippingAddress: !!shippingAddressId,
      hasPaymentMethod: !!paymentMethodId,
      hasUserId: !!userId,
      total: total
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

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent is required' },
        { status: 400 }
      )
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    console.log('Creating Supabase client...');
    const supabase = await createClient()
    console.log('Supabase client created successfully');

    // Use the provided userId
    const user_id = userId;
    console.log('Using user_id:', user_id);

    // Get shipping address details
    const { data: addressData, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('id', shippingAddressId)
      .single()

    if (addressError) throw addressError

    // Calculate order totals
    const subtotal = total || items.reduce((sum, item) => sum + (item.totalPrice || item.price * (item.quantity || 1)), 0)
    const shippingCost = subtotal >= 50 ? 0 : 4.99
    const tax = subtotal * 0.20 // 20% VAT
    const totalPrice = subtotal + shippingCost + tax

    console.log('Order totals calculated:', {
      subtotal,
      shippingCost,
      tax,
      totalPrice
    })

    // Verify payment intent with Stripe
    const stripe = getStripe()
    let paymentIntent
    
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Error verifying payment intent:', error)
      return NextResponse.json(
        { error: 'Invalid payment intent' },
        { status: 400 }
      )
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user_id,
          status: 'processing',
          shipping_address_id: shippingAddressId,
          subtotal: subtotal,
          shipping_cost: shippingCost,
          total: totalPrice,
          payment_status: 'paid',
          payment_intent_id: paymentIntentId
        }
      ])
      .select()
      .single()

    if (orderError) {
      console.error('Failed to create order:', orderError);
      throw orderError;
    }

    console.log('Order created successfully:', order.id);

    // Create order_items array
    const orderItems = [];
    
    for (const item of items) {
      try {
        const customData = item.custom_data ? JSON.parse(item.custom_data) : {};
        
        if (customData.type === 'custom_magnet_package') {
          // Handle package - extract all images
          const images = customData.images || [];
          const thumbnails = customData.thumbnails || item.images || [];
          const packageName = customData.packageName || item.name || 'Custom Magnet Package';
          
          console.log('Processing package:', {
            packageId: customData.packageId,
            imageCount: images.length || thumbnails.length,
            packageName: packageName
          });
          
          // Use full images if available, otherwise use thumbnails
          const imagesToProcess = images.length > 0 ? images : thumbnails;
          
          // Create one order item per image in the package
          imagesToProcess.forEach((imageUrl, index) => {
            orderItems.push({
              order_id: order.id,
              product_name: `${packageName} - Image ${index + 1}`,
              quantity: 1,
              size: customData.size || '5x5',
              price_per_unit: customData.pricePerUnit || (item.price / imagesToProcess.length),
              special_requirements: `Package ${customData.packageId} - ${customData.finish || 'flexible'} finish`,
              image_url: imageUrl
            });
          });
        } else {
          // Handle single items or regular products
          const imageUrl = item.image_url || item.fileData || item.image || 
                          (customData.image || customData.imageUrl || customData.url);
          
          console.log('Processing single item:', {
            itemId: item.id,
            foundImageUrl: !!imageUrl,
            itemName: item.name
          });
          
          orderItems.push({
            order_id: order.id,
            product_name: item.name || 'Custom Magnet',
            quantity: item.quantity || 1,
            size: customData.size || item.size || 'standard',
            price_per_unit: item.price,
            special_requirements: item.special_requirements || '',
            image_url: imageUrl || null
          });
        }
      } catch (error) {
        console.error('Error processing item:', error);
        // Fallback for items that fail parsing
        orderItems.push({
          order_id: order.id,
          product_name: item.name || 'Product',
          quantity: item.quantity || 1,
          size: 'standard',
          price_per_unit: item.price,
          special_requirements: '',
          image_url: null
        });
      }
    }

    // Insert data into order_items table
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      console.error('Failed to insert order items:', orderItemsError);
      throw orderItemsError;
    }

    console.log('Order items created successfully:', orderItemsData?.length || 0, 'items');

    console.log('Order created successfully without payment transaction (demo mode)');

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: 'Order created successfully'
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
} 