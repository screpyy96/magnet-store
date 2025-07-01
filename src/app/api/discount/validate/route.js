import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { code, orderTotal } = await request.json();
    
    if (!code || !orderTotal) {
      return NextResponse.json(
        { error: 'Discount code and order total are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Use the SQL function to validate the discount code
    const { data, error } = await supabase
      .rpc('validate_discount_code', {
        p_code: code,
        p_order_total: orderTotal
      });

    if (error) {
      console.error('Error validating discount code:', error);
      return NextResponse.json(
        { error: 'Failed to validate discount code' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 400 }
      );
    }

    const result = data[0];

    if (!result.is_valid) {
      return NextResponse.json(
        { 
          isValid: false, 
          error: result.error_message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      isValid: true,
      discountAmount: result.discount_amount,
      message: `Discount applied! You save £${result.discount_amount.toFixed(2)}`
    });

  } catch (error) {
    console.error('Discount validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 