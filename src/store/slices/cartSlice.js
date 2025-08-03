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
      console.log('Redux addItem received:', {
        id: newItem.id,
        name: newItem.name,
        price: newItem.price,
        totalPrice: newItem.totalPrice,
        priceType: typeof newItem.price,
        totalPriceType: typeof newItem.totalPrice,
        custom_data: newItem.custom_data
      });
      const customData = newItem.custom_data ? JSON.parse(newItem.custom_data) : {};
      
      // Check if this is a custom magnet package (new format) or old format
      if (customData.type === 'custom_magnet_package' || customData.isPackage === true) {
        console.log('Processing package item:', {
          newItemPrice: newItem.price,
          newItemPriceType: typeof newItem.price,
          newItemTotalPrice: newItem.totalPrice,
          newItemTotalPriceType: typeof newItem.totalPrice
        });
        
        // For packages, always replace existing package of same type
        const packageId = customData.packageId || customData.packageSize;
        const existingPackageIndex = state.items.findIndex(item => {
          try {
            const itemData = item.custom_data ? JSON.parse(item.custom_data) : {};
            const itemPackageId = itemData.packageId || itemData.packageSize;
            return (itemData.type === 'custom_magnet_package' || itemData.isPackage === true) && 
                   itemPackageId === packageId;
          } catch {
            return false;
          }
        });
        
        if (existingPackageIndex >= 0) {
          // Replace existing package
          const finalPrice = parseFloat(newItem.price) || 0;
          console.log('Replacing existing package with price:', finalPrice);
          state.items[existingPackageIndex] = {
            ...newItem,
            price: finalPrice,
            quantity: 1,
            totalPrice: finalPrice
          };
        } else {
          // Add new package
          const finalPrice = parseFloat(newItem.price) || 0;
          console.log('Adding new package with price:', finalPrice);
          state.items.push({
            ...newItem,
            price: finalPrice,
            quantity: 1,
            totalPrice: finalPrice
          });
        }
      } else if (customData.type === 'custom_magnet') {
        // Single custom magnets - always add as separate items
        state.items.push({
          ...newItem,
          quantity: 1,
          totalPrice: parseFloat(newItem.price) || 0
        });
      } else {
        // Regular products - check if already exists
        const existingItemIndex = state.items.findIndex(item => 
          item.id === newItem.id && 
          (!item.custom_data || !item.custom_data.includes('custom_magnet'))
        );
        
        if (existingItemIndex >= 0) {
          // Update quantity for existing item
          state.items[existingItemIndex].quantity += 1;
          state.items[existingItemIndex].totalPrice = 
            state.items[existingItemIndex].price * state.items[existingItemIndex].quantity;
        } else {
          // Add new item
          state.items.push({
            ...newItem,
            quantity: 1,
            totalPrice: parseFloat(newItem.price) || 0
          });
        }
      }
      
      // Recalculate totals
      state.totalQuantity = state.items.reduce((total, item) => total + (item.quantity || 1), 0);
      state.totalAmount = state.items.reduce((total, item) => {
        const price = parseFloat(item.totalPrice || item.price || 0);
        return total + price;
      }, 0);
      
      console.log('Redux totals recalculated:', {
        totalQuantity: state.totalQuantity,
        totalAmount: state.totalAmount,
        items: state.items.map(item => ({
          id: item.id,
          price: item.price,
          totalPrice: item.totalPrice,
          quantity: item.quantity
        }))
      });
    },
    
    removeItem(state, action) {
      const index = action.payload;
      if (index >= 0 && index < state.items.length) {
        state.items.splice(index, 1);
        
        // Recalculate totals
        state.totalQuantity = state.items.reduce((total, item) => total + (item.quantity || 1), 0);
        state.totalAmount = state.items.reduce((total, item) => {
          const price = parseFloat(item.totalPrice || item.price || 0);
          return total + price;
        }, 0);
      }
    },
    
    updateQuantity(state, action) {
      const { index, quantity } = action.payload;
      if (index >= 0 && index < state.items.length && quantity > 0) {
        const item = state.items[index];
        const oldTotal = item.totalPrice;
        
        item.quantity = quantity;
        item.totalPrice = item.price * quantity;
        
        // Update totals
        state.totalQuantity = state.items.reduce((total, item) => total + (item.quantity || 1), 0);
        state.totalAmount = state.items.reduce((total, item) => {
          const price = parseFloat(item.totalPrice || item.price || 0);
          return total + price;
        }, 0);
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

// Selectors
export const selectCartItems = state => state.cart.items;
export const selectCartTotalAmount = state => state.cart.totalAmount;
export const selectCartTotalQuantity = state => state.cart.totalQuantity;

// Selector to get package items
export const selectPackageItems = state => 
  state.cart.items.filter(item => {
    try {
      const customData = item.custom_data ? JSON.parse(item.custom_data) : {};
      return customData.type === 'custom_magnet_package';
    } catch {
      return false;
    }
  });

// Selector to get single magnet items
export const selectSingleMagnetItems = state =>
  state.cart.items.filter(item => {
    try {
      const customData = item.custom_data ? JSON.parse(item.custom_data) : {};
      return customData.type === 'custom_magnet';
    } catch {
      return false;
    }
  });

export default cartSlice.reducer;