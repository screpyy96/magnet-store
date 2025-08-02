'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaCalendar, FaUser, FaTags, FaArrowRight } from 'react-icons/fa'

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "10 Creative Ways to Display Your Photo Magnets",
      excerpt: "Discover innovative and beautiful ways to showcase your personalised magnets beyond just the fridge. From magnetic boards to gallery walls, we'll show you how to turn your magnets into stunning home decor.",
      author: "Emma & Sophie",
      date: "2025-01-15",
      category: "Home Decor",
      image: "/images/magnet1.jpeg",
      slug: "creative-ways-display-photo-magnets"
    },
    {
      id: 2,
      title: "The Perfect Gift: Why Personalised Magnets Make the Best Presents",
      excerpt: "Looking for a thoughtful, unique gift? Personalised magnets are the perfect solution. We'll share why they're becoming the go-to gift choice and how to choose the perfect design for your loved ones.",
      author: "My Sweet Magnets Team",
      date: "2025-01-10",
      category: "Gift Ideas",
      image: "/images/magnet2.jpeg",
      slug: "perfect-gift-personalised-magnets"
    },
    {
      id: 3,
      title: "Behind the Scenes: How We Create Your Custom Magnets",
      excerpt: "Ever wondered how your photos become beautiful magnets? Take a peek behind the scenes at our Manchester workshop and see the care and craftsmanship that goes into every single magnet we create.",
      author: "Emma & Sophie",
      date: "2025-01-05",
      category: "Behind the Scenes",
      image: "/images/magnet3.jpeg",
      slug: "behind-scenes-create-custom-magnets"
    },
    {
      id: 4,
      title: "Customer Spotlight: Sarah's Wedding Memory Wall",
      excerpt: "Meet Sarah, who used our custom magnets to create a beautiful memory wall for her wedding photos. See how she transformed her kitchen into a gallery of precious moments.",
      author: "My Sweet Magnets Team",
      date: "2024-12-28",
      category: "Customer Stories",
      image: "/images/magnet4.jpeg",
      slug: "customer-spotlight-sarah-wedding-memory-wall"
    },
    {
      id: 5,
      title: "DIY Magnetic Photo Frame: A Fun Weekend Project",
      excerpt: "Get crafty with our step-by-step guide to creating your own magnetic photo frame. Perfect for displaying your My Sweet Magnets in a unique and personal way.",
      author: "Emma & Sophie",
      date: "2024-12-20",
      category: "DIY Projects",
      image: "/images/magnet5.jpeg",
      slug: "diy-magnetic-photo-frame-weekend-project"
    },
    {
      id: 6,
      title: "The Science Behind Magnetic Memories: Why We Love Photo Magnets",
      excerpt: "Explore the psychology behind why we're drawn to displaying photos and how magnets make it easier than ever to keep our precious memories visible and accessible every day.",
      author: "My Sweet Magnets Team",
      date: "2024-12-15",
      category: "Psychology",
      image: "/images/magnet6.jpeg",
      slug: "science-behind-magnetic-memories"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              My Sweet Magnets Blog
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Stories, tips, and inspiration for creating beautiful memories with personalised magnets
            </p>
          </motion.div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white text-6xl">
                  🧲
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <FaCalendar className="mr-2" />
                  <span>{new Date(post.date).toLocaleDateString('en-GB', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  <span className="mx-2">•</span>
                  <FaUser className="mr-2" />
                  <span>{post.author}</span>
                </div>
                
                <div className="mb-3">
                  <span className="inline-block bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {post.category}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
                >
                  Read More
                  <FaArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Stay Updated with Our Latest Posts
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get notified when we publish new articles about magnets, DIY projects, customer stories, and more. Plus, receive exclusive offers and 10% off your first order!
          </p>
          <form className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 