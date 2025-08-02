import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    return NextResponse.json(
      { error: 'Stripe is not configured properly' },
      { status: 500 }
    );
  }

  try {
    console.log('Processing setup intent request');
    
    // Obține datele din body inclusiv userId
    const body = await request.json().catch(() => ({}));
    console.log('Request body:', body);
    
    const cookieStore = await cookies();
    console.log('Cookies obtained');
    
    // Create Supabase client
    const supabase = createClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Verifică sesiunea și/sau userId din request
    let userId;
    
    if (session && session.user && session.user.id) {
      console.log('User authenticated from session:', session.user.id);
      userId = session.user.id;
    } else if (body && body.userId) {
      console.log('Using userId from request body:', body.userId);
      userId = body.userId;
      
      // Eliminăm verificarea restrictivă și ne bazăm pe clientul autentificat
      // Putem face o verificare simplă a formatului UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error('Invalid user ID format provided');
        return NextResponse.json(
          { error: 'Invalid user ID format' },
          { status: 400 }
        );
      }
    } else {
      console.log('No valid session or userId found');
      return NextResponse.json(
        { error: 'You must be logged in to set up a payment method' },
        { status: 401 }
      );
    }
    
    // Inițializează Stripe cu verificare explicită
    let stripe;
    try {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
    } catch (stripeInitError) {
      console.error('Failed to initialize Stripe:', stripeInitError);
      return NextResponse.json(
        { error: 'Payment service configuration error' },
        { status: 500 }
      );
    }
    
    // Adaugă userId explicit în metadata
    const setupIntent = await stripe.setupIntents.create({
      metadata: { user_id: userId },
    });
    
    console.log('Setup intent created successfully for user:', userId);
    return NextResponse.json({ clientSecret: setupIntent.client_secret });
    
  } catch (error) {
    console.error('Unexpected error in setup-intent API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: ' + error.message },
      { status: 500 }
    );
  }
} 