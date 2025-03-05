'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function OrderItem({ item, index, onQuantityChange, onRemove }) {
  // Use fileData directly since we're not storing the Blob in Redux
  const imageUrl = item.fileData

  const handleIncrement = () => {
    onQuantityChange(index, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(index, item.quantity - 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Image */}
        <div className="w-full sm:w-24 h-48 sm:h-24 relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={imageUrl}
            alt="Magnet preview"
            className="w-full h-full object-contain sm:object-cover"
          />
        </div>

        {/* Controls */}
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center sm:text-left">
                Quantity
              </label>
              <div className="flex items-center justify-center sm:justify-start">
                <button
                  onClick={handleDecrement}
                  className="w-10 h-10 rounded-l-md border border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onQuantityChange(index, parseInt(e.target.value) || 1)}
                  className="w-16 h-10 border-y border-gray-300 text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={handleIncrement}
                  className="w-10 h-10 rounded-r-md border border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-gray-700 mb-1">Price</p>
              <p className="text-lg font-semibold">£{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(index)}
          className="absolute top-3 right-3 text-red-600 hover:text-red-800 transition-colors bg-white rounded-full p-2 hover:bg-red-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
} 