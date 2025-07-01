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
    description: 'Perfect for small gifts or personal use',
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
    description: 'Great for families and small collections',
    href: '/custom?package=9',
    tag: 'POPULAR',
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
    description: 'Ideal for large families or multiple designs',
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
    description: 'Perfect for businesses and bulk orders',
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

  const openModal = (product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleOrderNow = (e, product) => {
    e.preventDefault();
    const imageCount = uploadedImages[product.id]?.length || 0;
    const packageSize = parseInt(product.name.match(/\d+/)[0]);
    
    if (imageCount < packageSize) {
      setUploadError(`Please upload ${packageSize} images (${packageSize - imageCount} more needed)`);
      return;
    }
    
    // Store the uploaded images in localStorage
    const orderData = {
      packageSize,
      images: uploadedImages[product.id],
      price: product.price,
      name: product.name
    };
    
    localStorage.setItem('customMagnetOrder', JSON.stringify(orderData));
    
    // Redirect to custom page with the package size
    router.push(`/custom?package=${packageSize}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleImageUpload = (e, productId, maxImages) => {
    const files = Array.from(e.target.files);
    const currentImages = uploadedImages[productId]?.length || 0;
    const availableSlots = maxImages - currentImages;
    
    if (files.length > availableSlots) {
      setUploadError(`You can only upload up to ${maxImages} images for this package.`);
      return;
    }
    
    const newImages = files.map(file => URL.createObjectURL(file));
    
    setUploadedImages(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), ...newImages].slice(0, maxImages)
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Most Popular Magnets
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our best-selling custom magnets, loved by thousands of happy customers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const productUploadedImages = uploadedImages[product.id] || [];
            const allImages = [product.image, ...product.sampleImages, ...productUploadedImages];
            
            return (
              <div key={product.id} className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="w-full overflow-hidden rounded-t-xl bg-white cursor-pointer" onClick={() => openModal(product)}>
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
                    <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-2xl font-bold text-indigo-600">{product.price}</p>
                  <p className="text-sm text-gray-500 mb-3">{product.pricePerUnit}</p>
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  <div className="space-y-3">
                    <Link
                      href={product.href}
                      className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Order Now
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(product);
                      }}
                      className="w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Customize ({uploadedImages[product.id]?.length || 0}/{parseInt(product.name.match(/\d+/)[0])})
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
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
                      <p className="text-2xl font-bold text-indigo-600">{selectedProduct.price}</p>
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
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 focus:outline-none"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
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
                      <span className="text-sm text-gray-500">
                        {uploadedImages[selectedProduct.id]?.length || 0}/{selectedProduct.name.match(/\d+/)[0]} images
                      </span>
                    </div>
                    {uploadError && (
                      <div className="text-red-600 text-sm mb-2">{uploadError}</div>
                    )}
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor={`file-upload-${selectedProduct.id}`}
                            className={`relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none ${
                              (uploadedImages[selectedProduct.id]?.length || 0) >= parseInt(selectedProduct.name.match(/\d+/)[0]) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <span>Upload files</span>
                            <input
                              id={`file-upload-${selectedProduct.id}`}
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, selectedProduct.id, parseInt(selectedProduct.name.match(/\d+/)[0]))}
                              disabled={(uploadedImages[selectedProduct.id]?.length || 0) >= parseInt(selectedProduct.name.match(/\d+/)[0])}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
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
                  <button
                    type="button"
                    onClick={(e) => handleOrderNow(e, selectedProduct)}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      (uploadedImages[selectedProduct.id]?.length || 0) < parseInt(selectedProduct.name.match(/\d+/)[0])
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    disabled={(uploadedImages[selectedProduct.id]?.length || 0) < parseInt(selectedProduct.name.match(/\d+/)[0])}
                  >
                    {uploadError ? 'Complete Your Order' : 'Order Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
