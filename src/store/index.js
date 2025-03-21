import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import thunk from 'redux-thunk'

// Importăm reducerii
import cartReducer from './slices/cartSlice'
import authReducer from './slices/authSlice'

// Creăm o functie de configurare condițională pentru storage
const createNoopStorage = () => {
  return {
    getItem() { return Promise.resolve(null) },
    setItem(_key, value) { return Promise.resolve(value) },
    removeItem() { return Promise.resolve() }
  }
}

// Funcție pentru a initializa storage-ul
const initializeStorage = () => {
  // Verificăm dacă suntem în browser sau pe server
  if (typeof window !== 'undefined') {
    // Importăm storage-ul doar în browser
    const storage = require('redux-persist/lib/storage').default
    return storage
  }
  // Returnăm un storage noop pentru server
  return createNoopStorage()
}

const persistConfig = {
  key: 'root',
  storage: initializeStorage(),
  whitelist: ['cart'] // Modifică aici pentru a persista doar cart
}

// Important: Foloseşte combineReducers din Redux Toolkit
const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Creăm store-ul - MODIFICĂ AICI
export const store = configureStore({
  reducer: persistedReducer, // Folosește persistedReducer în loc de { cart: cartReducer }
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

// Creăm persistorul
export const persistor = persistStore(store)

// Exportăm și un hook pentru obținerea store-ului în componente
export const useStore = () => store 