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
      shippingDetails,
      paymentMethodId,
      userId,
      subtotal,
      totals,
      email,
      paymentIntentId
    } = await request.json()

    console.log('Received order request with:', {
      itemsCount: items?.length,
      hasShippingAddress: !!shippingAddressId,
      hasPaymentMethod: !!paymentMethodId,
      hasUserId: !!userId,
      providedTotals: totals || null
    })

    // Validate required fields
    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    if (!shippingAddressId && !shippingDetails) {
      return NextResponse.json(
        { error: 'Shipping information is required' },
        { status: 400 }
      )
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent is required' },
        { status: 400 }
      )
    }
    
    // userId is optional to support guest checkout

    // Create Supabase client
    console.log('Creating Supabase client...');
    const supabase = await createClient()
    console.log('Supabase client created successfully');

    // Use the provided userId
    const user_id = userId || null;
    console.log('Using user_id:', user_id);

    // Get shipping address details
    let addressData = null
    if (shippingAddressId) {
      const { data: addr, error: addressError } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('id', shippingAddressId)
        .single()
      if (addressError) throw addressError
      addressData = addr
    }

    // Calculate order totals (server-authoritative package pricing, free shipping, no VAT)
    const PACKAGE_PRICES = { '1': 5.00, '6': 17.00, '9': 23.00, '12': 28.00, '16': 36.00 }
    const computeSubtotal = (arr) => {
      let subtotal = 0
      for (const item of arr) {
        try {
          const custom = item.custom_data ? JSON.parse(item.custom_data) : {}
          if (custom?.type === 'custom_magnet_package' && custom.packageId && PACKAGE_PRICES[custom.packageId]) {
            subtotal += PACKAGE_PRICES[custom.packageId]
          } else {
            const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1
            const price = typeof item.totalPrice === 'number' && !isNaN(item.totalPrice)
              ? item.totalPrice
              : (typeof item.price === 'number' && !isNaN(item.price) ? item.price * qty : 0)
            subtotal += price
          }
        } catch {
          const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1
          const price = typeof item.totalPrice === 'number' && !isNaN(item.totalPrice)
            ? item.totalPrice
            : (typeof item.price === 'number' && !isNaN(item.price) ? item.price * qty : 0)
          subtotal += price
        }
      }
      return subtotal
    }
    const computedSubtotal = computeSubtotal(items)
    const shippingCost = 0
    const tax = 0
    const totalPrice = computedSubtotal + shippingCost + tax

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
          shipping_address_id: shippingAddressId || null,
          subtotal: computedSubtotal,
          shipping_cost: shippingCost,
          total: totalPrice,
          payment_status: 'succeeded',
          payment_intent_id: paymentIntentId,
          // guest fields if present (DB columns exist as flattened fields)
          guest_email: email || shippingDetails?.email || null,
          guest_full_name: shippingDetails?.full_name || null,
          guest_address_line1: shippingDetails?.address_line1 || null,
          guest_address_line2: shippingDetails?.address_line2 || null,
          guest_city: shippingDetails?.city || null,
          guest_county: shippingDetails?.county || null,
          guest_postal_code: shippingDetails?.postal_code || null,
          guest_phone: shippingDetails?.phone || null
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
          const pkgPrice = (customData.packageId && PACKAGE_PRICES[customData.packageId]) ? PACKAGE_PRICES[customData.packageId] : (item.price || 0)
          const unitPrice = pkgPrice / (imagesToProcess.length || 1)
          imagesToProcess.forEach((imageUrl, index) => {
            orderItems.push({
              order_id: order.id,
              product_name: `${packageName} - Image ${index + 1}`,
              quantity: 1,
              size: customData.size || '5x5',
              price_per_unit: customData.pricePerUnit || unitPrice,
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

    // If guest checkout, attach shipping summary to first item for admin visibility
    if (shippingDetails && orderItems.length > 0) {
      const summary = `Guest shipping: ${shippingDetails.full_name || ''}, ${shippingDetails.address_line1 || ''} ${shippingDetails.address_line2 || ''}, ${shippingDetails.city || ''}, ${shippingDetails.county || ''}, ${shippingDetails.postal_code || ''}, ${shippingDetails.country || ''}. Phone: ${shippingDetails.phone || ''}. Email: ${email || shippingDetails.email || ''}`.replace(/\s+,/g, ',').trim()
      orderItems[0].special_requirements = `${orderItems[0].special_requirements ? orderItems[0].special_requirements + ' | ' : ''}${summary}`.trim()
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
