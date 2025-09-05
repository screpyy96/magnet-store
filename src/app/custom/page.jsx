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
  
  // Load saved images from localStorage on mount
  useEffect(() => {
    if (!selectedPackage) return;
    const savedImages = safeLocalStorage.getJSON(`package_${selectedPackage.id}_images`) || [];
    if (savedImages.length > 0) {
      setPackageImages(savedImages);
      showToast(`Restored ${savedImages.length} images from previous session`, 'info');
    }
  }, [selectedPackage?.id]);
  
  // Save images to localStorage when they change
  useEffect(() => {
    if (!selectedPackage || packageImages.length === 0) return;
    safeLocalStorage.setJSON(`package_${selectedPackage.id}_images`, packageImages);
  }, [packageImages, selectedPackage?.id]);
  
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
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (!selectedPackage) {
      showToast('Please select a package first', 'warning');
      return;
    }
    
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Check if we can add more images
    const remainingSlots = selectedPackage.maxFiles - packageImages.length;
    if (remainingSlots <= 0) {
      showToast('Package is already full!', 'error');
      return;
    }
    
    if (files.length > remainingSlots) {
      showToast(`You can only add ${remainingSlots} more images to this package`, 'warning');
      return;
    }
    
    // Process single or multiple files
    if (files.length === 1) {
      setCurrentEditingFile(files[0]);
    } else {
      processMultipleFiles(files.slice(0, remainingSlots));
    }
  };
  
  // Process multiple files without editor
  const processMultipleFiles = async (files) => {
    setIsLoading(true);
    const newImages = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(((i + 1) / files.length) * 100);
        
        const base64 = await fileToBase64(file);
        const thumbnail = await createThumbnail(file);
        
        newImages.push({
          id: `img-${Date.now()}-${i}`,
          fullImage: base64,
          thumbnail: thumbnail,
          name: file.name
        });
      }
      
      setPackageImages(prev => [...prev, ...newImages]);
      showToast(`Added ${files.length} images to package`, 'success');
    } catch (error) {
      showToast('Error processing images: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };
  
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
      setCurrentEditingFile(null);
      showToast('Image added to package!', 'success');
      
    } catch (error) {
      showToast('Error processing image: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add package to cart
  const handleAddToCart = () => {
    if (!selectedPackage) {
      showToast('Please select a package first', 'warning');
      return;
    }
    
    if (packageImages.length !== selectedPackage.maxFiles) {
      showToast(`Please add all ${selectedPackage.maxFiles} images before proceeding`, 'warning');
      return;
    }
    
    // Clear any existing package from cart
    const cartItems = selectCartItems(store.getState());
    cartItems.forEach((item, index) => {
      if (item.custom_data && JSON.parse(item.custom_data).packageId === selectedPackage.id) {
        dispatch(removeItem(index));
      }
    });
    
    // Add complete package to cart
    const packagePrice = parseFloat(selectedPackage.price) || 0;
    console.log('Package price calculation:', {
      selectedPackagePrice: selectedPackage.price,
      packagePrice: packagePrice,
      selectedPackage: selectedPackage
    });
    
    const packageItem = {
      id: `package-${selectedPackage.id}-${Date.now()}`,
      name: `${selectedPackage.name} (${selectedSize}cm, ${selectedFinish})`,
      price: packagePrice,
      totalPrice: packagePrice,
      quantity: 1,
      images: packageImages.map(img => img.thumbnail),
      custom_data: JSON.stringify({
        type: 'custom_magnet_package',
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        size: selectedSize,
        finish: selectedFinish,
        images: packageImages.map(img => img.fullImage),
        thumbnails: packageImages.map(img => img.thumbnail)
      })
    };
    
    console.log('About to dispatch packageItem:', packageItem);
    console.log('PackageItem price type:', typeof packageItem.price);
    console.log('PackageItem totalPrice type:', typeof packageItem.totalPrice);

    dispatch(addItem(packageItem));
    
    // Clear local storage for this package
    safeLocalStorage.removeItem(`package_${selectedPackage.id}_images`);
    
    // Navigate to checkout
    router.push('/checkout');
  };
  
  // Helper functions
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
  const currentImage = packageImages[currentImageIndex]?.thumbnail || null;
  const imagesForDisplay = packageImages.map(img => ({
    id: img.id,
    url: img.thumbnail,
    name: img.name
  }));

  return (
    <div className="bg-pink-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Your Custom Magnets</h1>
          <p className="text-gray-600 mt-2">Upload your photos and we'll turn them into beautiful magnets</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Options */}
          <div className="space-y-6 order-2 lg:order-1">
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
          <div className="space-y-6 order-1 lg:order-2">
            {/* Design Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-200 p-6">
              <h2 className="text-xl font-semibold text-pink-900 mb-4">Design Preview</h2>
              
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
              
              {/* Package Progress */}
              {selectedPackage && (
                <div className="mt-4">
                  <PackageProgress 
                    selectedPackage={selectedPackage}
                    currentPackageImages={packageImages}
                    imagesForCurrentPackageCount={packageImages.length}
                  />
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {!selectedPackage ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Please select a package to start creating your custom magnets</p>
                  </div>
                ) : packageImages.length === selectedPackage.maxFiles ? (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    Add Package to Cart - £{selectedPackage.price.toFixed(2)}
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
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Add More Images ({selectedPackage.maxFiles - packageImages.length} remaining)
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
                    Clear All Images
                  </button>
                )}
                
                
              </div>
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