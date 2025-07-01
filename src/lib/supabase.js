import { createClient } from '@supabase/supabase-js'

// Singleton pattern - creează o singură instanță a clientului
let supabaseInstance = null

export const getSupabase = () => {
  if (supabaseInstance) {
    return supabaseInstance
  }
  
  // Get environment variables with validation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Validate required config
  if (!supabaseUrl || !supabaseKey) {
    
    // Initialize with fallback values for development
    try {
      supabaseInstance = createClient(
        supabaseUrl || fallbackUrl,
        supabaseKey || fallbackKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      )
    } catch (error) {
      throw new Error('Supabase initialization failed: ' + error.message)
    }
  } else {
    // Normal initialization with environment variables
    try {
      supabaseInstance = createClient(
        supabaseUrl,
        supabaseKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      )
    } catch (error) {
      throw new Error('Supabase initialization failed: ' + error.message)
    }
  }
  
  return supabaseInstance
}

// Păstrează și exportul direct pentru compatibilitate cu codul existent
export const supabase = getSupabase() 