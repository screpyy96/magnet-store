import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  
  try {
    // Create a Supabase client configured for middleware
    const supabase = createMiddlewareClient({ req, res })
    
    // Refresh session if expired - necessary for proper authentication persistence
    await supabase.auth.getSession()
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    // Apply this middleware to all API routes and auth-required pages
    '/api/:path*',
    '/checkout/:path*',
    '/account/:path*',
    '/admin/:path*',
    '/orders/:path*',
    '/custom'
  ],
} 