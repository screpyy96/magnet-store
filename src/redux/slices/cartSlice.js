addItem: (state, action) => {
  const newItem = action.payload;
  
  // Asigură-te că fiecare element are un id valid
  if (!newItem.id) {
    console.warn('Added cart item missing ID:', newItem);
    // Poți genera un ID dacă lipsește
    newItem.id = `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Restul logicii existente...
} 