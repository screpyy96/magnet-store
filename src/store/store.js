import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import cartReducer from './cartSlice'

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

const persistConfig = {
  key: 'root',
  version: 1,
  storage: getStorage(),
  whitelist: ['cart'], // Doar cart-ul este persistat
  // Adăugăm un transform pentru a comprima datele mari
  transforms: [
    {
      in: (state, key) => {
        // Dacă avem prea multe elemente în cart, păstrăm doar ultimele 10
        if (key === 'cart' && state.items && state.items.length > 10) {
          return {
            ...state,
            items: state.items.slice(-10) // Păstrăm doar ultimele 10 elemente
          }
        }
        return state
      },
      out: (state) => state
    }
  ]
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