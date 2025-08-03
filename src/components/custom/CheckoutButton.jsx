'use client';

import React from 'react';

export default function CheckoutButton({
  selectedPackage,
  imagesForCurrentPackageCount,
  user,
  showToast,
  router
}) {
  
  const isPackageComplete = imagesForCurrentPackageCount >= parseInt(selectedPackage.id);
  
  if (!isPackageComplete) {
    return null;
  }

  return (
    <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-sm font-medium text-green-900">Package Complete!</h3>
        </div>
        <span className="text-xs text-green-600 font-medium">
          £{selectedPackage.price.toFixed(2)}
        </span>
      </div>
      <p className="text-xs text-green-700 mb-3">
        All {selectedPackage.id} images uploaded successfully. Ready to proceed to checkout!
      </p>
      <button
        onClick={() => {
          if (!user) {
            showToast('Please log in to continue with your order', 'warning');
            router.push('/login?redirect=/custom');
            return;
          }
          router.push('/checkout');
        }}
        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
        Proceed to Checkout
      </button>
    </div>
  );
} 