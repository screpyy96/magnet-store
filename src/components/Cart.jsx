'use client'

import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { selectCartItems, selectCartTotalAmount, removeItem, updateQuantity } from '@/store/cartSlice'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'

export default function Cart() {
  const [isOpen, setIsOpen] = useState(false)
  const items = useSelector(selectCartItems)
  const totalAmount = useSelector(selectCartTotalAmount)
  const dispatch = useDispatch()
  const cartRef = useRef(null)
  const { showToast } = useToast()
  const router = useRouter()

  // Close cart when clicking outside
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

  return (
    <>
      {/* Overlay */}
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
        {/* Cart Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="h-6 w-6 text-gray-700 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </button>

        {/* Cart Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 right-0 h-[calc(100vh-5rem)] w-full sm:absolute sm:w-[420px] sm:h-auto sm:top-full sm:mt-2 sm:right-0 bg-white shadow-2xl sm:rounded-xl border-l sm:border border-gray-200/50 overflow-hidden"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
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
                    </div>
                  ) : (
                    <div className="p-4 space-y-3 mb-32 sm:mb-0">
                      {items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 bg-gray-50/80 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-16 h-16 relative rounded-md overflow-hidden border border-gray-200 bg-white shrink-0">
                            <img
                              src={item.fileData}
                              alt="Product"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <button
                                  onClick={() => handleDecrement(index, item.quantity)}
                                  className="w-8 h-8 rounded-l-md border border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                                  className="w-12 h-8 border-y border-gray-300 text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  onClick={() => handleIncrement(index, item.quantity)}
                                  className="w-8 h-8 rounded-r-md border border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                              <div className="flex-shrink-0">
                                <p className="text-sm font-semibold whitespace-nowrap">£{(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(index)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-white absolute bottom-0 left-0 right-0 sm:relative">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-xl font-semibold text-gray-900">£{totalAmount.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
} 