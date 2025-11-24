'use client'

import { motion } from 'framer-motion'
import { FaGavel, FaFileContract, FaShieldAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'

export default function TermsPage() {
  const termsSections = [
    {
      title: "Acceptance of Terms",
      icon: <FaFileContract className="h-8 w-8" />,
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing and using the My Sweet Magnets website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        },
        {
          subtitle: "Modifications",
          text: "We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page. Your continued use of the service after such modifications constitutes acceptance of the updated terms."
        }
      ]
    },
    {
      title: "Use of Service",
      icon: <FaCheckCircle className="h-8 w-8" />,
      content: [
        {
          subtitle: "Eligibility",
          text: "You must be at least 18 years old to use our service. By using our service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these terms."
        },
        {
          subtitle: "Account Registration",
          text: "You may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account."
        },
        {
          subtitle: "Prohibited Uses",
          text: "You agree not to use the service for any unlawful purpose or to solicit others to perform unlawful acts. You may not upload content that is offensive, harmful, or violates any third-party rights."
        }
      ]
    },
    {
      title: "Product Information",
      icon: <FaShieldAlt className="h-8 w-8" />,
      content: [
        {
          subtitle: "Product Descriptions",
          text: "We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free."
        },
        {
          subtitle: "Custom Orders",
          text: "For custom magnets, you are responsible for providing appropriate images and ensuring you have the rights to use them. We reserve the right to refuse orders that violate intellectual property rights."
        },
        {
          subtitle: "Quality Standards",
          text: "We maintain high quality standards for all our products. If you receive a defective product, please contact us within 48 hours of delivery for a replacement or refund."
        }
      ]
    },
    {
      title: "Ordering and Payment",
      icon: <FaGavel className="h-8 w-8" />,
      content: [
        {
          subtitle: "Order Acceptance",
          text: "All orders are subject to acceptance by us. We reserve the right to refuse any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraud."
        },
        {
          subtitle: "Payment Terms",
          text: "Payment is due at the time of order placement. We accept major credit cards, PayPal, and Apple Pay. All payments are processed securely through Stripe."
        },
        {
          subtitle: "Pricing",
          text: "All prices are in British Pounds (GBP) and include VAT where applicable. We reserve the right to change prices at any time. Price changes will not affect orders already placed."
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
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Please read these terms carefully before using our services.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Terms Content */}
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
            These Terms of Service ("Terms") govern your use of the My Sweet Magnets website and services operated by My Sweet Magnets Ltd ("we," "our," or "us"). By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access our services.
          </p>
        </motion.div>

        {/* Terms Sections */}
        {termsSections.map((section, index) => (
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

        {/* Intellectual Property */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <div className="text-pink-500 mr-3">
              <FaShieldAlt className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Intellectual Property
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Our Rights
              </h3>
              <p className="text-gray-600 leading-relaxed">
                The service and its original content, features, and functionality are owned by My Sweet Magnets Ltd and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Content
              </h3>
              <p className="text-gray-600 leading-relaxed">
                By uploading images for custom magnets, you grant us a limited license to use those images solely for the purpose of creating your magnets. You represent that you have the right to grant this license.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Copyright Infringement
              </h3>
              <p className="text-gray-600 leading-relaxed">
                If you believe that your intellectual property rights have been violated, please contact us at orders@mysweetmagnets.co.uk with detailed information about the alleged infringement.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Limitation of Liability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <FaExclamationTriangle className="h-8 w-8 mr-3" />
            <h2 className="text-2xl font-bold">
              Limitation of Liability
            </h2>
          </div>
          
          <div className="space-y-4 opacity-90">
            <p>
              In no event shall My Sweet Magnets Ltd, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
            </p>
            <p>
              Our total liability to you for any claims arising from the use of our service shall not exceed the amount you paid us in the twelve months preceding the claim.
            </p>
          </div>
        </motion.div>

        {/* Disclaimers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Disclaimers
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Service Availability
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We do not guarantee that the service will be available at all times. We may suspend or discontinue the service at any time without notice.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Third-Party Services
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our service may contain links to third-party websites or services. We are not responsible for the content or practices of any third-party services.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Product Warranties
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Products are provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to warranties of merchantability and fitness for a particular purpose.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Governing Law */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">
            Governing Law
          </h3>
          <p className="text-lg mb-6 opacity-90">
            These Terms shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Legal Contact</h4>
              <p className="opacity-90">orders@mysweetmagnets.co.uk</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">General Contact</h4>
              <p className="opacity-90">orders@mysweetmagnets.co.uk</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 