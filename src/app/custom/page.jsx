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
import { useToast } from '@/contexts/ToastContext'

const MAGNET_PRICE = 9.99

export default function Custom() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [currentEditingFile, setCurrentEditingFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useToast()
  
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
    try {
      setError(null)
      const files = Array.from(e.target.files)
      
      if (files.length === 0) {
        throw new Error('Please select an image to upload')
      }

      const file = files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload only image files')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB')
      }

      setCurrentEditingFile(file)
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    }
  }

  const handleCroppedImage = async (croppedBlob) => {
    try {
      setIsLoading(true)
      setError(null)

      // Convert Blob to base64 for storage
      const reader = new FileReader()
      const base64Data = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Failed to process image'))
        reader.readAsDataURL(croppedBlob)
      })

      const newOrderItem = {
        fileData: base64Data,
        quantity: 1,
        price: MAGNET_PRICE
      }

      dispatch(addItem(newOrderItem))
      showToast('Magnet added to cart', 'success')
      setCurrentEditingFile(null)
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = (index, value) => {
    try {
      setError(null)
      const newQuantity = parseInt(value)
      if (newQuantity < 1) {
        throw new Error('Quantity must be at least 1')
      }
      if (newQuantity > 100) {
        throw new Error('Maximum quantity is 100')
      }
      dispatch(updateQuantity({ index, quantity: newQuantity }))
      showToast('Quantity updated successfully', 'success')
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    }
  }

  const handleRemoveItem = (index) => {
    try {
      setError(null)
      dispatch(removeItem(index))
      showToast('Magnet removed from cart', 'success')
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    }
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
    <>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6 mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 md:p-12">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Create Your Custom Magnets
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Transform your favorite photos into beautiful square fridge magnets.
              <span className="block mt-2 text-white font-medium">
                Each magnet costs £{MAGNET_PRICE}
              </span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-purple-100 p-8 shadow-xl">
          <ImageUploader onFileChange={handleFileChange} />
        </div>

        {orderItems.length > 0 && (
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-purple-100 p-8 shadow-xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">Your Order</h2>
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

      {currentEditingFile && (
        <ImageEditor
          file={currentEditingFile}
          onSave={handleCroppedImage}
          onCancel={() => setCurrentEditingFile(null)}
        />
      )}
    </>
  )
} 