import { useState } from 'react';

const SIZES = [
  {
    id: '5x5',
    name: '5×5cm',
    dimensions: '5cm × 5cm',
    description: 'Perfect square magnet',
    popular: true
  }
];

const FINISHES = [
  {
    id: 'rigid',
    name: 'Rigid',
    description: 'Hard magnetic backing, extra strong hold',
    popular: true
  },
  {
    id: 'flexible',
    name: 'Flexible',
    description: 'Soft vinyl finish, easy to bend',
    comingSoon: true
  }
];

export default function ProductOptions({ 
  selectedSize = '5x5', 
  selectedFinish = 'rigid',
  onSizeChange,
  onFinishChange 
}) {
  return (
    <div className="space-y-6">
      {/* Size Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          SIZE
        </label>
        <div className="grid grid-cols-1 gap-3">
          {SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => onSizeChange?.(size.id)}
              className={`relative flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedSize === size.id
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedSize === size.id 
                    ? 'border-indigo-500 bg-indigo-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedSize === size.id && (
                    <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{size.name}</div>
                  <div className="text-sm text-gray-500">{size.description}</div>
                </div>
              </div>
              {size.popular && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Popular
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Finish Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          FINISH
        </label>
        <div className="grid grid-cols-1 gap-3">
          {FINISHES.map((finish) => (
            <button
              key={finish.id}
              onClick={() => !finish.comingSoon && onFinishChange?.(finish.id)}
              disabled={finish.comingSoon}
              className={`relative flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedFinish === finish.id
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                  : finish.comingSoon
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedFinish === finish.id 
                    ? 'border-indigo-500 bg-indigo-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedFinish === finish.id && (
                    <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{finish.name}</div>
                  <div className="text-sm text-gray-500">{finish.description}</div>
                </div>
              </div>
              {finish.popular && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Recommended
                </span>
              )}
              {finish.comingSoon && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 