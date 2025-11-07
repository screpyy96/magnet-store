'use client'

import { motion } from 'framer-motion'
import { FaUndo, FaShieldAlt, FaClock, FaBox, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

export default function ReturnsPage() {
  const returnPolicy = [
    {
      title: "30-Day Returns",
      description: "We offer a 30-day return window for all unused items in their original packaging. Your satisfaction is our priority.",
      icon: <FaUndo className="h-8 w-8" />
    },
    {
      title: "Quality Guarantee",
      description: "If your magnets arrive damaged or don't meet our quality standards, we'll replace them free of charge.",
      icon: <FaShieldAlt className="h-8 w-8" />
    },
    {
      title: "Easy Process",
      description: "Start your return online through your account dashboard or contact our customer service team for assistance.",
      icon: <FaCheckCircle className="h-8 w-8" />
    },
    {
      title: "Free Returns",
      description: "We cover return shipping costs for damaged or defective items. Standard returns require return shipping.",
      icon: <FaBox className="h-8 w-8" />
    }
  ]

  const returnSteps = [
    {
      step: "1",
      title: "Contact Us",
      description: "Email us at returns@mysweetmagnets.co.uk or use the return form in your account dashboard within 30 days of delivery."
    },
    {
      step: "2",
      title: "Get Approval",
      description: "We'll review your return request and send you a return authorization number and shipping label if applicable."
    },
    {
      step: "3",
      title: "Ship Back",
      description: "Package your items securely and ship them back using the provided label or your own shipping method."
    },
    {
      step: "4",
      title: "Receive Refund",
      description: "Once we receive and inspect your return, we'll process your refund within 3-5 business days."
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
              Returns Policy
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              We want you to love your magnets. If you're not completely satisfied, we're here to help.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Policy Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Return Policy
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We stand behind the quality of our magnets. If you're not completely satisfied, we'll make it right.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {returnPolicy.map((policy, index) => (
            <motion.div
              key={policy.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-pink-500 mb-4 flex justify-center">
                {policy.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {policy.title}
              </h3>
              <p className="text-gray-600">
                {policy.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Return Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How to Return Your Order
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {returnSteps.map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Important Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <FaCheckCircle className="mr-3" />
              What We Accept
            </h3>
            <ul className="space-y-2 text-sm">
              <li>• Unused items in original packaging</li>
              <li>• Items received damaged or defective</li>
              <li>• Wrong items received</li>
              <li>• Items not as described</li>
              <li>• Returns within 30 days of delivery</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <FaTimesCircle className="mr-3" />
              What We Don't Accept
            </h3>
            <ul className="space-y-2 text-sm">
              <li>• Used or damaged items</li>
              <li>• Items missing original packaging</li>
              <li>• Returns after 30 days</li>
              <li>• Items purchased on sale or clearance</li>
              <li>• Custom orders (unless defective)</li>
            </ul>
          </motion.div>
        </div>

        {/* Refund Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Refund Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Refund Timeline</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Processing time: 3-5 business days</li>
                <li>• Credit card refunds: 5-10 business days</li>
                <li>• PayPal refunds: 3-5 business days</li>
                <li>• Bank transfers: 7-14 business days</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">What You'll Receive</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Full refund for damaged/defective items</li>
                <li>• Full refund minus shipping for unused returns</li>
                <li>• Return shipping covered for defective items</li>
                <li>• Email confirmation when refund is processed</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">
            Need Help with Your Return?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Our customer service team is here to help with any questions about returns or refunds.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Email Us</h4>
              <p className="opacity-90">returns@mysweetmagnets.co.uk</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Live Chat</h4>
              <p className="opacity-90">Available 9am-5pm GMT</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 