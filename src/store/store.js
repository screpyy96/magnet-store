import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
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
      // Return a localStorage-backed storage wrapper without importing redux-persist/lib/storage
      return {
        getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
        setItem: (key, value) => {
          window.localStorage.setItem(key, value)
          return Promise.resolve()
        },
        removeItem: (key) => {
          window.localStorage.removeItem(key)
          return Promise.resolve()
        }
      }
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
      // Remove ALL image data from persisted state to prevent quota errors
      const cleanedItems = state.items.map(item => {
        const { fileData, image, image_url, images, thumbnails, localImageData, ...cleanItem } = item
        
        // Parse custom_data and remove images from there too
        if (cleanItem.custom_data) {
          try {
            const customData = JSON.parse(cleanItem.custom_data)
            // Remove image arrays from custom_data
            delete customData.images
            delete customData.thumbnails
            cleanItem.custom_data = JSON.stringify(customData)
          } catch (e) {
            // If parsing fails, keep original
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
  throttle: 1000
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

let _persistor = null
if (typeof window !== 'undefined') {
  _persistor = persistStore(store)
}

export const persistor = _persistor