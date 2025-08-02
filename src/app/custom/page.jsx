'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
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
  
  // Get uploaded images with restoration from localStorage
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
      
      // Try to get image from multiple sources
      let imageUrl = item.image || item.fileData || item.image_url;
      
      // If no image in Redux, try to restore from localStorage
      if (!imageUrl && item.custom_data) {
        try {
          const customData = JSON.parse(item.custom_data);
          if (customData.imageTimestamp) {
            const customImages = safeLocalStorage.getJSON('customMagnetImages') || [];
            const matchingImage = customImages.find(img => img.timestamp === customData.imageTimestamp);
            if (matchingImage) {
              imageUrl = matchingImage.thumbnail;
              console.log(`🔄 Restored image from localStorage for ${item.name}`);
            }
          }
        } catch (e) {
          console.warn('Failed to restore image from localStorage:', e);
        }
      }
      
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

  // Handle package selection
  const handlePackageSelect = useCallback((pkg) => {
    setSelectedPackage(prevPackage => {
      const previousPackage = prevPackage;
      
      // Clear existing items if changing package type
      if (previousPackage && pkg.id !== previousPackage.id) {
        // Only clear items that are part of the previous package
        const itemsToKeep = orderItems.filter(item => {
          try {
            const itemData = item.custom_data ? JSON.parse(item.custom_data) : null;
            // Keep items that are not part of any package or are single magnets
            return !itemData || itemData.packageId === '1' || itemData.packageId !== previousPackage.id;
          } catch (e) {
            return true;
          }
        });
        
        // Clear the cart and add back the items we want to keep
        dispatch(clearCart());
        itemsToKeep.forEach(item => {
          // Re-add the item with its original quantity
          dispatch(addItem({...item, quantity: item.quantity || 1}));
        });
        
        setCurrentImage(null);
      }
      
      return pkg;
    });
  }, [orderItems, dispatch]);

  // Initialize selected package from URL or default
  useEffect(() => {
    const pkg = getInitialPackage();
    setSelectedPackage(pkg);
  }, []);

  // Handle client-side operations after mount
  useEffect(() => {
    if (!isClient) return;

    // Restore images from localStorage if Redux store is empty
    if (uploadedImages.length === 0) {
      try {
        const customImages = safeLocalStorage.getJSON('customMagnetImages') || [];
        if (customImages.length > 0) {
          console.log('🔄 Restoring images from localStorage...');
          
          // Add each image back to cart
          customImages.forEach((imageData, index) => {
            const magnetItem = {
              id: `magnet-restored-${imageData.timestamp}`,
              name: `${imageData.name || `Image ${index + 1}`} (${imageData.size}cm)`,
              price: selectedPackage?.pricePerUnit || 5,
              quantity: 1,
              image_url: imageData.thumbnail,
              image: imageData.thumbnail,
              fileData: imageData.thumbnail,
              custom_data: JSON.stringify({
                type: 'custom_magnet',
                size: imageData.size,
                finish: imageData.finish,
                packageId: selectedPackage?.id || '1',
                packageName: selectedPackage?.name || '1 Custom Magnet',
                packagePrice: selectedPackage?.price || 5,
                pricePerUnit: selectedPackage?.pricePerUnit || 5,
                imageTimestamp: imageData.timestamp
              })
            };
            
            dispatch(addItem(magnetItem));
          });
          
          showToast(`Restored ${customImages.length} image(s) from your previous session`, 'success');
        }
      } catch (e) {
        console.warn('Failed to restore images from localStorage:', e);
      }
    }

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
        showToast('Your images have been imported. You can continue customizing your magnets!', 'success');
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
      
      // Try to save with automatic cleanup on quota errors
      const saveSuccess = safeLocalStorage.setJSON('customMagnetImages', existingImages);
      if (!saveSuccess) {
        showToast('Storage limit reached. Some older images were removed to make space.', 'warning');
      }
      
      // Calculate correct price per magnet for the selected package
      const pricePerMagnet = selectedPackage.pricePerUnit || selectedPackage.price;
      
      // Add single magnet to cart with minimal data (no large base64 images)
      const magnetItem = {
        id: `magnet-${Date.now()}-${Math.random()}`,
        name: `${imageName} (${selectedSize}cm)`,
        price: pricePerMagnet, // Use price per unit, not total package price
        quantity: 1,
        // Use data URLs only for display, not for storage
        image_url: thumbnailBase64,
        image: thumbnailBase64,
        // Reference to localStorage data instead of storing directly
        imageTimestamp: imageData.timestamp,
        custom_data: JSON.stringify({
          type: 'custom_magnet',
          size: selectedSize,
          finish: selectedFinish,
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          packagePrice: selectedPackage.price,
          pricePerUnit: pricePerMagnet,
          imageTimestamp: imageData.timestamp
        })
      };
      
      dispatch(addItem(magnetItem));
      
      // uploadedImages will update automatically via Redux selector
      
      // Set current image to the last uploaded one
      setCurrentImage(thumbnailBase64);
      
      return imageData;
    } catch (error) {
      const isStorageError = error.message && error.message.toLowerCase().includes('quota');
      if (isStorageError) {
        showToast('Storage full! Cleared old data to continue. Please try again.', 'warning');
        // Try to clear some space
        safeLocalStorage.removeItem('persist:root');
        throw new Error('Storage quota exceeded. Please try uploading again.');
      }
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
      
      // Try to save with automatic cleanup on quota errors
      const saveSuccess = safeLocalStorage.setJSON('customMagnetImages', existingImages);
      if (!saveSuccess) {
        showToast('Storage limit reached. Some older images were removed to make space.', 'warning');
      }
      
      // Add single magnet to cart with minimal data
      // Calculate correct price per magnet for the selected package
      const pricePerMagnet = selectedPackage.pricePerUnit || selectedPackage.price;
      
      const magnetItem = {
        id: `magnet-${Date.now()}`,
        name: `Custom Photo Magnet (${selectedSize}cm)`,
        price: pricePerMagnet, // Use price per unit, not total package price
        quantity: 1,
        // Use data URLs only for display, not for storage
        image_url: thumbnailBase64,
        image: thumbnailBase64,
        // Reference to localStorage data instead of storing directly
        imageTimestamp: imageData.timestamp,
        custom_data: JSON.stringify({
          type: 'custom_magnet',
          size: selectedSize,
          finish: selectedFinish,
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          packagePrice: selectedPackage.price,
          pricePerUnit: pricePerMagnet,
          imageTimestamp: imageData.timestamp
        })
      };
      
      dispatch(addItem(magnetItem));
      showToast('Magnet added to cart!', 'success');
      
      // uploadedImages will update automatically via Redux selector
      
      // Continue with the uploaded image processing
      setCurrentEditingFile(null);
      
      return thumbnailBase64;
    } catch (error) {
      const isStorageError = error.message && error.message.toLowerCase().includes('quota');
      if (isStorageError) {
        showToast('Storage full! Cleared old data to continue. Please try again.', 'warning');
        // Try to clear some space
        safeLocalStorage.removeItem('persist:root');
        setIsLoading(false);
        return;
      }
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
    <div className="bg-pink-50 min-h-screen">
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
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left column (on desktop): Product Info, Package, Customize, Delivery, Details */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            {/* Custom Photo Magnet - Title, Price, Package Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-200 p-6">
              <h1 className="text-2xl font-bold text-pink-900 mb-2">Custom Photo Magnet</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-pink-900">£{selectedPackage?.price.toFixed(2)}</span>
                {selectedPackage?.id !== '1' && (
                  <span className="text-sm text-pink-500">
                    £{selectedPackage?.pricePerUnit.toFixed(2)} each
                  </span>
                )}
              </div>
              {/* Package Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-pink-900 mb-3">
                  QUANTITY
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-3 border rounded-lg text-center transition-colors relative ${
                        selectedPackage?.id === pkg.id
                          ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500'
                          : 'border-pink-200 hover:border-pink-300'
                      }`}
                    >
                      {pkg.tag && (
                        <span className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                          {pkg.tag}
                        </span>
                      )}
                      <div className="font-medium text-pink-900">{pkg.name}</div>
                      <div className="text-lg font-bold text-pink-600">£{pkg.price.toFixed(2)}</div>
                      <div className="text-xs text-pink-500">{pkg.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Customize Your Magnet */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-200 p-6">
              <h3 className="text-lg font-medium text-pink-900 mb-4">Customize Your Magnet</h3>
              <ProductOptions
                selectedSize={selectedSize}
                selectedFinish={selectedFinish}
                onSizeChange={setSelectedSize}
                onFinishChange={setSelectedFinish}
              />
            </div>

            {/* Delivery Info */}
            <DeliveryInfo />

            {/* Product Details */}
            <ProductDetails />
          </div>

          {/* Right column (on desktop): Design Preview & Upload */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            {/* Design Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-200 p-6">
              <h2 className="text-xl font-semibold text-pink-900 mb-4">Design Preview</h2>
              <MagnetPreview 
                imageUrl={currentImage}
                images={uploadedImages}
                size={`${selectedSize}cm`}
                finish={selectedFinish}
                onThumbnailClick={(index) => {
                  const selectedImage = uploadedImages[index];
                  if (selectedImage && selectedImage.url) {
                    setCurrentImage(selectedImage.url);
                  }
                }}
              />
              {/* Upload Progress Bar */}
              {uploadProgress > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-pink-600">
                    <span>Processing images...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-pink-200 rounded-full h-2">
                    <div 
                      className="bg-pink-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {/* Package Progress */}
              {selectedPackage && parseInt(selectedPackage.id) > 1 && (
                <div className="mt-4 bg-pink-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-pink-900">Package Progress</h3>
                    <span className="text-xs text-pink-600">
                      {orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length} / {selectedPackage.id} images
                    </span>
                  </div>
                  <div className="w-full bg-pink-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-pink-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length / parseInt(selectedPackage.id)) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-pink-700">
                    {parseInt(selectedPackage.id) - orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length > 0 
                      ? `${parseInt(selectedPackage.id) - orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length} more images needed`
                      : '✅ All images uploaded! Click "Proceed to Checkout" below.'
                    }
                  </p>
                </div>
              )}
              
              {/* Checkout Button - Show when package is complete */}
              {selectedPackage && parseInt(selectedPackage.id) > 1 && 
               orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length >= parseInt(selectedPackage.id) && (
                <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <h3 className="text-sm font-medium text-green-900">Package Complete!</h3>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      ${selectedPackage.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mb-3">
                    All {selectedPackage.id} images uploaded successfully. Ready to proceed to checkout!
                  </p>
                                      <button
                      onClick={() => {
                        if (!user) {
                          showToast('Please log in to continue with your order', 'warning');
                          router.push('/login?redirect=/custom');
                          return;
                        }
                        router.push('/checkout');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    Proceed to Checkout
                  </button>
                </div>
              )}
              {/* Upload Area - Only show if package is not complete */}
              {(!selectedPackage || 
                orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length < parseInt(selectedPackage.id)) && (
                <div className="mt-6">
                  <h3 className="text-base font-medium text-pink-900 mb-2">Upload Your Images</h3>
                  <ImageUploader
                    onFileChange={handleFileChange}
                    maxFiles={selectedPackage?.maxFiles || 1}
                  />
                </div>
              )}
              
              {/* Package Complete Message */}
              {selectedPackage && 
               orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length >= parseInt(selectedPackage.id) && (
                <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-blue-700">
                      Upload disabled - Package is complete. You can still edit your images above.
                    </p>
                  </div>
                </div>
              )}
                
                {/* Checkout Button for Single Image Packages */}
                {selectedPackage && parseInt(selectedPackage.id) === 1 && 
                 orderItems.filter(item => item.custom_data && JSON.parse(item.custom_data).type === 'custom_magnet').length >= 1 && (
                  <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <h3 className="text-sm font-medium text-green-900">Image Uploaded!</h3>
                      </div>
                      <span className="text-xs text-green-600 font-medium">
                        ${selectedPackage.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mb-3">
                      Your custom magnet is ready! Proceed to checkout to complete your order.
                    </p>
                    <button
                      onClick={() => {
                        if (!user) {
                          showToast('Please log in to continue with your order', 'warning');
                          router.push('/login?redirect=/custom');
                          return;
                        }
                        router.push('/checkout');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </div>
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