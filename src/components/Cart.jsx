'use client'

import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { selectCartItems, selectCartTotalAmount, removeItem, updateQuantity, clearCart } from '@/store/slices/cartSlice'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { safeLocalStorage } from '@/utils/localStorage'

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
    showToast('Cart cleared', 'success')
  }

  // Smart Package Grouping Logic
  const groupItemsByPackage = (items) => {
    const packageGroups = {};
    
    items.forEach((item, index) => {
      try {
        const customData = JSON.parse(item.custom_data || '{}');
        const packageId = customData.packageId || '1';
        const packageName = customData.packageName || 'Individual Items';
        const packagePrice = customData.packagePrice || item.price;
        
        if (!packageGroups[packageId]) {
          packageGroups[packageId] = {
            packageId,
            packageName,
            packagePrice,
            items: [],
            totalCount: 0,
            totalPrice: 0
          };
        }
        
        packageGroups[packageId].items.push({ ...item, originalIndex: index });
        packageGroups[packageId].totalCount += item.quantity;
        packageGroups[packageId].totalPrice += item.price * item.quantity;
      } catch (e) {
        // Handle items without custom_data
        const packageId = 'single';
        if (!packageGroups[packageId]) {
          packageGroups[packageId] = {
            packageId: 'single',
            packageName: 'Individual Items',
            packagePrice: 0,
            items: [],
            totalCount: 0,
            totalPrice: 0
          };
        }
        packageGroups[packageId].items.push({ ...item, originalIndex: index });
        packageGroups[packageId].totalCount += item.quantity;
        packageGroups[packageId].totalPrice += item.price * item.quantity;
      }
    });

    return Object.values(packageGroups);
  };

  const packageGroups = groupItemsByPackage(items);

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
          {isClient && items.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {items.length}
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
                      {packageGroups.map((packageGroup) => (
                        <div key={packageGroup.packageId} className="space-y-3">
                          {/* Package Header for multi-item packages */}
                          {parseInt(packageGroup.packageId) > 1 && (
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-indigo-900">
                                      {packageGroup.packageName}
                                    </h4>
                                    <p className="text-xs text-indigo-600">
                                      {packageGroup.totalCount} magnets • £{packageGroup.totalPrice.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Package Savings */}
                                {(() => {
                                  const individualPrice = 5.00;
                                  const totalIndividualPrice = packageGroup.totalCount * individualPrice;
                                  const savings = totalIndividualPrice - packageGroup.totalPrice;
                                  
                                  if (savings > 0) {
                                    return (
                                      <div className="text-right">
                                        <div className="text-xs text-gray-500 line-through">
                                          £{totalIndividualPrice.toFixed(2)}
                                        </div>
                                        <div className="text-xs font-medium text-green-600">
                                          Save £{savings.toFixed(2)}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                              
                              {/* Progress bar for incomplete packages */}
                              <div className="mt-2 flex items-center space-x-2">
                                <div className="flex-1 bg-indigo-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(packageGroup.totalCount / parseInt(packageGroup.packageId)) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-indigo-600">
                                  {packageGroup.totalCount}/{packageGroup.packageId}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Individual Items */}
                          <div className="space-y-2">
                            {packageGroup.items.map((item) => (
                              <motion.div
                                key={item.originalIndex}
                                className="flex items-center space-x-3 bg-gray-50/80 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                              >
                                <div className="w-12 h-12 relative rounded-md overflow-hidden border border-gray-200 bg-white shrink-0">
                                  {(item.image || item.fileData) ? (
                                    <Image
                                      src={item.image || item.fileData}
                                      alt={item.name || "Product"}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                      onError={(e) => {
                                        e.target.src = "/placeholder-magnet.png";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-xs text-center p-1">
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-grow min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                                  <p className="text-xs text-gray-500">
                                    {(() => {
                                      try {
                                        const customData = JSON.parse(item.custom_data || '{}');
                                        return `${customData.size || '5x5'}cm • ${customData.finish || 'Flexible'}`;
                                      } catch {
                                        return 'Custom magnet';
                                      }
                                    })()}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center">
                                      <button
                                        onClick={() => handleDecrement(item.originalIndex, item.quantity)}
                                        className="w-6 h-6 rounded-l-md border border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                      >
                                        <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                      </button>
                                      <span className="w-8 h-6 border-y border-gray-300 text-center text-xs flex items-center justify-center bg-white">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => handleIncrement(item.originalIndex, item.quantity)}
                                        className="w-6 h-6 rounded-r-md border border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                      >
                                        <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                      </button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <p className="text-sm font-semibold whitespace-nowrap">£{(item.price * item.quantity).toFixed(2)}</p>
                                      <button
                                        onClick={() => handleRemove(item.originalIndex)}
                                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors"
                                      >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
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
                      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                      const totalIndividualPrice = totalItems * individualPrice;
                      const totalSavings = totalIndividualPrice - totalAmount;
                      
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
                      <span className="text-xl font-semibold text-gray-900">£{totalAmount.toFixed(2)}</span>
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