"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUpload, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const products = [
  {
    id: 1,
    name: '6 Custom Magnets',
    price: '£17.00',
    pricePerUnit: '£2.83 each',
    image: '/images/magnet1.jpeg',
    description: 'Ideal for small gifts or personal use',
    href: '/custom?package=6',
    tag: 'BEST VALUE',
    sampleImages: [
      '/images/magnet2.jpeg',
      '/images/magnet3.jpeg',
      '/images/magnet4.jpeg'
    ]
  },
  {
    id: 2,
    name: '9 Custom Magnets',
    price: '£23.00',
    pricePerUnit: '£2.55 each',
    image: '/images/magnet2.jpeg',
    description: 'Perfect for families and small collections',
    href: '/custom?package=9',
    tag: 'UK FAVOURITE',
    sampleImages: [
      '/images/magnet1.jpeg',
      '/images/magnet3.jpeg',
      '/images/magnet5.jpeg'
    ]
  },
  {
    id: 3,
    name: '12 Custom Magnets',
    price: '£28.00',
    pricePerUnit: '£2.33 each',
    image: '/images/magnet3.jpeg',
    description: 'Great for large families or multiple designs',
    href: '/custom?package=12',
    tag: 'BEST SELLER',
    sampleImages: [
      '/images/magnet2.jpeg',
      '/images/magnet4.jpeg',
      '/images/magnet6.jpeg'
    ]
  },
  {
    id: 4,
    name: '16 Custom Magnets',
    price: '£36.00',
    pricePerUnit: '£2.25 each',
    image: '/images/magnet4.jpeg',
    description: 'Ideal for businesses and bulk orders',
    href: '/custom?package=16',
    tag: 'BULK SAVER',
    sampleImages: [
      '/images/magnet1.jpeg',
      '/images/magnet5.jpeg',
      '/images/magnet7.jpeg'
    ]
  }
];

