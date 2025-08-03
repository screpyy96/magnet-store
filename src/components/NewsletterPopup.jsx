"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiMail, HiGift } from 'react-icons/hi';

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if popup was already shown/dismissed
    const wasShown = localStorage.getItem('newsletter-popup-shown');
    
    if (!wasShown) {
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('newsletter-popup-shown', 'true');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // TODO: Implement actual API call to save email and generate discount code
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('🎉 Welcome! Your 10% discount code: WELCOME10');
        setEmail('');
        
        // Auto close after 4 seconds
        setTimeout(() => {
          handleClose();
        }, 4000);
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      
      // Reset error after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            onClick={handleClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header with close button */}
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-700 px-6 pt-6 pb-8">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-200"
                >
                  <HiX className="h-6 w-6" />
                </button>
                
                {/* Decorative icons */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 text-yellow-400">
                      <HiGift className="h-8 w-8" />
                    </div>
                    <div className="bg-white/20 rounded-full p-3">
                      <HiMail className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                  Welcome! Get 10% Off
                </h2>
                <p className="text-indigo-100 text-center text-sm">
                  Subscribe for exclusive offers & magnet inspiration
                </p>
              </div>
              
              {/* Content */}
              <div className="px-6 pb-6">
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="text-4xl mb-3">🎉</div>
                    <p className="text-green-600 font-semibold mb-2">Success!</p>
                    <p className="text-gray-700 text-sm">{message}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="popup-email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email address
                        </label>
                        <input
                          id="popup-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                          placeholder="Enter your email"
                          disabled={status === 'loading'}
                        />
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {status === 'loading' ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Subscribing...
                          </div>
                        ) : (
                          'Get My 10% Discount'
                        )}
                      </motion.button>
                      
                      {message && status === 'error' && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-sm text-center"
                        >
                          {message}
                        </motion.p>
                      )}
                    </div>
                  </form>
                )}
                
                {status !== 'success' && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Exclusive offers
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        New products
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      We respect your privacy. Unsubscribe anytime.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 