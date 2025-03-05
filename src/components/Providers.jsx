'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store/store'
import { ToastProvider } from '@/contexts/ToastContext'
import { useEffect } from 'react'

export default function Providers({ children }) {
  // Funcție pentru a curăța localStorage în caz de eroare
  useEffect(() => {
    const handleStorageError = () => {
      try {
        // Verificăm dacă localStorage este plin
        const testKey = 'storage-test'
        localStorage.setItem(testKey, '1')
        localStorage.removeItem(testKey)
      } catch (e) {
        console.warn('Storage quota exceeded, clearing persist:root')
        // Încercăm să ștergem doar cheia pentru Redux Persist
        try {
          localStorage.removeItem('persist:root')
        } catch (clearError) {
          console.error('Failed to clear storage:', clearError)
        }
      }
    }

    // Adăugăm listener pentru erori de storage
    window.addEventListener('error', (e) => {
      if (e.message && e.message.includes('QuotaExceededError')) {
        handleStorageError()
      }
    })

    return () => {
      window.removeEventListener('error', handleStorageError)
    }
  }, [])

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </PersistGate>
    </ReduxProvider>
  )
} 