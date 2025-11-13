'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { addItem, removeItem, selectCartItems } from '@/store/slices/cartSlice'
import { store } from '@/store/store'

import ImageEditor from '@/components/custom/ImageEditor'
import MagnetPreview from '@/components/custom/MagnetPreview'
import ProductOptions from '@/components/custom/ProductOptions'

import PackageSelector from '@/components/custom/PackageSelector'
import PackageProgress from '@/components/custom/PackageProgress'

import UploadArea from '@/components/custom/UploadArea'
import { useToast } from '@/contexts/ToastContext'

import { safeLocalStorage } from '@/utils/localStorage'

// Define packages
const PACKAGES = [
  {
    id: '1',
    name: '1 Custom Magnet',
    price: 5,
    pricePerUnit: 5,
    maxFiles: 1,
    description: 'Single magnet for testing or small gifts',
    tag: 'SINGLE'
  },
  {
    id: '6',
    name: '6 Custom Magnets',
    price: 17.00,
    pricePerUnit: 2.83,
    maxFiles: 6,
    description: 'Perfect for small gifts or personal use',
    tag: 'POPULAR'
  },
  {
    id: '9',
    name: '9 Custom Magnets',
    price: 23.00,
    pricePerUnit: 2.55,
    maxFiles: 9,
    description: 'Great for families and small collections',
    tag: 'BEST VALUE'
  },
  {
    id: '12',
    name: '12 Custom Magnets',
    price: 28.00,
    pricePerUnit: 2.33,
    maxFiles: 12,
    description: 'Ideal for large families or multiple designs',
    tag: 'BEST SELLER'
  },
  {
    id: '16',
    name: '16 Custom Magnets',
    price: 36.00,
    pricePerUnit: 2.25,
    maxFiles: 16,
    description: 'Ideal for businesses and bulk orders',
    tag: 'BULK SAVER'
  }
];

// Get package from URL or default to 6 magnets
const getInitialPackage = () => {
  // During SSR, avoid selecting a default to prevent hydration mismatch
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const pkgId = params.get('package') || params.get('qty');
  
  if (pkgId) {
    const foundPackage = PACKAGES.find(pkg => pkg.id === pkgId);
    if (foundPackage) return foundPackage;
  }
  // No explicit selection => show no selection by default
  return null;
};

