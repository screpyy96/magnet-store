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
        const storedSession = localStorage.getItem('supabase_session');
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
        
        // Always verify with Supabase to ensure session is still valid
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Save valid session to localStorage for faster restoration next time
          localStorage.setItem('supabase_session', JSON.stringify({
            ...session,
            expires_at: new Date().getTime() + (session.expires_in || 3600) * 1000
          }));
          
          setUser(session.user);
          // Verifică dacă utilizatorul este admin
          checkAdminStatus(session.user.id)
        } else if (!error) {
          // Clear session if no error but also no session
          localStorage.removeItem('supabase_session');
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUser()

    // Ascultător pentru modificări în autentificare
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Save session to localStorage for faster restoration
          if (session) {
            localStorage.setItem('supabase_session', JSON.stringify({
              ...session,
              expires_at: new Date().getTime() + (session.expires_in || 3600) * 1000
            }));
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear session on sign out
          localStorage.removeItem('supabase_session');
        }
        
        setUser(session?.user || null)
        
        if (session?.user) {
          // Verifică dacă utilizatorul este admin când se schimbă starea de autentificare
          checkAdminStatus(session.user.id)
        } else {
          setIsAdmin(false)
        }
      }
    )

    return () => {
      // Curăță listener-ul la dezmontarea componentei
      authListener?.subscription?.unsubscribe()
    }
  }, [])

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
        password: credentials.password
      })
      
      if (error) throw error
      
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
      // Determinați URL-ul de redirecționare bazat pe locația curentă
      let baseRedirectUrl = '';
      
      if (typeof window !== 'undefined') {
        // Verificăm explicit dacă suntem pe localhost
        const isLocalhost = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';
        
        // Construim URL-ul de bază pentru redirecționare
        baseRedirectUrl = isLocalhost 
          ? `${window.location.protocol}//${window.location.host}/auth/callback`
          : `${window.location.origin}/auth/callback`;
        
        console.log('Base redirect URL:', baseRedirectUrl);
      }
      
      // Configurăm opțiunile pentru Supabase OAuth
      const options = {
        provider: 'google',
        options: {
          redirectTo: redirectUrl 
            ? `${baseRedirectUrl}?redirect=${encodeURIComponent(redirectUrl)}` 
            : baseRedirectUrl
        }
      };
      
      console.log('Using OAuth options:', options);
      
      // Efectuăm autentificarea
      const { error } = await supabase.auth.signInWithOAuth(options);
      
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
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        supabase,
        loading,
        isAdmin,
        signIn,
        signOut,
        signInWithGoogle,
        setRedirectAfterLogin,
        getAndClearRedirectUrl
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook pentru a folosi contextul de autentificare
export const useAuth = () => useContext(AuthContext) 