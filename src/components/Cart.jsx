'use client'

import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { selectCartItems, selectCartTotalAmount, removeItem, updateQuantity, clearCart } from '@/store/slices/cartSlice'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { safeLocalStorage, getCartItemImage } from '@/utils/localStorage'

export default function Cart() {
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const items = useSelector(selectCartItems)
  const totalAmount = useSelector(selectCartTotalAmount)
  const dispatch = useDispatch()
  const cartRef = useRef(null)
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCheckout = () => {
    setIsOpen(false)
    router.push('/checkout')
  }

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return
    dispatch(updateQuantity({ index, quantity: parseInt(newQuantity) }))
    showToast('Quantity updated successfully', 'success')
  }

  const handleIncrement = (index, quantity) => {
    dispatch(updateQuantity({ index, quantity: quantity + 1 }))
    showToast('Quantity increased', 'success')
  }

  const handleDecrement = (index, quantity) => {
    if (quantity > 1) {
      dispatch(updateQuantity({ index, quantity: quantity - 1 }))
      showToast('Quantity decreased', 'success')
    }
  }

  const handleRemove = (index) => {
    dispatch(removeItem(index))
    showToast('Item removed from cart', 'success')
  }

  const handleClearAll = () => {
    dispatch(clearCart())
    safeLocalStorage.removeItem('customMagnetImages')
    safeLocalStorage.removeItem('persist:root')
    showToast('Cart cleared', 'success')
  }

  // Smart Package Grouping Logic
  const groupItemsByPackage = (items) => {
    const groupedItems = [];
    
    items.forEach((item, index) => {
      try {
        const customData = item.custom_data ? JSON.parse(item.custom_data) : {};
        
        if (customData.type === 'custom_magnet_package' || customData.isPackage === true) {
          // This is a package item
          const thumbnails = customData.thumbnails || item.images || [];
          const packageId = customData.packageId || customData.packageSize;
          const packageItem = {
            ...item,
            id: item.id,
            name: customData.packageName || item.name || 'Custom Magnet Package',
            price: item.price || 0,
            quantity: item.quantity || 1,
            totalPrice: item.totalPrice || item.price || 0,
            isPackage: true,
            packageId: packageId,
            packageSize: parseInt(packageId) || thumbnails.length,
            images: thumbnails,
            size: customData.size || '5x5',
            finish: customData.finish || 'flexible',
            originalIndex: index
          };
          groupedItems.push(packageItem);
        } else {
          // Single item or regular product
          const imageUrl = getCartItemImage(item);
          groupedItems.push({
            ...item,
            originalIndex: index,
            isPackage: false,
            images: imageUrl ? [imageUrl] : [],
            quantity: item.quantity || 1,
            totalPrice: item.totalPrice || item.price
          });
        }
      } catch (e) {
        console.error('Error processing cart item:', e);
        // Fallback for items that fail parsing
        groupedItems.push({
          ...item,
          originalIndex: index,
          isPackage: false,
          images: [],
          quantity: item.quantity || 1,
          totalPrice: item.totalPrice || item.price
        });
      }
    });
    
    return groupedItems;
  };

  const groupedItems = groupItemsByPackage(items);
  

  

  
  // Numărăm câte pachete avem în coș
  const packageCount = groupedItems.filter(item => item.isPackage).length;
  // Numărăm câte articole individuale avem în coș
  const singleItemCount = groupedItems.filter(item => !item.isPackage).length;
  // Totalul afișat va fi numărul de pachete + numărul de articole individuale
  const totalUniqueItems = packageCount + singleItemCount;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-50" ref={cartRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="h-6 w-6 text-gray-700 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {isClient && totalUniqueItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalUniqueItems}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 right-0 h-[calc(100vh-10rem)] w-full sm:absolute sm:w-[480px] sm:h-auto sm:top-full sm:mt-2 sm:right-0 bg-white shadow-2xl sm:rounded-xl border-l sm:border border-gray-200/50 overflow-hidden"
            >
              <div className="flex flex-col h-full max-h-[80vh]">
                <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
                  <div className="flex items-center space-x-2">
                    {items.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4">
                        <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 mb-2">Your cart is empty</p>
                      <p className="text-sm text-gray-400">Add some magnets to get started!</p>
                      <Link
                        href="/custom"
                        onClick={() => setIsOpen(false)}
                        className="inline-block mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      >
                        Start Creating
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {groupedItems.map((item, index) => (
                        <div key={item.id || `item-${index}`} className="space-y-3">
                          {/* Package Item */}
                          {item.isPackage ? (
                            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 border border-pink-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="p-2 bg-pink-100 rounded-lg">
                                    <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900">
                                      {item.name}
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                      {item.images.length} of {item.packageSize} magnets • {item.size}cm • {item.finish}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Remove button */}
                                <button
                                  onClick={() => handleRemove(item.originalIndex)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  aria-label="Remove package"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Package Images Grid */}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                {Array.from({ length: item.packageSize }).map((_, idx) => {
                                  const imageUrl = item.images[idx];
                                  return (
                                    <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                      {imageUrl ? (
                                        <img 
                                          src={imageUrl} 
                                          alt={`Magnet ${idx + 1}`} 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                          <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {/* Package Price and Progress */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {item.images.length < item.packageSize && (
                                    <div className="flex items-center space-x-1 text-xs text-amber-600">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                      </svg>
                                      <span>Add {item.packageSize - item.images.length} more images</span>
                                    </div>
                                  )}
                                  {item.images.length === item.packageSize && (
                                    <div className="flex items-center space-x-1 text-xs text-green-600">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span>Package complete</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                  £{(item.price || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Single Item */
                            <motion.div
                              className="flex items-center space-x-3 bg-gray-50/80 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              {/* Item image */}
                              <div className="relative w-16 h-16 bg-white rounded-md overflow-hidden border border-gray-200">
                                {item.images && item.images[0] ? (
                                  <Image
                                    src={item.images[0]}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              {/* Item details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {item.name || 'Custom Magnet'}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  £{item.price?.toFixed(2) || '0.00'}
                                  {item.quantity > 1 && ` × ${item.quantity}`}
                                </p>
                              </div>
                              
                              {/* Quantity controls for regular items */}
                              {!item.custom_data && (
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleDecrement(item.originalIndex, item.quantity)}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => handleIncrement(item.originalIndex, item.quantity)}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                              
                              {/* Remove button */}
                              <button
                                onClick={() => handleRemove(item.originalIndex)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                aria-label="Remove item"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
                    {/* Total Savings Display */}
                    {(() => {
                                            const individualPrice = 5.00;
                      let totalMagnets = 0;
                      
                 
                      
                      // Count actual magnets (for packages, count the package size)
                      items.forEach(item => {
                        try {
                          const customData = item.custom_data ? JSON.parse(item.custom_data) : {};
                          if (customData.type === 'custom_magnet_package' || customData.isPackage === true) {
                            const packageId = customData.packageId || customData.packageSize;
                            const magnetsInPackage = parseInt(packageId) || 0;
                            totalMagnets += magnetsInPackage;
                            console.log(`Package ${item.id}: ${magnetsInPackage} magnets`);
                          } else {
                            totalMagnets += item.quantity || 1;
                            console.log(`Single item ${item.id}: ${item.quantity || 1} magnets`);
                          }
                        } catch {
                          totalMagnets += item.quantity || 1;
                          console.log(`Fallback item ${item.id}: ${item.quantity || 1} magnets`);
                        }
                      });
                      
                      const totalIndividualPrice = totalMagnets * individualPrice;
                      const totalSavings = totalIndividualPrice - (isNaN(totalAmount) ? 0 : totalAmount || 0);
                      
                      console.log('Savings calculation:', {
                        totalMagnets,
                        totalIndividualPrice,
                        totalAmount,
                        totalSavings
                      });
                      
                      if (totalSavings > 0) {
                        return (
                          <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-green-800">Package savings:</span>
                              <span className="text-sm font-semibold text-green-800">£{totalSavings.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-xl font-semibold text-gray-900">£{(isNaN(totalAmount) ? 0 : totalAmount || 0).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Checkout ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
} 