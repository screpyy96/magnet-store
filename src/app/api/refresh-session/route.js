import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST() {
  try {
    // Create Supabase client
    const supabase = createClient()
    
    // Try to get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session refresh error:', sessionError)
      return NextResponse.json(
        { success: false, error: 'Session error' },
        { status: 401 }
      )
    }
    
    if (!session) {
      console.log('No session to refresh')
      return NextResponse.json(
        { success: false, error: 'No active session' },
        { status: 401 }
      )
    }
    
    // Try to refresh the session token
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('Error refreshing session:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to refresh session' },
        { status: 401 }
      )
    }
    
    // Return the refreshed session
    return NextResponse.json({
      success: true,
      user: data.user
    })
  } catch (error) {
    console.error('Session refresh unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Session refresh failed' },
      { status: 500 }
    )
  }
} 