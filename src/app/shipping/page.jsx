'use client'

import { motion } from 'framer-motion'
import { FaTruck, FaClock, FaMapMarkerAlt, FaBox, FaShieldAlt, FaCheckCircle } from 'react-icons/fa'

export default function ShippingPage() {
  const shippingOptions = [
    {
      name: "Free UK Delivery",
      price: "FREE",
      time: "",
      description: "Free delivery on all UK orders",
      icon: <FaCheckCircle className="h-6 w-6" />
    },
    {
      name: "International Delivery",
      price: "£9.99+",
      time: "7-14 business days",
      description: "Worldwide shipping available",
      icon: <FaTruck className="h-6 w-6" />
    }
  ]

  const deliveryInfo = [
    {
      title: "Processing Time",
      description: "We process and create your custom magnets within 1-2 business days of receiving your order. Each magnet is carefully crafted by hand in our Manchester workshop.",
      icon: <FaClock className="h-8 w-8" />
    },
    {
      title: "UK Delivery Areas",
      description: "We deliver to all UK addresses including England, Scotland, Wales, and Northern Ireland. We also ship to Isle of Man and Channel Islands.",
      icon: <FaMapMarkerAlt className="h-8 w-8" />
    },
    {
      title: "Package Protection",
      description: "Your magnets are carefully packaged in protective sleeves and sturdy boxes to ensure they arrive in perfect condition.",
      icon: <FaBox className="h-8 w-8" />
    },
    {
      title: "Delivery Guarantee",
      description: "We guarantee safe delivery of your magnets. If your order arrives damaged, we'll replace it free of charge.",
      icon: <FaShieldAlt className="h-8 w-8" />
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
              Shipping Information
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Fast, reliable delivery across the UK. Your magnets are crafted with care and delivered safely to your door.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Shipping Options */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Delivery Options
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the delivery option that works best for you. All orders are processed within 1-2 business days.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {shippingOptions.map((option, index) => (
            <motion.div
              key={option.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-pink-500 mb-4 flex justify-center">
                {option.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {option.name}
              </h3>
              <div className="text-3xl font-bold text-pink-600 mb-2">
                {option.price}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {option.time}
              </div>
              <p className="text-gray-600">
                {option.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Delivery Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {deliveryInfo.map((info, index) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-start space-x-4">
                <div className="text-pink-500 flex-shrink-0">
                  {info.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {info.title}
                  </h3>
                  <p className="text-gray-600">
                    {info.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Important Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-4">
            Important Shipping Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Order Processing</h4>
              <ul className="space-y-1 text-sm opacity-90">
                <li>• Orders placed before 2pm are processed same day</li>
                <li>• Custom magnets take 1-2 business days to create</li>
                <li>• We'll email you when your order ships</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Delivery Notes</h4>
              <ul className="space-y-1 text-sm opacity-90">
                <li>• Signature may be required for orders over £50</li>
                <li>• We cannot deliver to PO Box addresses</li>
                <li>• International shipping available worldwide</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                When will I receive my order?
              </h4>
              <p className="text-gray-600">
                Most UK orders arrive within 3-5 business days. International orders take 7-14 business days. We'll email you tracking information once your order ships.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Do you ship internationally?
              </h4>
              <p className="text-gray-600">
                Yes! We ship worldwide. International shipping starts at £9.99 and typically takes 7-14 business days depending on your location.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                What if my order arrives damaged?
              </h4>
              <p className="text-gray-600">
                We carefully package all orders, but if your magnets arrive damaged, please contact us within 48 hours with photos. We'll replace them free of charge.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I track my order?
              </h4>
              <p className="text-gray-600">
                Yes! We'll send you a tracking number via email once your order ships. You can also check your order status in your account dashboard.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 