export default function Custom() {
  const router = useRouter()
  const { user } = useAuth()
  const dispatch = useDispatch()
  const { showToast } = useToast()
  
  // State
  const [selectedPackage, setSelectedPackage] = useState(getInitialPackage());
  const [selectedSize, setSelectedSize] = useState('5x5');
  const [selectedFinish, setSelectedFinish] = useState('rigid');
  const [currentEditingFile, setCurrentEditingFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
 
  // On mount (client), ensure we reflect any URL package (supports ?package= and legacy ?qty=)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedPackage) return;
    const params = new URLSearchParams(window.location.search);
    const pkgId = params.get('package') || params.get('qty');
    if (pkgId) {
      const found = PACKAGES.find(p => p.id === pkgId);
      setSelectedPackage(found || PACKAGES[1]); // default to 6-pack if invalid id
    } else {
      // No param provided -> default to 6-pack on client to avoid SSR hydration issues
      setSelectedPackage(PACKAGES[1]);
    }
  }, []);
  
  // Local state for package images (not in Redux)
  const [packageImages, setPackageImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Update URL when package changes
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedPackage) {
      const url = new URL(window.location.href);
      url.searchParams.set('package', selectedPackage.id);
      window.history.replaceState({}, '', url.toString());
    }
  }, [selectedPackage]);
  
  // Note: We no longer save images to localStorage to avoid quota issues
  // Images are kept in memory and uploaded to server when adding to cart
  
  // Handle package selection
  const handlePackageSelect = useCallback((pkg) => {
    // Save current package images before switching
    if (packageImages.length > 0) {
      const confirmSwitch = window.confirm(
        `You have ${packageImages.length} images in your current package. Switching packages will start fresh. Continue?`
      );
      if (!confirmSwitch) return;
    }
    
    setSelectedPackage(pkg);
    setPackageImages([]);
    setCurrentImageIndex(0);
  }, [packageImages]);
  
  // Queue for multiple file uploads
  const [fileQueue, setFileQueue] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (!selectedPackage) {
      showToast('Please select a package first', 'warning');
      return;
    }
    
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validate file sizes (max 10MB per file)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const invalidFiles = files.filter(f => f.size > MAX_FILE_SIZE);
    
    if (invalidFiles.length > 0) {
      showToast(`Some files are too large (max 10MB). Please use smaller images.`, 'error');
      return;
    }
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidTypes = files.filter(f => !validTypes.includes(f.type));
    
    if (invalidTypes.length > 0) {
      showToast('Please upload only JPG, PNG, or WebP images', 'error');
      return;
    }
    
    // Check if we can add more images
    const remainingSlots = selectedPackage.maxFiles - packageImages.length;
    if (remainingSlots <= 0) {
      showToast('Package is already full!', 'error');
      return;
    }
    
    if (files.length > remainingSlots) {
      showToast(`You can only add ${remainingSlots} more images to this package`, 'warning');
      files.splice(remainingSlots); // Trim to remaining slots
    }
    
    // Start sequential crop flow for all files
    setFileQueue(files);
    setCurrentFileIndex(0);
    setCurrentEditingFile(files[0]);
  };
  
  // No longer needed - all files go through crop editor sequentially
  
  // Handle cropped image from editor
  const handleCroppedImage = async (blob) => {
    try {
      setIsLoading(true);
      
      const base64 = await blobToBase64(blob);
      const thumbnail = await createThumbnailFromBlob(blob);
      
      const newImage = {
        id: `img-${Date.now()}`,
        fullImage: base64,
        thumbnail: thumbnail,
        name: `Custom Magnet ${packageImages.length + 1}`
      };
      
      setPackageImages(prev => [...prev, newImage]);
      
      // Check if there are more files in the queue
      const nextIndex = currentFileIndex + 1;
      if (fileQueue.length > 0 && nextIndex < fileQueue.length) {
        // Move to next file in queue
        setCurrentFileIndex(nextIndex);
        setCurrentEditingFile(fileQueue[nextIndex]);
        showToast(`Image ${nextIndex} of ${fileQueue.length} added! Crop next image...`, 'success');
      } else {
        // All files processed
        setCurrentEditingFile(null);
        setFileQueue([]);
        setCurrentFileIndex(0);
        showToast(fileQueue.length > 1 ? `All ${fileQueue.length} images added to package!` : 'Image added to package!', 'success');
      }
      
    } catch (error) {
      showToast('Error processing image: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle cancel during crop
  const handleCancelCrop = () => {
    if (fileQueue.length > 1) {
      const remaining = fileQueue.length - currentFileIndex;
      const confirmCancel = window.confirm(
        `You have ${remaining} image${remaining > 1 ? 's' : ''} remaining. Cancel all?`
      );
      if (!confirmCancel) return;
    }
    
    setCurrentEditingFile(null);
    setFileQueue([]);
    setCurrentFileIndex(0);
  };
  
  // Add package to cart
  const handleAddToCart = async () => {
    if (!selectedPackage) {
      showToast('Please select a package first', 'warning');
      return;
    }
    
    if (packageImages.length !== selectedPackage.maxFiles) {
      showToast(`Please add all ${selectedPackage.maxFiles} images before proceeding`, 'warning');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Upload images to server and get URLs
      const uploadedImageUrls = [];
      
      for (let i = 0; i < packageImages.length; i++) {
        const img = packageImages[i];
        setUploadProgress(((i + 1) / packageImages.length) * 100);
        
        try {
          // Convert base64 to blob
          const response = await fetch(img.fullImage);
          const blob = await response.blob();
          
          // Check blob size (should be under 5MB after compression)
          if (blob.size > 5 * 1024 * 1024) {
            console.warn(`Image ${i + 1} is large (${(blob.size / 1024 / 1024).toFixed(2)}MB), compressing...`);
            // If still too large, compress more aggressively
            const compressedBlob = await compressImage(blob, 0.7);
            
            // Upload compressed version
            const formData = new FormData();
            formData.append('file', compressedBlob, `magnet-${i + 1}.jpg`);
            
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            
            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json().catch(() => ({}));
              throw new Error(errorData.error || `Failed to upload image ${i + 1}`);
            }
            
            const { url } = await uploadResponse.json();
            uploadedImageUrls.push(url);
          } else {
            // Upload original
            const formData = new FormData();
            formData.append('file', blob, `magnet-${i + 1}.jpg`);
            
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            
            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json().catch(() => ({}));
              throw new Error(errorData.error || `Failed to upload image ${i + 1}`);
            }
            
            const { url } = await uploadResponse.json();
            uploadedImageUrls.push(url);
          }
        } catch (uploadError) {
          console.error(`Error uploading image ${i + 1}:`, uploadError);
          throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`);
        }
      }
      
      // Clear any existing package from cart
      const cartItems = selectCartItems(store.getState());
      cartItems.forEach((item, index) => {
        if (item.custom_data && JSON.parse(item.custom_data).packageId === selectedPackage.id) {
          dispatch(removeItem(index));
        }
      });
      
      // Add complete package to cart with image URLs only (no base64)
      const packagePrice = parseFloat(selectedPackage.price) || 0;
      
      const packageItem = {
        id: `package-${selectedPackage.id}-${Date.now()}`,
        name: `${selectedPackage.name} (${selectedSize}cm, ${selectedFinish})`,
        price: packagePrice,
        totalPrice: packagePrice,
        quantity: 1,
        images: uploadedImageUrls, // Add images array for cart display
        custom_data: JSON.stringify({
          type: 'custom_magnet_package',
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          size: selectedSize,
          finish: selectedFinish,
          thumbnails: uploadedImageUrls, // For backward compatibility
          imageUrls: uploadedImageUrls, // Only URLs, no base64
          imageCount: uploadedImageUrls.length
        })
      };

      dispatch(addItem(packageItem));
      
      showToast('Package added to cart!', 'success');
      
      // Clear local images from state
      setPackageImages([]);
      setCurrentImageIndex(0);
      
      // Navigate to checkout
      router.push('/checkout');
      
    } catch (error) {
      console.error('Error uploading images:', error);
      showToast('Failed to upload images. Please try again.', 'error');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };
  
  // Helper functions
  const compressImage = async (blob, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Keep original dimensions but compress quality
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob) {
              resolve(compressedBlob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(blob);
    });
  };
  
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  const createThumbnail = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const size = 200;
          canvas.width = size;
          canvas.height = size;
          
          // Calculate crop for square
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;
          
          ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const createThumbnailFromBlob = (blob) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        
        ctx.drawImage(img, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  };
  
  // Current display image
  const currentImage = packageImages[currentImageIndex]?.fullImage || null;
  const imagesForDisplay = packageImages.map(img => ({
    id: img.id,
    url: img.fullImage,
    thumbnail: img.thumbnail,
    name: img.name
  }));

  return (
    <div className="bg-pink-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <h1 className="text-lg lg:text-2xl font-bold text-white">
            Custom Photo Magnets
          </h1>
          <p className="text-pink-100 text-xs lg:text-sm mt-1">Turn your photos into magnets</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Mobile: Package Selection at top - compact */}
        <div className="lg:hidden mb-4">
          <PackageSelector 
            selectedPackage={selectedPackage}
            onPackageSelect={handlePackageSelect}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Left column: Options - Desktop only */}
          <div className="hidden lg:block space-y-6">
            {/* Package Selection */}
            <PackageSelector 
              selectedPackage={selectedPackage}
              onPackageSelect={handlePackageSelect}
            />

            {/* Customize Options */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-200 p-6">
              <h3 className="text-lg font-medium text-pink-900 mb-4">Customize Your Magnets</h3>
              <ProductOptions
                selectedSize={selectedSize}
                selectedFinish={selectedFinish}
                onSizeChange={setSelectedSize}
                onFinishChange={setSelectedFinish}
              />
            </div>
          </div>

          {/* Right column: Preview & Upload */}
          <div className="space-y-4 lg:space-y-6">
            {/* Package Progress - Mobile (only show if has images or package > 1) */}
            {selectedPackage && packageImages.length > 0 && (
              <div className="lg:hidden bg-white rounded-xl shadow-sm border border-pink-200 p-4">
                <PackageProgress 
                  selectedPackage={selectedPackage}
                  currentPackageImages={packageImages}
                  imagesForCurrentPackageCount={packageImages.length}
                />
              </div>
            )}

            {/* Design Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-200 p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold text-pink-900 mb-3 lg:mb-4">Design Preview</h2>
              
              <MagnetPreview 
                imageUrl={currentImage}
                images={imagesForDisplay}
                size={`${selectedSize}cm`}
                finish={selectedFinish}
                onThumbnailClick={setCurrentImageIndex}
              />
              
              {/* Upload Progress */}
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
              
              {/* Package Progress - Desktop */}
              {selectedPackage && (
                <div className="hidden lg:block mt-4">
                  <PackageProgress 
                    selectedPackage={selectedPackage}
                    currentPackageImages={packageImages}
                    imagesForCurrentPackageCount={packageImages.length}
                  />
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-4 lg:mt-6 space-y-3">
                {!selectedPackage ? (
                  <div className="text-center py-6 lg:py-8">
                    <p className="text-sm text-gray-600">Select a package above to start</p>
                  </div>
                ) : packageImages.length === selectedPackage.maxFiles ? (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 lg:py-4 px-4 rounded-lg transition-all shadow-md"
                  >
                    Add to Cart - £{selectedPackage.price.toFixed(2)}
                  </button>
                ) : (
                  <UploadArea 
                    selectedPackage={selectedPackage}
                    imagesForCurrentPackageCount={packageImages.length}
                    onFileChange={handleFileChange}
                  />
                )}
                
                {selectedPackage && packageImages.length > 0 && packageImages.length < selectedPackage.maxFiles && (
                  <button
                    onClick={() => document.querySelector('input[type="file"]')?.click()}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all"
                  >
                    Add More ({selectedPackage.maxFiles - packageImages.length} left)
                  </button>
                )}
                
                {packageImages.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all images and start over?')) {
                        setPackageImages([]);
                        setCurrentImageIndex(0);
                      }
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Mobile: Customize Options at bottom */}
            <div className="lg:hidden bg-white rounded-xl shadow-sm border border-pink-200 p-4">
              <h3 className="text-base font-medium text-pink-900 mb-3">Customize</h3>
              <ProductOptions
                selectedSize={selectedSize}
                selectedFinish={selectedFinish}
                onSizeChange={setSelectedSize}
                onFinishChange={setSelectedFinish}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Image Editor Modal */}
      {currentEditingFile && (
        <ImageEditor
          file={currentEditingFile}
          onSave={handleCroppedImage}
          onCancel={handleCancelCrop}
          currentIndex={currentFileIndex}
          totalFiles={fileQueue.length}
        />
      )}
    </div>
  )
}