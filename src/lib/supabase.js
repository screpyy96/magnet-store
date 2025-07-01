import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Export function for creating Supabase client
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    // During build time, environment variables might not be available
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      console.warn('Supabase environment variables not available during build');
      // Return a mock client for build-time
      return {
        from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
        storage: { from: () => ({ upload: () => Promise.resolve({ data: null, error: null }) }) },
        auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }) }
      }
    }
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

// Lazy-initialized singleton for legacy compatibility
let supabaseInstance = null;
export const supabase = new Proxy({}, {
  get(target, prop) {
    if (!supabaseInstance) {
      supabaseInstance = createClient();
    }
    return supabaseInstance[prop];
  }
});