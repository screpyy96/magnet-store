"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { safeLocalStorage } from '@/utils/localStorage'

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
        const storedSession = safeLocalStorage.getJSON('supabase_session');
          
        if (storedSession) {
          const now = new Date().getTime();
          
          // If stored session isn't expired, use it immediately (fast path)
          if (storedSession && storedSession.expires_at && storedSession.expires_at > now) {
            setUser(storedSession.user || null);
            if (storedSession.user) {
              checkAdminStatus(storedSession.user.id);
            }
          }
        }
        
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
            checkAdminStatus(data.session.user.id);
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

  // Funcție pentru verificarea statusului de admin folosind RPC
  const checkAdminStatus = async (userId) => {
    if (!userId) {
      return;
    }

    // Check cache first
    const cachedAdminStatus = safeLocalStorage.getItem(`admin_status_${userId}`);
    if (cachedAdminStatus !== null) {
      setIsAdmin(cachedAdminStatus === 'true');
      return;
    }

    try {
      const { data: adminStatus, error } = await supabase.rpc('get_user_admin_status', {
        user_id: userId
      });

      if (error) {
        throw error;
      }

      // Cache and set the admin status
      safeLocalStorage.setItem(`admin_status_${userId}`, adminStatus.toString());
      setIsAdmin(adminStatus);
    } catch (error) {
      // Only update state if we don't have a cached value
      if (cachedAdminStatus === null) {
        setIsAdmin(false);
      }
    }
  };

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
      const { data, error } = await supabase.auth.signInWithPassword(credentials)
      
      if (error) {
        throw error
      }
      
      if (data?.session) {
        safeLocalStorage.setJSON('supabase_session', data.session)
        setUser(data.session.user)
        
        if (data.session.user) {
          checkAdminStatus(data.session.user.id)
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
      const fullRedirectUrl = `${window.location.origin}/auth/callback?redirect_to=${encodeURIComponent(redirectUrl)}`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: fullRedirectUrl
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
      throw error;
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