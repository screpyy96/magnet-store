'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { addItem, removeItem, updateQuantity, selectCartItems } from '@/store/cartSlice'
import ImageUploader from '@/components/custom/ImageUploader'
import OrderItem from '@/components/custom/OrderItem'
import OrderSummary from '@/components/custom/OrderSummary'
import ImageEditor from '@/components/custom/ImageEditor'

const MAGNET_PRICE = 9.99

export default function Custom() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [currentEditingFile, setCurrentEditingFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const dispatch = useDispatch()
  const orderItems = useSelector(selectCartItems)
  const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Improved auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/custom')
    }
  }, [user, authLoading, router])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setCurrentEditingFile(files[0])
  }

  const handleCroppedImage = async (croppedBlob) => {
    // Convert Blob to base64 for storage
    const reader = new FileReader()
    const base64Data = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(croppedBlob)
    })

    const newOrderItem = {
      file: croppedBlob,
      fileData: base64Data,
      quantity: 1,
      price: MAGNET_PRICE
    }

    dispatch(addItem(newOrderItem))
    setCurrentEditingFile(null)
  }

  const handleQuantityChange = (index, value) => {
    const newQuantity = parseInt(value)
    if (newQuantity < 1) return
    dispatch(updateQuantity({ index, quantity: newQuantity }))
  }

  const handleRemoveItem = (index) => {
    dispatch(removeItem(index))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Custom Magnets</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your favorite photos into beautiful square fridge magnets. Each magnet costs £{MAGNET_PRICE}.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      
      <ImageUploader onFileChange={handleFileChange} />

      {currentEditingFile && (
        <ImageEditor
          file={currentEditingFile}
          onSave={handleCroppedImage}
          onCancel={() => setCurrentEditingFile(null)}
        />
      )}

      {orderItems.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
          <AnimatePresence>
            {orderItems.map((item, index) => (
              <OrderItem
                key={index}
                item={item}
                index={index}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </AnimatePresence>
          
          <OrderSummary
            totalPrice={totalPrice}
            onSubmit={() => router.push('/checkout')}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
} 