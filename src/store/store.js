import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import cartReducer from './slices/cartSlice'

// Configurare pentru a gestiona erorile de stocare
const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null)
    },
    setItem() {
      return Promise.resolve()
    },
    removeItem() {
      return Promise.resolve()
    }
  }
}

// Folosim un storage alternativ în caz de eroare
const getStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const testKey = '__storage_test__'
      window.localStorage.setItem(testKey, testKey)
      window.localStorage.removeItem(testKey)
      return require('redux-persist/lib/storage').default
    } catch (e) {
      console.warn('localStorage not available, falling back to noop storage')
      return createNoopStorage()
    }
  }
  return createNoopStorage()
}

// Transform to exclude large data from persistence
const createDataTransform = () => ({
  in: (state, key) => {
    if (key === 'cart' && state.items) {
      // Remove large image data from persisted state
      const cleanedItems = state.items.map(item => {
        const cleanItem = { ...item }
        
        // Remove large base64 data but keep essential info
        if (cleanItem.fileData && cleanItem.fileData.length > 1000) {
          delete cleanItem.fileData
        }
        if (cleanItem.image && cleanItem.image.length > 1000) {
          delete cleanItem.image
        }
        if (cleanItem.image_url && cleanItem.image_url.length > 1000) {
          delete cleanItem.image_url
        }
        if (cleanItem.localImageData) {
          // Keep only essential metadata, not the actual image data
          cleanItem.localImageData = {
            timestamp: cleanItem.localImageData.timestamp,
            size: cleanItem.localImageData.size,
            finish: cleanItem.localImageData.finish,
            name: cleanItem.localImageData.name
          }
        }
        
        return cleanItem
      })
      
      return {
        ...state,
        items: cleanedItems
      }
    }
    return state
  },
  out: (state, key) => {
    if (key === 'cart' && state.items) {
      // When reading from storage, try to restore image data from localStorage
      const restoredItems = state.items.map(item => {
        if (item.localImageData && item.localImageData.timestamp) {
          try {
            const customImages = JSON.parse(localStorage.getItem('customMagnetImages') || '[]')
            const matchingImage = customImages.find(img => img.timestamp === item.localImageData.timestamp)
            if (matchingImage) {
              return {
                ...item,
                image: matchingImage.thumbnail,
                image_url: matchingImage.thumbnail,
                fileData: matchingImage.thumbnail,
                localImageData: matchingImage
              }
            }
          } catch (e) {
            // If restoration fails, keep the item but without image data
          }
        }
        return item
      })
      
      return {
        ...state,
        items: restoredItems
      }
    }
    return state
  }
})

const persistConfig = {
  key: 'root',
  version: 1,
  storage: getStorage(),
  whitelist: ['cart'], // Only cart is persisted
  transforms: [createDataTransform()],
  // Add throttle to prevent excessive writes
  throttle: 1000,
  // Temporarily disable persistence for debugging
  enabled: false
}

const rootReducer = combineReducers({
  cart: cartReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store) 