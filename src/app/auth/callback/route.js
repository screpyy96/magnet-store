import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    // Look for redirect in multiple possible locations
    const redirectTo = 
      requestUrl.searchParams.get('redirect_to') || 
      requestUrl.searchParams.get('redirect') || 
      requestUrl.searchParams.get('state') || 
      '/'
    
    console.log('Auth callback received:', {
      hasCode: !!code,
      redirectTo
    })
    
    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    // Create Supabase client
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
    }

    console.log('Successfully authenticated, redirecting to:', redirectTo)
    
    // Redirect to the original requested page or home
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
} 