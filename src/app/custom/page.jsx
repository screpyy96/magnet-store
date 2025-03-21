'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { addItem, removeItem, updateQuantity, selectCartItems, clearCart } from '@/store/slices/cartSlice'
import ImageUploader from '@/components/custom/ImageUploader'
import OrderItem from '@/components/custom/OrderItem'
import OrderSummary from '@/components/custom/OrderSummary'
import ImageEditor from '@/components/custom/ImageEditor'
import { useToast } from '@/contexts/ToastContext'
import { uploadImage } from '@/utils/imageUpload'
import { v4 as uuidv4 } from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const MAGNET_PRICE = 9.99

export default function Custom() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [currentEditingFile, setCurrentEditingFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useToast()
  
  const dispatch = useDispatch()
  const orderItems = useSelector(selectCartItems) || []
  const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // More efficient auth check to prevent unnecessary loading screens
  useEffect(() => {
    // Only redirect if we're certain user isn't authenticated and we're done loading
    if (!authLoading && user === null) {
      // We know for sure user is not authenticated
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

  const handleCroppedImage = async (blob) => {
    try {
      console.log('Starting image upload, blob size:', blob.size);
      setIsLoading(true);
      
      // Verifică dacă blob-ul este valid
      if (!blob || blob.size === 0) {
        throw new Error('Invalid image data');
      }
      
      // Limitează dimensiunea imaginii (optional)
      if (blob.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('Image is too large (max 5MB)');
      }
      
      // Generează un nume de fișier unic
      const fileName = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.png`;
      const filePath = `custom_magnets/${fileName}`;
      
      // Obține un client Supabase
      const supabase = createClientComponentClient();
      
      // Verifică autentificarea (doar dacă este necesară)
      const { data: { session } } = await supabase.auth.getSession();
      console.log('User authenticated:', !!session);
      
      // Upload cu logging detaliat
      console.log('Uploading to path:', filePath);
      const { data, error } = await supabase.storage
        .from('magnet_images') // Asigură-te că acest bucket există
        .upload(filePath, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Supabase storage error:', error);
        throw error;
      }
      
      console.log('Upload successful:', data);
      
      // Construiește URL-ul public pentru imagine
      const imageUrl = supabase.storage
        .from('magnet_images') // Folosește bucket-ul corect, același ca la upload
        .getPublicUrl(filePath).data.publicUrl;
      
      console.log('Image public URL:', imageUrl);
      
      // ADAUGĂ PRODUSUL LA COȘ - AICI ESTE SCHIMBAREA PRINCIPALĂ
      const newItem = {
        id: uuidv4(),
        name: 'Custom Magnet',
        price: MAGNET_PRICE,
        quantity: 1,
        // Use image_url as the primary field to match order_items table structure
        image_url: imageUrl,
        // Keep these for backward compatibility
        image: imageUrl,
        fileData: imageUrl,
        // Store custom data properly
        custom_data: JSON.stringify({
          type: 'custom_magnet',
          originalFileName: currentEditingFile.name
        }),
        size: 'standard'
      };
      
      // Adaugă la coș
      dispatch(addItem(newItem));
      showToast('Magnet personalizat adăugat în coș!', 'success');
      
      // Continuă cu procesarea imaginii încărcate
      setCurrentEditingFile(null);
      
      return imageUrl;
    } catch (error) {
      console.error('Detailed upload error:', error);
      showToast('Eroare la încărcarea imaginii: ' + (error.message || 'Unknown error'), 'error');
      throw new Error('Failed to upload image: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

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

  // Simplified loading state logic - only show loading when really needed
  if (authLoading) {
    // Check for session with a safe client-side only check
    const quickLoadCheck = typeof window !== 'undefined' && 
      window.localStorage && 
      window.localStorage.getItem('supabase_session') !== null;
    
    if (!quickLoadCheck) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }
    // Otherwise render the page content immediately while auth state loads in background
  }

  // Only show this if we know for sure user is not logged in
  if (user === null && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Hero Section - Compact & Cohesive */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-50 to-blue-50 border-b border-pink-100">
        {/* Subtle pattern background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D8B4FE' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-1/4 -mt-10 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-1/4 -mb-10 w-40 h-40 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 right-1/3 -mt-10 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="text-center md:text-left">
              <div className="inline-block mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-200 shadow-sm">
                  <span className="mr-1">✨</span> Custom Design
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                Create Your Own <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-400">Sweet Magnets</span>
              </h1>
              
              <p className="text-base md:text-lg text-gray-600 mb-6 max-w-lg">
                Transform your favorite photos into beautiful fridge magnets. Perfect for preserving memories or giving as thoughtful gifts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center">
                <button
                  onClick={() => document.querySelector('input[type="file"]')?.click()}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full shadow-md bg-gradient-to-r from-pink-400 to-amber-400 text-white hover:from-pink-500 hover:to-amber-500 transition duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <svg className="mr-2 -ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"></path>
                  </svg>
                  Upload Your Photo
                </button>
                
                
              </div>
            </div>
            
            {/* Visual Element */}
            <div className="hidden md:block relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 p-2">
                <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-pink-50">
                  {/* Fridge background with magnets */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="w-full h-full relative">
                      {/* Fridge handle */}
                      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-3 h-32 bg-gray-300 rounded-r"></div>
                      
                      {/* Magnets */}
                      <div className="absolute top-[15%] left-[20%] w-24 h-24 rounded-lg shadow-lg transform rotate-6 bg-white p-1">
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 rounded overflow-hidden flex items-center justify-center">
                          <div className="text-pink-600 font-bold">Family</div>
                        </div>
                      </div>
                      
                      <div className="absolute top-[25%] right-[25%] w-28 h-28 rounded-lg shadow-lg transform -rotate-3 bg-white p-1">
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded overflow-hidden flex items-center justify-center">
                          <div className="text-blue-600 font-bold">Vacation</div>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-[20%] left-[30%] w-32 h-32 rounded-lg shadow-lg transform rotate-12 bg-white p-1">
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 rounded overflow-hidden flex items-center justify-center">
                          <div className="text-amber-600 font-bold">Love</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-200 rounded-full opacity-30 blur-xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-36 h-36 bg-pink-200 rounded-full opacity-30 blur-xl"></div>
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
        {orderItems.length > 0 ? (
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
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">No products added yet. Upload an image to create a custom magnet.</p>
            </div>
          </div>
        )}

        {/* Order Summary - Mereu vizibil */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <OrderSummary
              totalPrice={totalPrice}
              onSubmit={() => router.push('/checkout')}
              isLoading={isLoading}
              disabled={orderItems.length === 0}
            />
          </div>
        </div>
      </div>

      {currentEditingFile && (
        <ImageEditor
          file={currentEditingFile}
          onSave={handleCroppedImage}
          onCancel={() => setCurrentEditingFile(null)}
        />
      )}
    </div>
  )
} 