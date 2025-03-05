import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const newItem = {
        ...action.payload,
        file: undefined // Don't store the Blob in Redux
      }
      state.items.push(newItem)
      state.totalQuantity += newItem.quantity
      state.totalAmount += newItem.price * newItem.quantity
    },
    removeItem: (state, action) => {
      const index = action.payload
      const removedItem = state.items[index]
      state.items = state.items.filter((_, i) => i !== index)
      state.totalQuantity -= removedItem.quantity
      state.totalAmount -= removedItem.price * removedItem.quantity
    },
    updateQuantity: (state, action) => {
      const { index, quantity } = action.payload
      const item = state.items[index]
      const quantityDiff = quantity - item.quantity
      item.quantity = quantity
      state.totalQuantity += quantityDiff
      state.totalAmount += item.price * quantityDiff
    },
    clearCart: (state) => {
      state.items = []
      state.totalQuantity = 0
      state.totalAmount = 0
    },
    hydrateCart: (state, action) => {
      const { items, totalQuantity, totalAmount } = action.payload
      state.items = items
      state.totalQuantity = totalQuantity
      state.totalAmount = totalAmount
    }
  },
})

export const { addItem, removeItem, updateQuantity, clearCart, hydrateCart } = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectCartTotalQuantity = (state) => state.cart.totalQuantity
export const selectCartTotalAmount = (state) => state.cart.totalAmount

export default cartSlice.reducer 