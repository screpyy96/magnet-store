'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaChevronDown, FaChevronUp, FaQuestionCircle, FaShoppingCart, FaTruck, FaCreditCard, FaUser } from 'react-icons/fa'

export default function FAQPage() {
  const [openItems, setOpenItems] = useState(new Set())

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  const faqCategories = [
    {
      title: "General Questions",
      icon: <FaQuestionCircle className="h-6 w-6" />,
      questions: [
        {
          id: "general-1",
          question: "What are My Sweet Magnets?",
          answer: "My Sweet Magnets are high-quality, personalised fridge magnets made from your photos. We print your images onto durable magnetic material, creating beautiful keepsakes that last. Each magnet is crafted with care in our Manchester workshop."
        },
        {
          id: "general-2",
          question: "How long do the magnets last?",
          answer: "Our magnets are designed to last for years with proper care. They're printed on high-quality magnetic material that resists fading and maintains its magnetic strength. We recommend keeping them away from direct sunlight and extreme temperatures for best results."
        },
        {
          id: "general-3",
          question: "What sizes do you offer?",
          answer: "We offer magnets in various sizes including 5cm, 7cm, 10cm, and 15cm diameters. We also have rectangular options and can create custom sizes for special orders. Each size is perfect for different types of photos and display preferences."
        },
        {
          id: "general-4",
          question: "Are your magnets safe for all fridges?",
          answer: "Yes! Our magnets are safe for all types of refrigerators including stainless steel, painted metal, and other magnetic surfaces. They're designed to hold securely without damaging your fridge surface."
        }
      ]
    },
    {
      title: "Ordering & Payment",
      icon: <FaShoppingCart className="h-6 w-6" />,
      questions: [
        {
          id: "ordering-1",
          question: "How do I place an order?",
          answer: "Ordering is easy! Simply upload your photos, choose your magnet size and quantity, add them to your cart, and proceed to checkout. You can pay securely with credit card, PayPal, or Apple Pay. We'll email you confirmation and tracking details."
        },
        {
          id: "ordering-2",
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. All payments are processed securely through Stripe, and we never store your payment information."
        },
        {
          id: "ordering-3",
          question: "Can I order custom sizes?",
          answer: "Yes! We offer custom sizes for special orders. Contact us at custom@mysweetmagnets.co.uk with your requirements and we'll provide a quote. Custom orders typically take 5-7 business days to process."
        },
        {
          id: "ordering-4",
          question: "Do you offer bulk discounts?",
          answer: "Absolutely! We offer discounts for larger orders. Orders of 10+ magnets receive a 10% discount, 25+ magnets get 15% off, and 50+ magnets get 20% off. Contact us for custom pricing on very large orders."
        }
      ]
    },
    {
      title: "Shipping & Delivery",
      icon: <FaTruck className="h-6 w-6" />,
      questions: [
        {
          id: "shipping-1",
          question: "How long does shipping take?",
          answer: "Standard UK delivery takes 3-5 business days, while express delivery takes 1-2 business days. We process orders within 1-2 business days, so total time from order to delivery is typically 4-7 days for standard shipping."
        },
        {
          id: "shipping-2",
          question: "Do you ship internationally?",
          answer: "Currently, we only ship within the UK (including Northern Ireland, Isle of Man, and Channel Islands). We're working on expanding our international shipping options and will announce when they become available."
        },
        {
          id: "shipping-3",
          question: "How much does shipping cost?",
          answer: "Standard UK delivery is £2.99, express delivery is £4.99, and orders over £25 qualify for free standard delivery. We also offer free shipping on all orders during promotional periods."
        },
        {
          id: "shipping-4",
          question: "Can I track my order?",
          answer: "Yes! We'll email you a tracking number once your order ships. You can also check your order status in your account dashboard. Royal Mail tracking is available for all UK deliveries."
        }
      ]
    },
    {
      title: "Account & Customer Service",
      icon: <FaUser className="h-6 w-6" />,
      questions: [
        {
          id: "account-1",
          question: "How do I create an account?",
          answer: "Creating an account is easy! Click 'Sign Up' in the top navigation and enter your email and password. You can also sign up with Google for faster registration. Having an account lets you track orders, save addresses, and access exclusive offers."
        },
        {
          id: "account-2",
          question: "How do I contact customer service?",
          answer: "We're here to help! Email us at hello@mysweetmagnets.co.uk, call us at 0800 123 4567, or use our live chat feature (available 9am-5pm GMT). We typically respond within 2 hours during business hours."
        },
        {
          id: "account-3",
          question: "Can I change or cancel my order?",
          answer: "You can modify or cancel your order within 2 hours of placing it by contacting our customer service team. After that, orders are processed and cannot be changed. If you need to return an item, please see our returns policy."
        },
        {
          id: "account-4",
          question: "Do you have a loyalty program?",
          answer: "Yes! Join our Sweet Rewards program to earn points on every purchase. Points can be redeemed for discounts on future orders. You'll also get exclusive access to new designs and special offers."
        }
      ]
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
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Find answers to common questions about our magnets, ordering, shipping, and more.
            </p>
          </motion.div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {faqCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center mb-6">
              <div className="text-pink-500 mr-3">
                {category.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {category.title}
              </h2>
            </div>

            <div className="space-y-4">
              {category.questions.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">
                      {item.question}
                    </span>
                    {openItems.has(item.id) ? (
                      <FaChevronUp className="text-pink-500 flex-shrink-0" />
                    ) : (
                      <FaChevronDown className="text-pink-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openItems.has(item.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">
            Still Have Questions?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Can't find what you're looking for? Our friendly customer service team is here to help!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Email Us</h4>
              <p className="opacity-90">hello@mysweetmagnets.co.uk</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Call Us</h4>
              <p className="opacity-90">0800 123 4567</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Live Chat</h4>
              <p className="opacity-90">Available 9am-5pm GMT</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12 bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/shipping" className="text-pink-600 hover:text-pink-700 font-medium text-center p-3 rounded-lg hover:bg-pink-50 transition-colors">
              Shipping Info
            </a>
            <a href="/returns" className="text-pink-600 hover:text-pink-700 font-medium text-center p-3 rounded-lg hover:bg-pink-50 transition-colors">
              Returns Policy
            </a>
            <a href="/contact" className="text-pink-600 hover:text-pink-700 font-medium text-center p-3 rounded-lg hover:bg-pink-50 transition-colors">
              Contact Us
            </a>
            <a href="/custom" className="text-pink-600 hover:text-pink-700 font-medium text-center p-3 rounded-lg hover:bg-pink-50 transition-colors">
              Custom Magnets
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 