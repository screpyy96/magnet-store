'use client';

import React from 'react';

export default function PackageProgress({
  selectedPackage,
  currentPackageImages,
  imagesForCurrentPackageCount
}) {
  
  if (parseInt(selectedPackage.id) <= 1) {
    return null;
  }

  const packageSize = parseInt(selectedPackage.id);
  const progressPercentage = Math.min((imagesForCurrentPackageCount / packageSize) * 100, 100);
  const remainingImages = packageSize - imagesForCurrentPackageCount;

  return (
    <div className="mt-4 bg-pink-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-pink-900">Package Progress</h3>
        <span className="text-xs text-pink-600">
          {imagesForCurrentPackageCount} / {selectedPackage.id} images
        </span>
      </div>
      <div className="w-full bg-pink-200 rounded-full h-2 mb-2">
        <div 
          className="bg-pink-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <p className="text-xs text-pink-700">
        {remainingImages > 0 
          ? `${remainingImages} more images needed`
          : '✅ All images uploaded! Click "Proceed to Checkout" below.'
        }
      </p>
    </div>
  );
} 