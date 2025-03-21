import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Get all cookies for debugging - with proper await
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log('Auth check - available cookies:', allCookies.map(c => ({ name: c.name })))
    
    // Create Supabase client with awaited cookies
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Check authentication status
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth check - session error:', error)
      return NextResponse.json(
        { error: error.message, authenticated: false },
        { status: 401 }
      )
    }
    
    const authenticated = !!data?.session
    
    console.log('Auth check - session found:', authenticated)
    
    if (authenticated) {
      return NextResponse.json({ 
        authenticated: true,
        userId: data.session.user.id,
        data: {
          user: {
            id: data.session.user.id,
            email: data.session.user.email
          }
        }
      })
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
  } catch (error) {
    console.error('Auth check - unexpected error:', error)
    return NextResponse.json(
      { error: 'Authentication check failed', authenticated: false },
      { status: 500 }
    )
  }
} 