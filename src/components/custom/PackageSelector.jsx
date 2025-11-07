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
    tag: 'POPULAR',
    maxFiles: 6
  },
  {
    id: '9',
    name: '9 Custom Magnets',
    price: 23.00,
    pricePerUnit: 2.55,
    description: 'Great for families and small collections',
    tag: 'BEST VALUE',
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
  },
  {
    id: '16',
    name: '16 Custom Magnets',
    price: 36.00,
    pricePerUnit: 2.25,
    description: 'Ideal for businesses and bulk orders',
    tag: 'BULK SAVER',
    maxFiles: 16
  }
];

export default function PackageSelector({ selectedPackage, onPackageSelect }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-200 p-4 lg:p-6">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div>
          <h2 className="text-lg lg:text-2xl font-bold text-pink-900">Choose Package</h2>
          {selectedPackage && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl lg:text-2xl font-bold text-pink-600">£{selectedPackage.price.toFixed(2)}</span>
              {selectedPackage.id !== '1' && (
                <span className="text-xs lg:text-sm text-pink-500">
                  £{selectedPackage.pricePerUnit.toFixed(2)} each
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Package Selection - Horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 hide-scrollbar">
        <div className="flex lg:grid lg:grid-cols-5 gap-3 pb-2 lg:pb-0 pt-3">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => onPackageSelect(pkg)}
              className={`flex-shrink-0 w-32 lg:w-auto p-3 lg:p-4 border-2 rounded-xl text-center transition-all relative ${
                selectedPackage?.id === pkg.id
                  ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-400 shadow-lg'
                  : 'border-gray-200 hover:border-pink-300 bg-white shadow-sm'
              }`}
            >
              {pkg.tag && pkg.tag !== 'SINGLE' && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] lg:text-[10px] px-2 py-1 rounded-full font-bold whitespace-nowrap shadow-md z-10">
                  {pkg.tag}
                </span>
              )}
              <div className="font-bold text-2xl lg:text-3xl text-gray-900 mb-0.5">{pkg.maxFiles}</div>
              <div className="text-xs text-gray-600 mb-2">magnets</div>
              <div className="text-base lg:text-lg font-bold text-pink-600">£{pkg.price.toFixed(2)}</div>
              {pkg.pricePerUnit < 3 && pkg.id !== '1' && (
                <div className="text-[10px] text-green-600 mt-1">Save £{(5 - pkg.pricePerUnit).toFixed(2)}/ea</div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      
      {/* Mobile swipe hint */}
      <div className="lg:hidden mt-3 text-center">
        <p className="text-xs text-gray-400">← Swipe to see all →</p>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
