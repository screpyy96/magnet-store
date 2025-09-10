"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation'
import { safeLocalStorage } from '@/utils/localStorage'

// Create supabase client instance
const supabase = createClient()

// Crearea contextului
export const AuthContext = createContext({
  user: null,
  isLoading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  refreshSession: async () => {},
  createProfileIfNotExists: async () => {},
  supabase: supabase,
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
  
  // Funcție pentru verificarea statusului de admin folosind RPC
  const checkAdminStatus = async () => {
    try {
      // Try server route first (SSR session via cookies)
      const res = await fetch('/api/check-admin', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json?.isAdmin === true) {
          setIsAdmin(true);
          return;
        }
      }
    } catch (error) {
      // Ignore and fall back to client check
    }

    // Fallback: client-side check using current user id
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) {
        setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', uid)
        .maybeSingle();
      if (error) throw error;
      setIsAdmin(!!data?.is_admin);
    } catch (error) {
      console.error('Admin fallback check failed:', error?.message || error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Verifică dacă avem un utilizator la încărcarea paginii
    const fetchUser = async () => {
      try {
        // Always get the server session to ensure cookies are synchronized
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Store the session for faster client-side access
        if (data?.session) {
          safeLocalStorage.setJSON('supabase_session', data.session);
          setUser(data.session.user || null);
          if (data.session.user) {
            checkAdminStatus();
          }
        } else {
          setUser(null);
        }
      } catch (error) {
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
          checkAdminStatus();
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
  
  const signUp = async (credentials) => {
    try {
      const { data, error } = await supabase.auth.signUp(credentials)
      
      if (error) {
        throw error
      }
      
      // If user is confirmed immediately (no email confirmation needed)
      if (data?.user && data?.session) {
        setUser(data.user)
        // Profile is created automatically by the trigger, but we can check admin status
        if (data.user) {
          checkAdminStatus()
        }
      }
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const signIn = async (credentials, redirectUrl = '/') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials)
      
      if (error) {
        throw error
      }
      
      if (data?.session) {
        safeLocalStorage.setJSON('supabase_session', data.session)
        setUser(data.session.user)
        
        if (data.session.user) {
          checkAdminStatus()
        }
        
        return { success: true, user: data.session.user }
      }
      
      throw new Error('No session created')
    } catch (error) {
      return { success: false, error: error.message }
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
  
  const signInWithGoogle = async (redirectUrl = '/') => {
    try {
      // Use the correct redirect URL format for Supabase OAuth
      const fullRedirectUrl = `${window.location.origin}/auth/callback`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: fullRedirectUrl,
          queryParams: {
            redirect_to: redirectUrl
          }
        }
      })
      
      if (error) {
        throw error
      }
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const createProfileIfNotExists = async (user) => {
    try {
      const { data, error } = await supabase.rpc('create_user_profile', {
        user_id: user.id,
        user_email: user.email,
        full_name: user.user_metadata?.full_name || ''
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      // Don't throw error here, as the trigger might have already created the profile
      return null;
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
          checkAdminStatus();
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
      signUp,
      signIn,
      signOut,
      signInWithGoogle,
      refreshSession,
      createProfileIfNotExists,
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
