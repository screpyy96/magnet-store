import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ['/profile', '/orders']
  
  // Auth routes (login, register) - redirect to home if already authenticated
  const authRoutes = ['/login', '/register']

  const path = req.nextUrl.pathname

  // If trying to access a protected route without being authenticated
  if (protectedRoutes.includes(path) && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If trying to access auth routes while being authenticated
  if (authRoutes.includes(path) && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: [
   
    '/profile',
    '/orders',
    '/login',
    '/register'
  ]
} 