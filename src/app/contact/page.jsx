
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiMail, HiPhone, HiLocationMarker, HiClock } from 'react-icons/hi'


export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitSuccess(false)
    setSubmitError(false)
    
    // Simulate form submission
    try {
      // Here would be the code to send the form to the server
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      setSubmitError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: HiMail,
      title: 'Email',
      details: 'contact@mysweetmagnets.co.uk',
      action: 'mailto:contact@mysweetmagnets.co.uk',
      actionText: 'Send Email'
    },
    {
      icon: HiPhone,
      title: 'Phone',
      details: '07901 145 111',
      action: 'tel:+447901145111',
      actionText: 'Call Us'
    },
    {
      icon: HiLocationMarker,
      title: 'Address',
      details: '123 Oxford Street, London, UK',
      action: 'https://maps.google.com/?q=Oxford+Street+London+UK',
      actionText: 'Get Directions'
    },
    {
      icon: HiClock,
      title: 'Working Hours',
      details: 'Mon-Fri: 9AM - 6PM',
      action: null,
      actionText: null
    }
  ]

  const faqs = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 2-3 business days within the UK. International shipping may take 7-14 business days depending on the destination.'
    },
    {
      question: 'What file formats do you accept for custom magnets?',
      answer: 'We accept JPG, PNG, and HEIC files. For best results, we recommend high-resolution images (at least 300 DPI).'
    },
    {
      question: 'Can I cancel or modify my order?',
      answer: 'Orders can be modified or cancelled within 2 hours of placing them. Please contact our customer service team immediately if you need to make changes.'
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes! We offer discounts for orders of 20+ magnets. Contact us for a custom quote for your bulk order.'
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
              Get in Touch
            </h1>
            <p className="text-lg text-pink-50/90 max-w-2xl mx-auto">
              We'd love to hear from you! Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-pink-100"
            >
              <div className="bg-pink-100 p-3 rounded-full mb-4">
                <item.icon className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-700 mb-4">{item.details}</p>
              {item.action && (
                <a 
                  href={item.action} 
                  className="text-pink-600 hover:text-purple-600 font-medium"
                  target={item.action.startsWith('http') ? '_blank' : undefined}
                  rel={item.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {item.actionText}
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Form and Map Section */}
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 border border-pink-100"
          >
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-6">Send Us a Message</h2>
            
            {submitSuccess && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p>Thank you for your message! We'll get back to you soon.</p>
              </div>
            )}
            
            {submitError && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>There was an error sending your message. Please try again later.</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-xl font-semibold hover:opacity-95 transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
          
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 backdrop-blur rounded-2xl shadow-xl overflow-hidden h-full border border-pink-100"
          >
            <div className="h-full min-h-[400px] w-full bg-gray-200 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30451.798919034725!2d-2.2700!3d53.4808!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487bb1bd4b4b3cb1%3A0xeadb2e0d2b4a!2sManchester%2C%20UK!5e0!3m2!1sen!2suk!4v1709650000001"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="My Sweet Magnets Location"
                className="absolute inset-0"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-600">Find answers to common questions about our products and services</p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-gray-600">
              Can't find what you're looking for?{' '}
              <a href="#contact-form" className="text-indigo-600 font-medium hover:text-indigo-800">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to create your custom magnets?</span>
            <span className="block text-pink-100/90">Start designing today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <a
                href="/custom"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-pink-700 bg-white hover:bg-pink-50"
              >
                Get Started
              </a>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="/products"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-purple-600"
              >
                View Products
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
