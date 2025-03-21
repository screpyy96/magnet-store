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
    console.error('Supabase configuration missing:', { 
      urlExists: !!supabaseUrl, 
      keyExists: !!supabaseKey 
    })
    
    // In production, use hardcoded values as fallback (same as .env.local)
    // Only as a temporary solution while debugging
    const fallbackUrl = 'https://wucwlqxuqgusthpllkgd.supabase.co'
    const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y3dscXh1cWd1c3RocGxsa2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MTkyNTgsImV4cCI6MjA0ODk5NTI1OH0.1cWoFPPN7TMbnyKu77nZGzLDUoD5ltKcubMy2zs925k'
    
    // Inițializează un nou client cu valorile implicite
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
      console.error('Failed to initialize Supabase client:', error)
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
      console.error('Failed to initialize Supabase client:', error)
      throw new Error('Supabase initialization failed: ' + error.message)
    }
  }
  
  return supabaseInstance
}

// Păstrează și exportul direct pentru compatibilitate cu codul existent
export const supabase = getSupabase() 