'use client';

import React from 'react';

const PACKAGES = [
  {
    id: '1',
    name: '1 Custom Magnet',
    price: 5,
    pricePerUnit: 5,
    description: 'Single magnet for testing or small gifts',
    tag: 'SINGLE',
    maxFiles: 1
  },
  {
    id: '6',
    name: '6 Custom Magnets',
    price: 17.00,
    pricePerUnit: 2.83,
    description: 'Perfect for small gifts or personal use',
    tag: 'BEST VALUE',
    maxFiles: 6
  },
  {
    id: '9',
    name: '9 Custom Magnets',
    price: 23.00,
    pricePerUnit: 2.55,
    description: 'Great for families and small collections',
    tag: 'POPULAR',
    maxFiles: 9
  },
  {
    id: '12',
    name: '12 Custom Magnets',
    price: 28.00,
    pricePerUnit: 2.33,
    description: 'Ideal for large families or multiple designs',
    tag: 'BEST SELLER',
    maxFiles: 12
  }
];

export default function PackageSelector({ selectedPackage, onPackageSelect }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-200 p-6">
      <h1 className="text-2xl font-bold text-pink-900 mb-2">Custom Photo Magnet</h1>
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-3xl font-bold text-pink-900">£{selectedPackage?.price.toFixed(2)}</span>
        {selectedPackage?.id !== '1' && (
          <span className="text-sm text-pink-500">
            £{selectedPackage?.pricePerUnit.toFixed(2)} each
          </span>
        )}
      </div>
      
      {/* Package Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-pink-900 mb-3">
          QUANTITY
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => onPackageSelect(pkg)}
              className={`p-3 border rounded-lg text-center transition-colors relative ${
                selectedPackage?.id === pkg.id
                  ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500'
                  : 'border-pink-200 hover:border-pink-300'
              }`}
            >
              {pkg.tag && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                  {pkg.tag}
                </span>
              )}
              <div className="font-medium text-pink-900">{pkg.name}</div>
              <div className="text-lg font-bold text-pink-600">£{pkg.price.toFixed(2)}</div>
              <div className="text-xs text-pink-500">{pkg.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
