'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/store/store'
import { ToastProvider } from '@/contexts/ToastContext'

export default function Providers({ children }) {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </ReduxProvider>
  )
} 