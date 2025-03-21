import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      if (existingItem) {
        existingItem.quantity++;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
      } else {
        state.items.push({
          ...newItem,
          image: newItem.image || null,
          fileData: newItem.fileData || newItem.image || null,
          quantity: 1,
          totalPrice: newItem.price
        });
      }
      
      state.totalQuantity++;
      state.totalAmount = state.items.reduce(
        (total, item) => total + (item.price * item.quantity),
        0
      );
    },
    
    removeItem(state, action) {
      const index = action.payload;
      if (index >= 0 && index < state.items.length) {
        const quantity = state.items[index].quantity || 1;
        state.totalQuantity -= quantity;
        state.totalAmount -= state.items[index].price * quantity;
        state.items.splice(index, 1);
      }
    },
    
    updateQuantity(state, action) {
      const { index, quantity } = action.payload;
      if (index >= 0 && index < state.items.length) {
        const item = state.items[index];
        const oldQuantity = item.quantity || 1;
        const quantityDiff = quantity - oldQuantity;
        
        item.quantity = quantity;
        state.totalQuantity += quantityDiff;
        state.totalAmount = state.items.reduce(
          (total, item) => total + (item.price * item.quantity),
          0
        );
      }
    },
    
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    }
  }
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;

// Adăugăm și selectori pentru a extrage starea mai ușor
export const selectCartItems = state => state.cart.items;
export const selectCartTotalAmount = state => state.cart.totalAmount;
export const selectCartTotalQuantity = state => state.cart.totalQuantity;

export default cartSlice.reducer; 