import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if email already exists
    const { data: existingSubscription } = await supabase
      .from('newsletter_subscriptions')
      .select('id, discount_code_used')
      .eq('email', email)
      .single();

    if (existingSubscription) {
      if (!existingSubscription.discount_code_used) {
        // Email exists but discount not used yet
        return NextResponse.json({
          message: 'You are already subscribed! Your discount code: WELCOME10',
          discountCode: 'WELCOME10'
        });
      } else {
        return NextResponse.json(
          { error: 'Email already subscribed and discount used' },
          { status: 409 }
        );
      }
    }

    // Generate unique discount code (for now using WELCOME10, but could be unique per user)
    const discountCode = 'WELCOME10';
    
    // Create newsletter subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('newsletter_subscriptions')
      .insert([
        {
          email,
          discount_code: discountCode,
          subscribed_at: new Date().toISOString(),
          discount_code_used: false,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // The discount code is already created in the SQL setup
    // No need to create it here since it exists as WELCOME10

    return NextResponse.json({
      message: 'Successfully subscribed! Your discount code: ' + discountCode,
      discountCode,
      subscriptionId: subscription.id
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 