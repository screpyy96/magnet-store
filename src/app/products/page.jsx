'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  // Realistic magnet products based on the business
  const products = [
    {
      id: 'single-5x5',
      name: '5cm × 5cm Photo Magnet',
      description: 'Perfect size for single photos. High-quality flexible magnetic backing.',
      features: ['5cm × 5cm square', 'Flexible vinyl finish', 'Strong magnetic hold', 'Weather resistant'],
      image: '/images/magnet1.jpeg',
      price: '5.00',
      link: '/custom?qty=1',
      category: 'single',
      badge: 'Most Popular',
      sizes: ['5x5cm'],
      finishes: [ 'Rigid']
    },
    {
      id: 'pack-6',
      name: '6-Pack Photo Magnets',
      description: 'Share your favorite memories with family and friends. Great value pack.',
      features: ['6 custom magnets', '£2.83 per magnet', 'Mix different photos', 'Perfect for gifting'],
      image: '/images/magnet2.jpeg',
      price: '17.00',
      originalPrice: '30.00',
      link: '/custom?qty=6',
      category: 'bundle',
      badge: 'Best Value',
      savings: '43%'
    },
    {
      id: 'pack-9',
      name: '9-Pack Photo Collection',
      description: 'Create a beautiful photo collection for your fridge or office.',
      features: ['9 custom magnets', '£2.55 per magnet', 'Instagram-style layout', 'Family favorites'],
      image: '/images/magnet3.jpeg',
      price: '23.00',
      originalPrice: '45.00',
      link: '/custom?qty=9',
      category: 'bundle',
      badge: 'Popular Choice',
      savings: '49%'
    },
    {
      id: 'pack-12',
      name: '12-Pack Mega Collection',
      description: 'Our biggest value pack! Perfect for large families or multiple occasions.',
      features: ['12 custom magnets', '£2.33 per magnet', 'Maximum savings', 'Wedding/event favors'],
      image: '/images/magnet4.jpeg',
      price: '28.00',
      originalPrice: '60.00',
      link: '/custom?qty=12',
      category: 'bundle',
      badge: 'Best Seller',
      savings: '53%'
    },
    {
      id: 'business-pack',
      name: 'Business Promotional Pack',
      description: 'Perfect for businesses, real estate agents, and promotional giveaways.',
      features: ['50+ magnets available', 'Logo and branding', 'Bulk pricing', 'Professional finish'],
      image: '/images/magnet5.jpeg',
      price: 'From £1.50',
      link: '/contact',
      category: 'business',
      badge: 'Custom Quote'
    },
    {
      id: 'wedding-favors',
      name: 'Wedding Favor Collection',
      description: 'Beautiful wedding photo magnets as memorable keepsakes for your guests.',
      features: ['Custom wedding photos', 'Elegant packaging', 'Date and names included', 'Bulk discounts'],
      image: '/images/magnet6.jpeg',
      price: 'From £2.00',
      link: '/contact',
      category: 'special',
      badge: 'Wedding Special'
    }
  ]

  // Categories for filtering
  const categories = {
    all: { name: 'All Products', icon: '🔍' },
    single: { name: 'Single Magnets', icon: '📸' },
    bundle: { name: 'Value Packs', icon: '📦' },
    business: { name: 'Business', icon: '💼' },
    special: { name: 'Special Events', icon: '🎉' }
  }

  // Filter products based on active category
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory)

  // Customer testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      location: 'Manchester',
      text: 'Amazing quality! The colors are so vibrant and the magnets are really strong. My family photos look beautiful on the fridge.',
      rating: 5,
      product: '6-Pack Photo Magnets',
      image: '/images/magnet1.jpeg'
    },
    {
      id: 2,
      name: 'David Smith',
      location: 'London',
      text: 'Ordered these for our wedding favors and they were perfect! Our guests loved them and the quality exceeded expectations.',
      rating: 5,
      product: 'Wedding Favor Collection',
      image: '/images/magnet2.jpeg'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      location: 'Birmingham',
      text: 'Fast delivery and excellent customer service. The business magnets with our logo look very professional.',
      rating: 5,
      product: 'Business Promotional Pack',
      image: '/images/magnet3.jpeg'
    }
  ]

  return (
    <div className="bg-gray-50">
      {/* Animated Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full animate-ping"></div>
          <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-white rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-extrabold text-white mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Premium Photo Magnets
            </motion.h1>
            <motion.p 
              className="text-xl text-pink-100 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform your favorite memories into beautiful, durable magnets that bring joy every day. 
              Professional quality printing with fast UK delivery.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                href="/custom"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold rounded-full text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🎨 Create Your Magnet
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="#products"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
              >
                📦 Browse Collection
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-pink-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⭐</span>
                <span className="text-lg font-semibold">5.0 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚚</span>
                <span className="text-lg font-semibold">Fast UK Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💝</span>
                <span className="text-lg font-semibold">Perfect Gifts</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8" id="products">
        
        {/* Category Filter */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeCategory === key
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          layout
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              layout
            >
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Savings Badge */}
              {product.savings && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
                    Save {product.savings}
                  </span>
                </div>
              )}
              
              {/* Image */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex flex-col items-end">
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">£{product.originalPrice}</span>
                    )}
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                      £{product.price}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {product.description}
                </p>
                
                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Link
                  href={product.link}
                  className="block w-full text-center py-4 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {product.category === 'business' || product.category === 'special' ? 'Get Quote' : 'Create Now'}
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div 
          className="mt-24 bg-white rounded-3xl p-12 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our Magnets?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                🎨
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Quality</h3>
              <p className="text-gray-600">Professional-grade printing with vibrant colors that last. Weather-resistant and durable materials.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Production</h3>
              <p className="text-gray-600">Your magnets are produced within 1-2 business days and shipped with tracking for peace of mind.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                💝
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Perfect Gifts</h3>
              <p className="text-gray-600">Personalized magnets make thoughtful gifts for any occasion. Loved by families worldwide.</p>
            </div>
          </div>
        </motion.div>

        {/* Customer Testimonials */}
        <motion.div 
          className="mt-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Happy Customers ❤️
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id} 
                className="bg-white p-8 rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Stars */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location} • {testimonial.product}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA Section */}
        <motion.div 
          className="mt-24 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 rounded-3xl p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-8 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-8 left-12 w-16 h-16 bg-white rounded-full animate-bounce"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Create Your Perfect Magnets? 🎯
            </h2>
            <p className="text-xl text-pink-100 mb-8 max-w-3xl mx-auto">
              Join thousands of happy customers who've turned their favorite photos into beautiful keepsakes. 
              Start creating your custom magnets today!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/custom"
                className="inline-flex items-center px-10 py-4 bg-white text-purple-600 font-bold rounded-full text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🚀 Start Creating Now
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-10 py-4 border-2 border-white text-white font-semibold rounded-full text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
              >
                💬 Need Help?
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 