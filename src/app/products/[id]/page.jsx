"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Funcție mock pentru obținerea datelor despre produs
const getProductData = (id) => {
  // În producție, aceasta ar fi o cerere către API/backend
  const products = {
    "1": {
      id: 1,
      name: 'Custom Photo Magnets',
      description: 'Transform your favorite photos into beautiful magnets with our premium printing technology.',
      longDescription: `Our Custom Photo Magnets are the perfect way to display your cherished memories. Made with high-quality materials, these magnets are durable, fade-resistant and bring your photos to life.

Each magnet is carefully crafted to ensure the highest quality print reproduction. The strong magnetic backing ensures they'll stay securely attached to any magnetic surface.`,
      features: ['High-quality printing', 'Durable materials', 'Square shape (7x7cm)', 'Glossy finish', 'Strong magnetic backing'],
      specifications: {
        size: '7cm x 7cm',
        material: 'Premium photo paper with magnetic backing',
        thickness: '1mm',
        finish: 'Glossy',
        shipping: '2-4 business days'
      },
      images: [
        'https://images.unsplash.com/photo-1591129841117-3adfd313e34f?w=800&q=80',
        'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=800&q=80'
      ],
      price: '9.99',
      category: 'custom',
      badge: 'Best Seller'
    }
  }
  
  return products[id]
}

export default function ProductPage({ params }) {
  const product = getProductData(params.id)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  
  if (!product) {
    return <div className="text-center py-20">Product not found</div>
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Imagini produs */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 aspect-square relative">
            <Image 
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`cursor-pointer border-2 rounded overflow-hidden aspect-square relative ${selectedImage === index ? 'border-pink-400' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image 
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Detalii produs */}
        <div>
          {product.badge && (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
              {product.badge}
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          <p className="text-2xl font-medium text-gray-900 mt-2">£{product.price}</p>
          
          <div className="mt-6">
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Features</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="text-gray-600">{feature}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-8">
            <div className="flex items-center space-x-4">
              <div className="flex border border-gray-300 rounded-md">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-gray-600"
                >
                  -
                </button>
                <span className="px-4 py-1 border-x border-gray-300 flex items-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-gray-600"
                >
                  +
                </button>
              </div>
              
              <button className="flex-1 bg-gradient-to-r from-pink-400 to-amber-400 hover:from-pink-500 hover:to-amber-500 text-white px-6 py-2 rounded-full font-medium">
                Add to Cart
              </button>
            </div>
          </div>
          
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <div className="mt-2 text-gray-600 space-y-2">
                {product.longDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900">Specifications</h3>
              <div className="mt-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 py-2 border-b border-gray-200">
                    <span className="text-gray-500 capitalize">{key}</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 