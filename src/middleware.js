import { createMiddlewareClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const response = NextResponse.next()
  
  const supabase = createMiddlewareClient(
    { 
      request, 
      response 
    },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  )
  
  const { data: { session } } = await supabase.auth.getSession()

  // Check auth condition
  if (request.nextUrl.pathname.startsWith('/custom') ||
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/orders')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (session && (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')
  )) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    
    '/profile',
    '/orders',
    '/login',
    '/register'
  ]
} 