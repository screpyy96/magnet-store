'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function OrderItem({ item, index, onQuantityChange, onRemove }) {
  const [imageSrc, setImageSrc] = useState('')
  const [hasError, setHasError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    // Reset error state when item changes
    setHasError(false)
    setImageLoaded(false)
    // Set initial image source
    if (item?.image || item?.fileData) {
      setImageSrc(item.image || item.fileData)
    } else {
      setImageSrc('') // Explicitly set to empty string
      setHasError(true)
    }
  }, [item])

  const handleImageError = (e) => {
    setHasError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  // If we have an error or no image, show placeholder
  if (hasError || !(item?.image || item?.fileData)) {
    return (
      <motion.div
        className="flex items-center py-4 border-t border-gray-200 first:border-t-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <div className="flex-grow">
          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500">Image not available</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">£{(item.price * item.quantity).toFixed(2)}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <button
              onClick={() => onQuantityChange(index, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="mx-3 text-sm font-medium w-8 text-center">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(index, item.quantity + 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
            >
              +
            </button>
          </div>
          
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="flex items-center py-4 border-t border-gray-200 first:border-t-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-4 relative">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
        {imageSrc && (
          <img
            src={imageSrc}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
      </div>
      
      <div className="flex-grow">
        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500">
          {item.custom_data && (() => {
            try {
              const customData = JSON.parse(item.custom_data);
              return `${customData.size || '5x5'}cm • ${customData.finish || 'Flexible'}`;
            } catch {
              return 'Custom magnet';
            }
          })()}
        </p>
        <p className="text-lg font-semibold text-gray-900 mt-1">£{(item.price * item.quantity).toFixed(2)}</p>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <button
            onClick={() => onQuantityChange(index, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="mx-3 text-sm font-medium w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => onQuantityChange(index, item.quantity + 1)}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            +
          </button>
        </div>
        
        <button
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
} 