export default function ProductShowcase() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState({});
  const [uploadError, setUploadError] = useState('');
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Function to determine package and price based on image count
  const getPackageForImageCount = (imageCount) => {
    if (imageCount === 0) return null;
    if (imageCount === 1) return { name: '1 Custom Magnet', price: '£5.00', packageSize: 1 };
    if (imageCount <= 6) return { name: '6 Custom Magnets', price: '£17.00', packageSize: 6 };
    if (imageCount <= 9) return { name: '9 Custom Magnets', price: '£23.00', packageSize: 9 };
    if (imageCount <= 12) return { name: '12 Custom Magnets', price: '£28.00', packageSize: 12 };
    if (imageCount <= 16) return { name: '16 Custom Magnets', price: '£36.00', packageSize: 16 };
    return { name: '16 Custom Magnets', price: '£36.00', packageSize: 16 }; // Max package
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleOrderNow = (e, product) => {
    e.preventDefault();
    const imageCount = uploadedImages[product.id]?.length || 0;
    
    if (imageCount === 0) {
      setUploadError('Please upload at least one image to continue.');
      return;
    }
    
    // Determine the appropriate package based on image count
    const selectedPackage = getPackageForImageCount(imageCount);
    
    // Store the uploaded images in localStorage
    const orderData = {
      packageSize: selectedPackage.packageSize,
      images: uploadedImages[product.id],
      price: selectedPackage.price,
      name: selectedPackage.name,
      actualImageCount: imageCount
    };
    
    localStorage.setItem('customMagnetOrder', JSON.stringify(orderData));
    
    // Redirect to custom page with the package size
    router.push(`/custom?package=${selectedPackage.packageSize}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleImageUpload = (e, productId, maxImages) => {
    const files = Array.from(e.target.files);
    const currentImages = uploadedImages[productId]?.length || 0;
    
    if (files.length > 1) {
      setUploadError('Please upload only one image at a time.');
      return;
    }
    
    if (currentImages >= 16) {
      setUploadError('You can upload up to 16 images maximum.');
      return;
    }
    
    if (files.length === 0) return;
    
    const file = files[0];
    const newImage = URL.createObjectURL(file);
    
    setUploadedImages(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), newImage]
    }));
    
    setUploadError('');
  };

  const nextImage = () => {
    setActiveImageIndex(prev => 
      (prev + 1) % (selectedProduct.sampleImages.length + (uploadedImages[selectedProduct.id]?.length || 0))
    );
  };

  const prevImage = () => {
    const totalImages = selectedProduct.sampleImages.length + (uploadedImages[selectedProduct.id]?.length || 0);
    setActiveImageIndex(prev => (prev - 1 + totalImages) % totalImages);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-pink-700 uppercase bg-pink-100 rounded-full">
            Made in the UK
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Personalised Magnet Collections</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Handcrafted in Britain, our custom magnets make perfect keepsakes and gifts. Choose your package and create something special today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const productUploadedImages = uploadedImages[product.id] || [];
            const allImages = [product.image, ...product.sampleImages, ...productUploadedImages];
            
            return (
              <div key={product.id} className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden border border-gray-100">
                  <div className="relative h-64 w-full bg-white">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      style={{
                        backgroundColor: 'white',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        margin: '0 auto',
                        display: 'block'
                      }}
                      priority
                      onError={(e) => {
                        console.error('Failed to load image:', product.image);
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  {product.tag && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                      {product.tag}
                    </div>
                  )}
                  <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium bg-black bg-opacity-50 px-3 py-1.5 rounded-full">
                      View Details
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-600 mb-3 text-sm">{product.description}</p>
                  <div className="flex items-baseline justify-between mt-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                      <span className="block text-sm text-gray-500">Free UK Delivery</span>
                    </div>
                    <span className="text-sm text-gray-500">{product.pricePerUnit}</span>
                  </div>
                  <div className="space-y-3">
                    <Link
                      href={product.href}
                      className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Order Now
                    </Link>
                    <button
                      onClick={() => openModal(product)}
                      className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium py-2 px-4 rounded-full hover:opacity-90 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Create Yours Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">Need a custom order or bulk pricing? Contact us for special requests.</p>
          <a
            href="mailto:sales@magnetstore.com"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Contact for Bulk Orders
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </a>
        </div>

        {/* Image Modal */}
        {isModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-pink-100">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={closeModal}
                  >
                    <span className="sr-only">Close</span>
                    <FiX className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {selectedProduct.name}
                    </h3>
                    <div className="mt-2">
                      <h3 className="text-2xl font-bold text-gray-900">Create Your {selectedProduct.name}</h3>
                      <p className="text-sm text-gray-500">{selectedProduct.pricePerUnit}</p>
                      <p className="text-gray-600 mt-2">{selectedProduct.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Image Gallery */}
                <div className="mt-6">
                  <div className="relative h-64 sm:h-80 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                    {[...selectedProduct.sampleImages, ...(uploadedImages[selectedProduct.id] || [])].map((img, idx) => (
                      <div 
                        key={idx} 
                        className={`absolute inset-0 transition-opacity duration-300 ${idx === activeImageIndex ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <Image
                          src={img}
                          alt={`${selectedProduct.name} example ${idx + 1}`}
                          width={600}
                          height={400}
                          className="max-w-full max-h-full object-contain"
                          style={{
                            backgroundColor: 'white',
                            display: 'block',
                            margin: '0 auto'
                          }}
                          onError={(e) => {
                            console.error('Failed to load gallery image:', img);
                            e.target.src = '/images/placeholder.jpg';
                          }}
                        />
                      </div>
                    ))}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 focus:outline-none"
                    >
                      <FiChevronLeft className="w-6 h-6" aria-hidden="true" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 focus:outline-none"
                    >
                      <FiChevronRight className="w-6 h-6" aria-hidden="true" />
                    </button>
                    
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                      {[...selectedProduct.sampleImages, ...(uploadedImages[selectedProduct.id] || [])].map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(idx);
                          }}
                          className={`w-2 h-2 rounded-full ${idx === activeImageIndex ? 'bg-indigo-600' : 'bg-gray-300'}`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Image Upload */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Upload your images
                      </label>
                      {(() => {
                        const imageCount = uploadedImages[selectedProduct.id]?.length || 0;
                        const selectedPackage = getPackageForImageCount(imageCount);
                        return (
                          <div className="text-gray-600 mb-6">
                            <p>Upload photos to create your personalised magnets. All images are printed with our premium UK-made quality and delivered to your door.</p>
                            {imageCount > 0 && selectedPackage && (
                              <div className="mt-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
                                <p className="text-sm font-medium text-pink-800">
                                  Current package: {selectedPackage.name} - {selectedPackage.price}
                                </p>
                                <p className="text-xs text-pink-600">
                                  {imageCount} image{imageCount !== 1 ? 's' : ''} uploaded
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    {uploadError && (
                      <div className="text-red-600 text-sm mb-2">{uploadError}</div>
                    )}
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-pink-500 transition-all hover:bg-pink-50"
                        onClick={() => document.getElementById('file-upload').click()}>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, selectedProduct.id, parseInt(selectedProduct.name.match(/\d+/)[0]))}
                        />
                        <FiUpload className="mx-auto h-12 w-12 text-pink-400" />
                        <div className="mt-4 flex text-sm text-gray-600 justify-center">
                          <span className="relative cursor-pointer rounded-md font-medium text-pink-600 hover:text-pink-500">
                            <span>Upload one photo</span>
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Upload one image at a time (PNG, JPG up to 10MB)
                        </p>
                      </div>
                    </div>
                    
                    {/* Uploaded Images Thumbnails */}
                    {uploadedImages[selectedProduct.id]?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-700 mb-2">Your uploaded images:</p>
                        <div className="flex flex-wrap gap-2">
                          {uploadedImages[selectedProduct.id].map((img, idx) => (
                            <div key={idx} className="relative h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                              <Image
                                src={img}
                                alt={`Uploaded ${idx + 1}`}
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-6">
                  {(() => {
                    const imageCount = uploadedImages[selectedProduct.id]?.length || 0;
                    const selectedPackage = getPackageForImageCount(imageCount);
                    return (
                      <div>
                        {imageCount > 0 && selectedPackage && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-lg font-bold text-gray-900">{selectedPackage.name}</p>
                                <p className="text-sm text-gray-600">{selectedPackage.price}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{imageCount} image{imageCount !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={(e) => handleOrderNow(e, selectedProduct)}
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium py-3 px-6 rounded-full hover:opacity-90 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                          disabled={!uploadedImages[selectedProduct.id] || uploadedImages[selectedProduct.id].length === 0}
                        >
                          Continue to Secure Checkout
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
