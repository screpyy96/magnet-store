"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

// Crearea contextului
export const AuthContext = createContext({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  refreshSession: async () => {},
  supabase: null,
  setRedirectAfterLogin: () => {},
  getAndClearRedirectUrl: () => {},
});

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [redirectUrl, setRedirectUrl] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Verifică dacă avem un utilizator la încărcarea paginii
    const fetchUser = async () => {
      try {
        // Try to get session from storage first for faster restoration
        const storedSession = typeof window !== 'undefined' ? 
          localStorage.getItem('supabase_session') : null;
          
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            const now = new Date().getTime();
            
            // If stored session isn't expired, use it immediately (fast path)
            if (parsedSession && parsedSession.expires_at && parsedSession.expires_at > now) {
              setUser(parsedSession.user || null);
              if (parsedSession.user) {
                checkAdminStatus(parsedSession.user.id);
              }
            }
          } catch (e) {
            console.error('Error parsing stored session:', e);
            // Continue with regular session fetch if stored session parsing failed
          }
        }
        
        // Always get the server session to ensure cookies are synchronized
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Store the session for faster client-side access
        if (data?.session) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('supabase_session', JSON.stringify(data.session));
          }
          setUser(data.session.user || null);
          if (data.session.user) {
            checkAdminStatus(data.session.user.id);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('supabase_session', JSON.stringify(session));
        }
        setUser(session.user);
        if (session.user) {
          checkAdminStatus(session.user.id);
        }
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase_session');
        }
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Funcție pentru verificarea statusului de admin
  const checkAdminStatus = async (userId) => {
    try {
      // Verificăm mai întâi localStorage pentru a evita cereri în exces
      const cachedAdminStatus = localStorage.getItem(`admin_status_${userId}`)
      
      if (cachedAdminStatus) {
        setIsAdmin(cachedAdminStatus === 'true')
      }
      
      // Facem cererea către server pentru a actualiza statusul
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle()
        
      if (error) {
        console.error('Error checking admin status:', error)
        return
      }
      
      const adminStatus = !!data?.is_admin
      setIsAdmin(adminStatus)
      
      // Salvăm în localStorage pentru referințe viitoare
      localStorage.setItem(`admin_status_${userId}`, adminStatus.toString())
    } catch (error) {
      console.error('Error in admin check:', error)
    }
  }

  // Store the intended URL before redirect
  const setRedirectAfterLogin = (url) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', url)
    }
  }

  // Get and clear the stored redirect URL
  const getAndClearRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const redirect = sessionStorage.getItem('redirectAfterLogin')
      sessionStorage.removeItem('redirectAfterLogin')
      return redirect
    }
    return null
  }
  
  const signIn = async (credentials, redirectUrl = '/') => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      })
      
      if (error) throw error
      
      // Explicitly set the cookie for better cross-site handling
      if (typeof window !== 'undefined' && data?.session) {
        // Session will be automatically persisted in cookies by Supabase
        console.log('Authentication successful, session established');
      }
      
      // Obține parametrul redirect din URL sau folosește valoarea default
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect') || redirectUrl
      
      // Asigură-te că state-ul e actualizat înainte de redirecționare
      setUser(data.user)
      
      // Navighează după autentificare
      router.push(redirect)
      
      await createProfileIfNotExists(data.user)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }
  
  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      router.push('/')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }
  
  const signInWithGoogle = async (redirectUrl = null) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Build redirect path based on whether we have a custom redirect
      let redirectPath = '/auth/callback';
      if (redirectUrl) {
        redirectPath += `?redirect=${encodeURIComponent(redirectUrl)}`;
      }
      
      const fullRedirectUrl = `${origin}${redirectPath}`;
      console.log('Google sign-in redirect:', fullRedirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: fullRedirectUrl
        }
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  }
  
  const createProfileIfNotExists = async (user) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
      
    if (error && error.code === 'PGRST116') {
      // Utilizatorul nu există în profiles, îl creăm
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
      });
    }
  };
  
  // Add the refreshSession function implementation
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Failed to refresh session:', error);
        return { success: false, error };
      }
      
      if (data.session) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('supabase_session', JSON.stringify(data.session));
        }
        setUser(data.session.user);
        if (data.session.user) {
          checkAdminStatus(data.session.user.id);
        }
        return { success: true, user: data.session.user };
      }
      
      return { success: false, error: 'No session data returned' };
    } catch (error) {
      console.error('Session refresh error:', error);
      return { success: false, error };
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isLoading: loading,
      signIn,
      signOut,
      signInWithGoogle,
      refreshSession,
      supabase,
      isAdmin,
      setRedirectAfterLogin,
      getAndClearRedirectUrl
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook pentru a folosi contextul de autentificare
export const useAuth = () => useContext(AuthContext) 