import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Export function for creating Supabase client
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Supabase configuration missing: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`)
  }
  
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

// Legacy export for backward compatibility
export const supabase = createClient()