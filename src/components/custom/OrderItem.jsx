'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function OrderItem({ item, index, onQuantityChange, onRemove }) {
  // Remove unused functions
  // const handleIncrement = () => {
  //   onQuantityChange(index, item.quantity + 1)
  // }

  // const handleDecrement = () => {
  //   if (item.quantity <= 1) {
  //     onRemove(index)
  //   } else {
  //     onQuantityChange(index, item.quantity - 1)
  //   }
  // }

  return (
    <motion.div
      className="flex items-center py-4 border-t border-gray-200 first:border-t-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      {/* Imagine produs */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 mr-4 relative border border-gray-200 rounded-md overflow-hidden flex-shrink-0">
        {(item.image || item.fileData) ? (
          <Image 
            src={item.image || item.fileData} 
            alt={item.name || "Magnet personalizat"} 
            fill
            sizes="(max-width: 640px) 80px, 96px"
            className="object-cover"
            onError={(e) => {
              console.error("Error loading image:", e);
              e.target.src = "/placeholder-magnet.png"; // Imaginea de fallback
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-xs text-center p-2">
            Magnet preview
          </div>
        )}
      </div>
      
      {/* Informații produs */}
      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cantitate și preț */}
        <div className="flex justify-between items-center mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <div className="flex items-center border rounded-md w-32">
              <button
                onClick={() => onQuantityChange(index, Math.max(1, item.quantity - 1))}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                −
              </button>
              <span className="flex-1 text-center">{item.quantity}</span>
              <button
                onClick={() => onQuantityChange(index, item.quantity + 1)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                +
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700 mb-1">Price</p>
            <p className="text-base font-bold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 