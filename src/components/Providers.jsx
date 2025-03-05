'use client'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store/store'
import { AuthProvider } from '@/contexts/AuthContext'

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your data...</p>
            </div>
          </div>
        } 
        persistor={persistor}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </PersistGate>
    </Provider>
  )
} 