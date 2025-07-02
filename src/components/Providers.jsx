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
    const handleStorageQuotaError = () => {
      try {
        // Check if localStorage is available and has space
        const testKey = 'storage-test'
        localStorage.setItem(testKey, '1')
        localStorage.removeItem(testKey)
      } catch (e) {
        const errorMessage = (e.message || '').toLowerCase();
        
        if (errorMessage.includes('quota') || errorMessage.includes('quotaexceeded')) {
          console.warn('Storage quota exceeded, cleaning up data...');
          
          try {
            // Clear Redux Persist data first
            localStorage.removeItem('persist:root');
            
            // Clean up custom magnet images (keep only 5 most recent)
            const customImages = JSON.parse(localStorage.getItem('customMagnetImages') || '[]');
            if (customImages.length > 0) {
              const recentImages = customImages
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 5);
              localStorage.setItem('customMagnetImages', JSON.stringify(recentImages));
            }
            
            // Clean up any other large items
            for (let key in localStorage) {
              if (localStorage.hasOwnProperty(key)) {
                const item = localStorage.getItem(key);
                if (item && item.length > 500000) { // Items larger than 500KB
                  console.warn(`Removing large localStorage item: ${key}`);
                  localStorage.removeItem(key);
                }
              }
            }
            
            // Force persistor to purge and restart
            persistor.purge().then(() => {
              console.log('Storage cleanup completed');
            });
            
          } catch (clearError) {
            console.error('Failed to clear storage:', clearError);
            // Last resort - clear everything
            try {
              localStorage.clear();
            } catch (finalError) {
              console.error('Cannot access localStorage at all:', finalError);
            }
          }
        }
      }
    };

    // Listen for storage errors globally
    const handleError = (e) => {
      if (e.message && (e.message.includes('QuotaExceededError') || e.message.includes('quota'))) {
        handleStorageQuotaError();
      }
    };

    const handleUnhandledRejection = (e) => {
      if (e.reason && e.reason.message && e.reason.message.includes('quota')) {
        handleStorageQuotaError();
      }
    };

    // Check storage on initial load
    handleStorageQuotaError();

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Periodic cleanup every 5 minutes
    const cleanupInterval = setInterval(() => {
      try {
        const storageInfo = {
          used: 0,
          items: 0
        };
        
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            storageInfo.used += localStorage.getItem(key).length;
            storageInfo.items += 1;
          }
        }
        
        // If we're using more than 8MB or have more than 50 items, clean up
        if (storageInfo.used > 8000000 || storageInfo.items > 50) {
          console.log('Performing periodic storage cleanup');
          handleStorageQuotaError();
        }
      } catch (e) {
        // Ignore errors in cleanup check
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <ReduxProvider store={store}>
      <PersistGate 
        loading={null} 
        persistor={persistor}
        onBeforeLift={() => {
          // Additional check before rehydrating
          try {
            const persistedState = localStorage.getItem('persist:root');
            if (persistedState && persistedState.length > 2000000) { // 2MB
              console.warn('Persisted state is very large, cleaning up...');
              localStorage.removeItem('persist:root');
              return;
            }
          } catch (e) {
            // If we can't read it, remove it
            localStorage.removeItem('persist:root');
          }
        }}
      >
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </PersistGate>
    </ReduxProvider>
  )
} 