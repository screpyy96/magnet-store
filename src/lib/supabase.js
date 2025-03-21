import { createClient } from '@supabase/supabase-js'

// Singleton pattern - creează o singură instanță a clientului
let supabaseInstance = null

export const getSupabase = () => {
  if (supabaseInstance) {
    return supabaseInstance
  }
  
  // Inițializează un nou client doar dacă nu există deja unul
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  return supabaseInstance
}

// Păstrează și exportul direct pentru compatibilitate cu codul existent
export const supabase = getSupabase() 