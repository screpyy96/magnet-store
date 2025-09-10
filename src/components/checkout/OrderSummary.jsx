'use client';

import { motion } from 'framer-motion';

export default function OrderSummary({ 
  onPlaceOrder, 
  isLoading, 
  error, 
  totalPrice, 
  shippingCost = 0, 
  discount = 0,
  showAction = true,
}) {
  // Calculăm totalul final
  const finalTotal = (totalPrice || 0) + (shippingCost || 0) - (discount || 0);
  
  // Formatare monedă
  const formatCurrency = (value) => {
    return `£${value.toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
      
      {/* Detaliile comenzii */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">{formatCurrency(totalPrice || 0)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="font-medium">
            {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
          </span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{formatCurrency(discount)}</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3 mt-3"></div>
        
        <div className="flex justify-between text-gray-800">
          <span className="font-bold">Total</span>
          <span className="font-bold text-xl text-indigo-600">{formatCurrency(finalTotal)}</span>
        </div>
      </div>
      
      {/* Informații de livrare și securitate */}
      <div className="flex flex-col gap-2 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Free UK Delivery on orders over £50</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secure payment processing</span>
        </div>
      </div>
      
      {/* Afișăm eroarea dacă există */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {/* Butonul de comandă (ascuns când Stripe controlează plata) */}
      {showAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPlaceOrder}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Place Order</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          )}
        </motion.button>
      )}
    </motion.div>
  );
}
