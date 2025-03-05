'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { addItem, removeItem, updateQuantity, selectCartItems, clearCart } from '@/store/cartSlice'
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

      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        throw new Error('Image size should be less than 20MB')
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

      // Comprimă imaginea înainte de a o converti în base64
      const compressedBlob = await compressImage(croppedBlob, 800) // Maxim 800px lățime/înălțime

      // Convert Blob to base64 for storage
      const reader = new FileReader()
      const base64Data = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Failed to process image'))
        reader.readAsDataURL(compressedBlob)
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

  // Funcție pentru comprimarea imaginilor
  const compressImage = async (blob, maxSize) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculează noile dimensiuni păstrând aspect ratio
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convertește canvas în blob cu calitate redusă
        canvas.toBlob(
          (compressedBlob) => {
            if (!compressedBlob) {
              reject(new Error('Failed to compress image'))
              return
            }
            resolve(compressedBlob)
          },
          'image/jpeg',
          0.7 // Calitate 70%
        )
      }
      img.onerror = () => reject(new Error('Failed to load image for compression'))
      img.src = URL.createObjectURL(blob)
    })
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
      {/* Hero Section - Modern & Elegant */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800">
        {/* Animated particles/dots overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 20.83l2.83-2.83 1.41 1.41L1.41 22.24H0v-1.41zM0 3.07l2.83-2.83 1.41 1.41L1.41 4.48H0V3.07zm28.24 35.52l2.83-2.83 1.41 1.41-2.83 2.83h-1.41v-1.41zm0-17.76l2.83-2.83 1.41 1.41-2.83 2.83h-1.41v-1.41zm0-17.76l2.83-2.83 1.41 1.41-2.83 2.83h-1.41V3.07zM20 39.8l2.83-2.83 1.41 1.41L21.41 41H20v-1.2zm0-17.77l2.83-2.83 1.41 1.41-2.83 2.83H20v-1.41zm0-17.76l2.83-2.83 1.41 1.41-2.83 2.83H20V4.27z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '50px 50px',
            animation: 'slide 20s linear infinite'
          }}></div>
        </div>
        
        {/* Glowing orbs/blurs for depth */}
        <div className="absolute top-0 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob"></div>
        <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000"></div>
        
        <style jsx>{`
          @keyframes slide {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm">
            <span className="block">Transform Your Photos Into</span>
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-cyan-200">
              Stunning Magnets
            </span>
          </h1>
          
          <p className="mt-4 text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Create high-quality custom magnets from your favorite memories.
            Perfect for gifts, events, or decorating your home.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => document.querySelector('input[type="file"]')?.click()}
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full shadow-lg bg-white text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 transition duration-200 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-2 -ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"></path>
              </svg>
              Upload Your Photo
            </button>
            
            <div className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-indigo-800/40 backdrop-blur-sm border border-indigo-500/30 text-white">
              <span className="mr-2 text-indigo-200">Each magnet:</span>
              <span className="text-lg font-bold">£{MAGNET_PRICE}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - More Compact Layout */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
        
            <ImageUploader onFileChange={handleFileChange} />
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
          </div>
        </div>
        
        {/* Order Items */}
        {orderItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
                <button 
                  onClick={() => dispatch(clearCart())} 
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
              
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