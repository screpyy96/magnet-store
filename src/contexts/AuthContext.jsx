"use client"

import { createContext, useState, useEffect, useContext } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

// Crearea contextului
const AuthContext = createContext({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  supabase: null,
});

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Creează o singură instanță de client Supabase
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    // Verifică sesiunea existentă
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsLoading(false)
      
      // Salvează în localStorage dacă există o sesiune
      if (session?.user) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session))
      }
    }
    
    getSession()
    
    // Configurează listener pentru schimbări de stare
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      setUser(session?.user ?? null)
      
      // Actualizează localStorage
      if (session?.user) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session))
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('supabase.auth.token')
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])
  
  const signIn = async (email, password, redirectUrl = '/') => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // Obține parametrul redirect din URL sau folosește valoarea default
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect') || redirectUrl
      
      // Asigură-te că state-ul e actualizat înainte de redirecționare
      setUser(data.user)
      
      // Navighează după autentificare
      router.push(redirect)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }
  
  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      router.push('/')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }
  
  const signInWithGoogle = async ({ redirectTo } = {}) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?redirect=${redirectTo}` : ''}`
      }
    })
    if (error) throw error
  }
  
  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, signInWithGoogle, supabase }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook pentru a folosi contextul de autentificare
export const useAuth = () => useContext(AuthContext) 