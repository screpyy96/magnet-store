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
import MagnetPreview from '@/components/custom/MagnetPreview'
import ProductOptions from '@/components/custom/ProductOptions'
import ProductDetails from '@/components/custom/ProductDetails'
import DeliveryInfo from '@/components/custom/DeliveryInfo'
import { useToast } from '@/contexts/ToastContext'
import { v4 as uuidv4 } from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { safeLocalStorage } from '@/utils/localStorage'
// Storage functions will be used during checkout, not here

// Package configurations for bulk orders
const PACKAGES = [
  {
    id: '1',
    name: '1 Custom Magnet',
    price: 5,
    pricePerUnit: 5,
    description: 'Single magnet for testing or small gifts',
    tag: 'SINGLE',
    maxFiles: 1
  },
  {
    id: '6',
    name: '6 Custom Magnets',
    price: 17.00,
    pricePerUnit: 2.83,
    description: 'Perfect for small gifts or personal use',
    tag: 'BEST VALUE',
    maxFiles: 6
  },
  {
    id: '9',
    name: '9 Custom Magnets',
    price: 23.00,
    pricePerUnit: 2.55,
    description: 'Great for families and small collections',
    tag: 'POPULAR',
    maxFiles: 9
  },
  {
    id: '12',
    name: '12 Custom Magnets',
    price: 28.00,
    pricePerUnit: 2.33,
    description: 'Ideal for large families or multiple designs',
    tag: 'BEST SELLER',
    maxFiles: 12
  }
];

// Get package from URL or default to 1 magnet
const getInitialPackage = () => {
  if (typeof window === 'undefined') return PACKAGES[0];
  const params = new URLSearchParams(window.location.search);
  const pkgId = params.get('qty') || params.get('package') || '1';
  return PACKAGES.find(pkg => pkg.id === pkgId) || PACKAGES[0];
};

