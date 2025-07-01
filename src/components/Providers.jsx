'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store/store'
import { ToastProvider } from '@/contexts/ToastContext'
import { useEffect } from 'react'

export default function Providers({ children }) {
  // Handle storage errors gracefully
  useEffect(() => {
    const handleStorageError = () => {
      try {
        // Check if localStorage is available and has space
        const testKey = 'storage-test'
        localStorage.setItem(testKey, '1')
        localStorage.removeItem(testKey)
      } catch (e) {
        // Clear Redux Persist data to free up space
        try {
          localStorage.removeItem('persist:root')
        } catch (clearError) {
          // Storage is completely full or unavailable
        }
      }
    }

    // Listen for storage errors
    const handleError = (e) => {
      if (e.message && e.message.includes('QuotaExceededError')) {
        handleStorageError()
      }
    }

    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('error', handleError)
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