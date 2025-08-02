'use client'

import { motion } from 'framer-motion'
import { FaShieldAlt, FaEye, FaLock, FaUser, FaCookieBite, FaEnvelope } from 'react-icons/fa'

export default function PrivacyPage() {
  const privacySections = [
    {
      title: "Information We Collect",
      icon: <FaUser className="h-8 w-8" />,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, place an order, or contact us. This may include your name, email address, phone number, shipping address, and payment information."
        },
        {
          subtitle: "Order Information",
          text: "When you place an order, we collect information about your purchases, including the products you buy, quantities, and any custom designs or personalization details."
        },
        {
          subtitle: "Technical Information",
          text: "We automatically collect certain information when you visit our website, including your IP address, browser type, device information, and pages you visit."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: <FaEye className="h-8 w-8" />,
      content: [
        {
          subtitle: "Order Processing",
          text: "We use your information to process and fulfill your orders, communicate with you about your orders, and provide customer support."
        },
        {
          subtitle: "Account Management",
          text: "Your information helps us create and manage your account, save your preferences, and provide personalized experiences."
        },
        {
          subtitle: "Communication",
          text: "We may use your contact information to send you order confirmations, shipping updates, and marketing communications (with your consent)."
        },
        {
          subtitle: "Improvement",
          text: "We analyze usage data to improve our website, products, and services, and to develop new features."
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: <FaShieldAlt className="h-8 w-8" />,
      content: [
        {
          subtitle: "Service Providers",
          text: "We share information with trusted third-party service providers who help us operate our business, such as payment processors, shipping partners, and website hosting services."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required by law or to protect our rights, property, or safety, or that of our customers or others."
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction."
        }
      ]
    },
    {
      title: "Data Security",
      icon: <FaLock className="h-8 w-8" />,
      content: [
        {
          subtitle: "Protection Measures",
          text: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
        },
        {
          subtitle: "Secure Payments",
          text: "All payment information is processed securely through Stripe, and we never store your full credit card details on our servers."
        },
        {
          subtitle: "Data Retention",
          text: "We retain your information for as long as necessary to provide our services and comply with legal obligations."
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
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              We respect your privacy and are committed to protecting your personal information.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Privacy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-lg text-gray-600">
            Last updated: January 15, 2025
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Introduction
          </h2>
          <p className="text-gray-600 leading-relaxed">
            My Sweet Magnets Ltd ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make purchases from us. By using our services, you agree to the collection and use of information in accordance with this policy.
          </p>
        </motion.div>

        {/* Privacy Sections */}
        {privacySections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <div className="text-pink-500 mr-3">
                {section.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {section.title}
              </h2>
            </div>
            
            <div className="space-y-6">
              {section.content.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.subtitle}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Cookies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <div className="text-pink-500 mr-3">
              <FaCookieBite className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Cookies and Tracking
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What Are Cookies?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Cookies are small text files stored on your device that help us provide a better experience. They remember your preferences, analyze site traffic, and personalize content.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How We Use Cookies
              </h3>
              <ul className="text-gray-600 leading-relaxed space-y-2">
                <li>• Essential cookies for website functionality</li>
                <li>• Analytics cookies to understand site usage</li>
                <li>• Preference cookies to remember your settings</li>
                <li>• Marketing cookies for personalized content</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Managing Cookies
              </h3>
              <p className="text-gray-600 leading-relaxed">
                You can control cookies through your browser settings. However, disabling certain cookies may affect website functionality. We'll ask for your consent before using non-essential cookies.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">
            Your Rights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Access and Update</h3>
              <p className="opacity-90 text-sm">
                You can access and update your personal information through your account dashboard or by contacting us.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Deletion</h3>
              <p className="opacity-90 text-sm">
                You can request deletion of your personal information, subject to legal and business requirements.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Marketing Preferences</h3>
              <p className="opacity-90 text-sm">
                You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Data Portability</h3>
              <p className="opacity-90 text-sm">
                You can request a copy of your personal information in a portable format.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="flex justify-center mb-4">
            <FaEnvelope className="h-8 w-8 text-pink-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Contact Us
          </h3>
          <p className="text-gray-600 mb-6">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">
              Email: privacy@mysweetmagnets.co.uk
            </p>
            <p className="text-gray-900 font-medium">
              Phone: 0800 123 4567
            </p>
            <p className="text-gray-900 font-medium">
              Address: My Sweet Magnets Ltd, Manchester, UK
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 