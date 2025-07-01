'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { addItem, removeItem, updateQuantity, selectCartItems, clearCart } from '@/store/slices/cartSlice'
import ImageUploader from '@/components/custom/ImageUploader'

import ImageEditor from '@/components/custom/ImageEditor'
import MagnetPreview from '@/components/custom/MagnetPreview'
import ProductOptions from '@/components/custom/ProductOptions'
import ProductDetails from '@/components/custom/ProductDetails'
import DeliveryInfo from '@/components/custom/DeliveryInfo'
import { useToast } from '@/contexts/ToastContext'

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showToast } = useToast();
  
  const dispatch = useDispatch();
  const orderItems = useSelector(selectCartItems) || [];
  const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Get uploaded images directly from Redux store - SAME logic as Cart component
  const uploadedImages = orderItems
    .filter(item => {
      try {
        return item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet';
      } catch {
        return false;
      }
    })
    .map((item, index) => {
      console.log(`🔍 Processing cart item ${index + 1}:`, {
        id: item.id,
        name: item.name,
        hasImage: !!item.image,
        hasFileData: !!item.fileData,
        hasImageUrl: !!item.image_url,
        imageStart: item.image?.substring(0, 100) || 'No image',
        fileDataStart: item.fileData?.substring(0, 100) || 'No fileData'
      });
      
      // Use EXACT same logic as Cart component
      const imageUrl = item.image || item.fileData;
      
      console.log(`📸 Final image URL for ${item.name}:`, {
        selected: imageUrl ? 'Found' : 'Missing',
        urlStart: imageUrl?.substring(0, 100) || 'No URL',
        isBase64: !!(imageUrl && imageUrl.startsWith('data:'))
      });
      
      return {
        id: item.id,
        url: imageUrl,
        name: item.name || `Image ${index + 1}`
      };
    });

  console.log('🎯 Final uploadedImages array:', uploadedImages.map(img => ({
    id: img.id,
    name: img.name,
    hasUrl: !!img.url,
    urlType: img.url?.startsWith('data:') ? 'base64' : img.url ? 'other' : 'none'
  })));

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

    // Set current image from most recent cart item if not already set
    if (!currentImage && uploadedImages.length > 0) {
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
        
        const currentImageUrl = mostRecent.image || mostRecent.fileData || mostRecent.image_url;
        if (currentImageUrl) {
          setCurrentImage(currentImageUrl);
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
          const pricePerMagnet = pkg.pricePerUnit || pkg.price;
          
          const newItem = {
            id: `custom-${Date.now()}-${index}`,
            name: `Custom Magnet ${index + 1} (${pkg.name})`,
            price: pricePerMagnet, // Use price per unit
            quantity: 1,
            image_url: imageUrl,
            image: imageUrl,
            fileData: imageUrl,
            custom_data: JSON.stringify({
              type: 'custom_magnet',
              packageId: pkg.id,
              packageName: pkg.name,
              packagePrice: pkg.price,
              pricePerUnit: pricePerMagnet,
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
  }, [isClient, router, dispatch, selectedSize, selectedFinish, orderItems, currentImage, uploadedImages]);

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

      // Check if we can add more images to the current package
      const currentPackageSize = parseInt(selectedPackage?.id || '1');
      const currentUploadCount = uploadedImages.length;
      const availableSlots = currentPackageSize - currentUploadCount;

      if (files.length > availableSlots) {
        throw new Error(`You can only upload ${availableSlots} more image(s) for the ${selectedPackage.name} package`);
      }

      // Validate all files
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`"${file.name}" is not an image file. Please upload only image files.`);
        }
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`"${file.name}" is too large. Maximum file size is 20MB.`);
        }
      }

      // If single file, edit it. If multiple files, process them directly
      if (files.length === 1) {
        setCurrentEditingFile(files[0]);
      } else {
        processMultipleFiles(files);
      }
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    }
  }

  const processMultipleFiles = async (files) => {
    setIsLoading(true);
    const newImages = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(((i + 1) / files.length) * 100);
        
        showToast(`Processing image ${i + 1} of ${files.length}...`, 'info');
        
        // Convert file to blob for processing
        const blob = new Blob([file], { type: file.type });
        const processedImage = await processImageToCart(blob, `Image ${uploadedImages.length + i + 1}`);
        newImages.push(processedImage);
      }
      
      showToast(`Successfully added ${files.length} images to your package!`, 'success');
      setUploadProgress(0);
    } catch (error) {
      showToast('Error processing images: ' + error.message, 'error');
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  }

  const processImageToCart = async (blob, imageName) => {
    try {
      // Create both full quality and thumbnail versions
      const [fullQualityBase64, thumbnailBase64] = await Promise.all([
        blobToBase64(blob, 0.95), // Full quality for upload
        createThumbnail(blob, 200, 0.7) // Small thumbnail for preview/localStorage
      ]);
      
      // Save to localStorage for later upload during checkout
      const imageData = {
        fullBlob: fullQualityBase64, // Full quality for upload
        thumbnail: thumbnailBase64, // Small for preview
        timestamp: Date.now(),
        size: selectedSize,
        finish: selectedFinish,
        name: imageName
      };
      
      // Get existing images from localStorage
      const existingImages = safeLocalStorage.getJSON('customMagnetImages') || [];
      existingImages.push(imageData);
      safeLocalStorage.setJSON('customMagnetImages', existingImages);
      
      // Calculate correct price per magnet for the selected package
      const pricePerMagnet = selectedPackage.pricePerUnit || selectedPackage.price;
      
      // Add single magnet to cart with thumbnail
      const magnetItem = {
        id: `magnet-${Date.now()}-${Math.random()}`,
        name: `${imageName} (${selectedSize}cm)`,
        price: pricePerMagnet, // Use price per unit, not total package price
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
          packageName: selectedPackage.name,
          packagePrice: selectedPackage.price,
          pricePerUnit: pricePerMagnet
        })
      };
      
      dispatch(addItem(magnetItem));
      
      // uploadedImages will update automatically via Redux selector
      
      // Set current image to the last uploaded one
      setCurrentImage(thumbnailBase64);
      
      return imageData;
    } catch (error) {
      throw new Error('Failed to process ' + imageName + ': ' + error.message);
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
      // Calculate correct price per magnet for the selected package
      const pricePerMagnet = selectedPackage.pricePerUnit || selectedPackage.price;
      
      const magnetItem = {
        id: `magnet-${Date.now()}`,
        name: `Custom Photo Magnet (${selectedSize}cm)`,
        price: pricePerMagnet, // Use price per unit, not total package price
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
          packageName: selectedPackage.name,
          packagePrice: selectedPackage.price,
          pricePerUnit: pricePerMagnet
        })
      };
      
      dispatch(addItem(magnetItem));
      showToast('Magnet added to cart!', 'success');
      
      // uploadedImages will update automatically via Redux selector
      
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

              {/* Upload Progress Bar */}
              {uploadProgress > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing images...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Package Progress */}
              {selectedPackage && parseInt(selectedPackage.id) > 1 && (
                <div className="mt-4 bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-indigo-900">Package Progress</h3>
                    <span className="text-xs text-indigo-600">
                      {orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length} / {selectedPackage.id} images
                    </span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length / parseInt(selectedPackage.id)) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-indigo-700">
                    {parseInt(selectedPackage.id) - orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length > 0 
                      ? `${parseInt(selectedPackage.id) - orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length} more images needed`
                      : 'Package complete! All images uploaded.'
                    }
                  </p>
                </div>
              )}

             
            </div>

            Upload Area
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Your Photo</h3>
              
              {!currentEditingFile && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <ImageUploader 
                      onFileChange={handleFileChange} 
                      maxFiles={selectedPackage ? Math.max(1, parseInt(selectedPackage.id) - orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length) : 1}
                    />
                    
                    {/* Upload Help Text */}
                    {selectedPackage && parseInt(selectedPackage.id) > 1 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              How to upload {selectedPackage.id} images:
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <ul className="list-disc list-inside space-y-1">
                                <li><strong>Option 1:</strong> Select {Math.max(1, parseInt(selectedPackage.id) - uploadedImages.length)} images at once</li>
                                <li><strong>Option 2:</strong> Upload one image at a time</li>
                                <li>Each image will be added to your package automatically</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedPackage && parseInt(selectedPackage.id) > 1 && uploadedImages.length < parseInt(selectedPackage.id) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            More images needed
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              You need to upload {parseInt(selectedPackage.id) - uploadedImages.length} more image(s) to complete your {selectedPackage.name} package.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPackage && parseInt(selectedPackage.id) > 1 && uploadedImages.length >= parseInt(selectedPackage.id) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Package Complete!
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>
                              Your {selectedPackage.name} is ready! All {selectedPackage.id} images have been uploaded.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentEditingFile && (
                <ImageEditor
                  file={currentEditingFile}
                  onImageCropped={handleCroppedImage}
                  onCancel={() => {
                    setCurrentEditingFile(null);
                    setError(null);
                  }}
                  isLoading={isLoading}
                />
              )}

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

              {/* Smart Action Buttons */}
              <div className="space-y-3">
                {/* Upload Images Button */}
                <button
                  onClick={() => document.querySelector('input[type="file"]')?.click()}
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : (
                    orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length === 0 
                      ? `Upload ${selectedPackage?.id === '1' ? 'Image' : `${selectedPackage?.id} Images`}`
                      : orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length < parseInt(selectedPackage?.id || '1')
                        ? `Upload ${parseInt(selectedPackage?.id || '1') - orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length} More Images`
                        : 'Upload More Images'
                  )}
                </button>

                {/* Package Completion Actions */}
                                 {parseInt(selectedPackage?.id || '1') > 1 && orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length > 0 && (
                   <div className="text-center">
                     {orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length < parseInt(selectedPackage?.id || '1') ? (
                       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                         <p className="text-sm text-yellow-800">
                           <strong>{parseInt(selectedPackage?.id || '1') - orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length} more images needed</strong> to complete your {selectedPackage?.name} package
                         </p>
                         <p className="text-xs text-yellow-600 mt-1">
                           You can upload them one by one or select multiple files at once
                         </p>
                       </div>
                     ) : (
                       <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                         <div className="flex items-center justify-center text-green-800 mb-2">
                           <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                           </svg>
                           <strong>Package Complete!</strong>
                         </div>
                         <p className="text-sm text-green-700">
                           All {selectedPackage?.id} images uploaded. Your {selectedPackage?.name} is ready for checkout!
                         </p>
                       </div>
                     )}
                   </div>
                 )}
              </div>
            </div>

            {/* Delivery Info */}
            <DeliveryInfo />

            {/* Smart Package-Aware Cart */}
            {orderItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Cart</h3>
                  <button 
                    onClick={() => {
                      dispatch(clearCart());
                      setCurrentImage(null);
                      // Clear localStorage as well
                      safeLocalStorage.removeItem('customMagnetImages');
                    }} 
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                
                {/* Smart Package Grouping */}
                {(() => {
                  // Group items by package
                  const packageGroups = {};
                  orderItems.forEach((item, index) => {
                    try {
                      const customData = JSON.parse(item.custom_data || '{}');
                      const packageId = customData.packageId || '1';
                      const packageName = customData.packageName || '1 Custom Magnet';
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

                  return Object.values(packageGroups).map((packageGroup) => (
                    <div key={packageGroup.packageId} className="mb-6 last:mb-0">
                      {/* Package Header */}
                      {parseInt(packageGroup.packageId) > 1 && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-4 border border-indigo-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-semibold text-indigo-900">
                                  {packageGroup.packageName} Package
                                </h4>
                                <p className="text-sm text-indigo-600">
                                  {packageGroup.totalCount} magnets • £{packageGroup.totalPrice.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Package Savings */}
                            {(() => {
                              const individualPrice = 5.00; // Single magnet price
                              const totalIndividualPrice = packageGroup.totalCount * individualPrice;
                              const savings = totalIndividualPrice - packageGroup.totalPrice;
                              
                              if (savings > 0) {
                                return (
                                  <div className="text-right">
                                    <div className="text-sm text-gray-500 line-through">
                                      £{totalIndividualPrice.toFixed(2)}
                                    </div>
                                    <div className="text-sm font-medium text-green-600">
                                      Save £{savings.toFixed(2)}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          
                          {/* Package Completion Status */}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-indigo-200 rounded-full h-2 max-w-32">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(packageGroup.totalCount / parseInt(packageGroup.packageId)) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-indigo-600 whitespace-nowrap">
                                {packageGroup.totalCount}/{packageGroup.packageId} complete
                              </span>
                            </div>
                            
                            {packageGroup.totalCount >= parseInt(packageGroup.packageId) && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Complete
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Individual Items in Package */}
                      <div className="space-y-3">
                        {packageGroup.items.map((item) => (
                          <motion.div
                            key={item.originalIndex}
                            className="flex items-center py-3 px-4 bg-gray-50 rounded-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg overflow-hidden mr-3 border border-gray-200">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            
                            <div className="flex-grow">
                              <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
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
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                £{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                <button
                                  onClick={() => handleQuantityChange(item.originalIndex, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                                >
                                  -
                                </button>
                                <span className="mx-2 text-sm font-medium w-6 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.originalIndex, item.quantity + 1)}
                                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs"
                                >
                                  +
                                </button>
                              </div>
                              
                              <button
                                onClick={() => handleRemoveItem(item.originalIndex)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Package Actions */}
                      {parseInt(packageGroup.packageId) > 1 && (
                        <div className="mt-4 flex justify-between items-center">
                          <button
                            onClick={() => {
                              // Remove all items from this package
                              packageGroup.items.forEach(item => {
                                handleRemoveItem(item.originalIndex);
                              });
                              showToast(`Removed ${packageGroup.packageName} package from cart`, 'success');
                            }}
                            className="text-sm text-red-500 hover:text-red-700 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove Package
                          </button>
                          
                          {packageGroup.totalCount < parseInt(packageGroup.packageId) && (
                            <span className="text-sm text-amber-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {parseInt(packageGroup.packageId) - packageGroup.totalCount} more needed
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ));
                })()}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">£{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Total Savings Display */}
                  {(() => {
                    const individualPrice = 5.00;
                    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
                    const totalIndividualPrice = totalItems * individualPrice;
                    const totalSavings = totalIndividualPrice - totalPrice;
                    
                    if (totalSavings > 0) {
                      return (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-800">You save with packages:</span>
                            <span className="font-semibold text-green-800">£{totalSavings.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
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