export default function Custom() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [currentEditingFile, setCurrentEditingFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedSize, setSelectedSize] = useState('5x5');
  const [selectedFinish, setSelectedFinish] = useState('flexible');
  const [isClient, setIsClient] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const { showToast } = useToast();
  
  const dispatch = useDispatch();
  const orderItems = useSelector(selectCartItems) || [];
  const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize selected package from URL or default
  useEffect(() => {
    const pkg = getInitialPackage();
    setSelectedPackage(pkg);
  }, []);

  // Handle client-side operations after mount
  useEffect(() => {
    if (!isClient) return;

    // Restore currentImage from the most recent cart item (after refresh)
    if (orderItems.length > 0 && !currentImage) {
      // Find the most recent custom magnet item
      const customMagnets = orderItems.filter(item => 
        item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet'
      );
      
      if (customMagnets.length > 0) {
        // Get the most recent one (assuming IDs contain timestamps)
        const mostRecent = customMagnets.reduce((latest, current) => {
          const latestTime = parseInt(latest.id.split('-')[1] || '0');
          const currentTime = parseInt(current.id.split('-')[1] || '0');
          return currentTime > latestTime ? current : latest;
        });
        
        if (mostRecent.image) {
          console.log('🔄 Restoring currentImage from most recent cart item');
          setCurrentImage(mostRecent.image);
        }
      }
    }

    // Check for existing order data in localStorage
    const orderData = safeLocalStorage.getJSON('customMagnetOrder');
    if (orderData) {
      const pkg = getInitialPackage();
      
      // If the package matches, add the images to the cart
      if (orderData.packageSize === parseInt(pkg.id)) {
        orderData.images.forEach((imageUrl, index) => {
          const newItem = {
            id: `custom-${Date.now()}-${index}`,
            name: `Custom Magnet ${index + 1} (${pkg.name})`,
            price: pkg.price,
            quantity: 1,
            image_url: imageUrl,
            image: imageUrl,
            fileData: imageUrl,
            custom_data: JSON.stringify({
              type: 'custom_magnet',
              packageId: pkg.id,
              packageName: pkg.name,
              size: selectedSize,
              finish: selectedFinish
            }),
            size: pkg.id
          };
          dispatch(addItem(newItem));
        });
        safeLocalStorage.removeItem('customMagnetOrder');
      }
    }
    
    // If we're on /custom-order, redirect to /custom with the same parameters
    if (window.location.pathname === '/custom-order') {
      const params = new URLSearchParams(window.location.search);
      router.replace(`/custom?${params.toString()}`);
    }
  }, [isClient, router, dispatch, selectedSize, selectedFinish, orderItems, currentImage]);

  // Update URL when package changes
  useEffect(() => {
    if (selectedPackage && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('qty', selectedPackage.id);
      window.history.pushState({}, '', url);
    }
  }, [selectedPackage]);

  // No longer redirecting non-logged-in users

  const handleFileChange = (e) => {
    try {
      setError(null);
      const files = Array.from(e.target.files);
      
      if (files.length === 0) {
        throw new Error('Please select an image to upload');
      }

      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload only image files');
      }

      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        throw new Error('Image size should be less than 20MB');
      }

      setCurrentEditingFile(file);
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    }
  }

  const handleCroppedImage = async (blob) => {
    try {
      setIsLoading(true);
      
      // Verify that the blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('Invalid image data');
      }
      
      // Create both full quality and thumbnail versions
      const [fullQualityBase64, thumbnailBase64] = await Promise.all([
        blobToBase64(blob, 0.95), // Full quality for upload
        createThumbnail(blob, 200, 0.7) // Small thumbnail for preview/localStorage
      ]);
      
      // Set current image for preview using thumbnail
      setCurrentImage(thumbnailBase64);
      
      // Save to localStorage for later upload during checkout
      const imageData = {
        fullBlob: fullQualityBase64, // Full quality for upload
        thumbnail: thumbnailBase64, // Small for preview
        timestamp: Date.now(),
        size: selectedSize,
        finish: selectedFinish
      };
      
      // Get existing images from localStorage
      const existingImages = safeLocalStorage.getJSON('customMagnetImages') || [];
      existingImages.push(imageData);
      safeLocalStorage.setJSON('customMagnetImages', existingImages);
      
      // Add single magnet to cart with thumbnail
      const magnetItem = {
        id: `magnet-${Date.now()}`,
        name: `Custom Photo Magnet (${selectedSize}cm)`,
        price: selectedPackage.price,
        quantity: 1,
        image_url: thumbnailBase64,
        image: thumbnailBase64,
        fileData: thumbnailBase64,
        localImageData: imageData, // Store both versions
        custom_data: JSON.stringify({
          type: 'custom_magnet',
          size: selectedSize,
          finish: selectedFinish,
          packageId: selectedPackage.id,
          packageName: selectedPackage.name
        })
      };
      
      dispatch(addItem(magnetItem));
      showToast('Magnet added to cart!', 'success');
      
      // Continue with the uploaded image processing
      setCurrentEditingFile(null);
      
      return thumbnailBase64;
    } catch (error) {
      showToast('Error processing image: ' + (error.message || 'Unknown error'), 'error');
      throw new Error('Failed to process image: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert blob to base64 with quality control
  const blobToBase64 = (blob, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Helper function to create thumbnail
  const createThumbnail = (blob, maxSize = 200, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate thumbnail size maintaining aspect ratio
        const size = Math.min(maxSize, img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        
        // Calculate crop area for square thumbnail
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;
        
        // Draw cropped and resized image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize,
          0, 0, size, size
        );
        
        // Convert to base64 with compression
        const thumbnailBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(thumbnailBase64);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
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

  // No auth required for custom page - guests can design magnets

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Magnets</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>Photo Magnet</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-900 font-medium">Design Your Own</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Design Area */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Preview</h2>
              <MagnetPreview 
                imageUrl={currentImage} 
                size={`${selectedSize}cm`}
                finish={selectedFinish}
              />
            </div>

            {/* Upload Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Your Photo</h3>
              <ImageUploader 
                onFileChange={handleFileChange} 
                maxFiles={1}
              />
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Product Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customize Your Magnet</h3>
              <ProductOptions
                selectedSize={selectedSize}
                selectedFinish={selectedFinish}
                onSizeChange={setSelectedSize}
                onFinishChange={setSelectedFinish}
              />
            </div>
          </div>

          {/* Right Column - Product Info & Cart */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Custom Photo Magnet</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-gray-900">£{selectedPackage?.price.toFixed(2)}</span>
                {selectedPackage?.id !== '1' && (
                  <span className="text-sm text-gray-500">
                    £{selectedPackage?.pricePerUnit.toFixed(2)} each
                  </span>
                )}
              </div>
              
              {/* Package Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  QUANTITY
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-3 border rounded-lg text-center transition-colors relative ${
                        selectedPackage?.id === pkg.id
                          ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {pkg.tag && (
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {pkg.tag}
                        </span>
                      )}
                      <div className="font-medium text-gray-900">{pkg.name}</div>
                      <div className="text-lg font-bold text-indigo-600">£{pkg.price.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{pkg.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'CREATE NOW'}
              </button>
            </div>

            {/* Delivery Info */}
            <DeliveryInfo />

            {/* Current Cart */}
            {orderItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Cart</h3>
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

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">£{totalPrice.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}

            {/* Product Details */}
            <ProductDetails />
          </div>
        </div>
      </div>

      {/* Image Editor Modal */}
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