'use client';

import React from 'react';
import ImageUploader from './ImageUploader';

export default function UploadArea({ 
  selectedPackage, 
  imagesForCurrentPackageCount, 
  onFileChange 
}) {
  
  if (!selectedPackage) {
    return (
      <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-gray-700">
            Please select a package first to start uploading images.
          </p>
        </div>
      </div>
    );
  }
  
  const isPackageComplete = imagesForCurrentPackageCount >= parseInt(selectedPackage.id);
  
  if (isPackageComplete) {
    return (
      <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-700">
            Upload disabled - Package is complete. You can still edit your images above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-base font-medium text-pink-900 mb-2">Upload Your Images</h3>
      <ImageUploader
        onFileChange={onFileChange}
        maxFiles={selectedPackage?.maxFiles || 1}
      />
    </div>
  );
} 