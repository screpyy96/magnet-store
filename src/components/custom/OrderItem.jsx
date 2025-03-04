import Image from 'next/image';
import { motion } from 'framer-motion';

export default function OrderItem({ 
  item, 
  index, 
  magnetOptions, 
  onQuantityChange, 
  onSizeChange, 
  onRequirementsChange, 
  onRemove 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image Preview */}
          <div className="relative w-full md:w-48 h-48 md:h-full">
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <Image
                src={URL.createObjectURL(item.file)}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Order Details */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <select
                  value={item.size}
                  onChange={(e) => onSizeChange(index, e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {magnetOptions.map((option) => (
                    <option key={option.id} value={option.size}>
                      {option.size.charAt(0).toUpperCase() + option.size.slice(1)} ({option.dimensions})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onQuantityChange(index, e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Price Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="text-2xl font-bold text-indigo-600">
                  £{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requirements
              </label>
              <textarea
                value={item.specialRequirements}
                onChange={(e) => onRequirementsChange(index, e.target.value)}
                rows={2}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Any special instructions for this magnet?"
              />
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(index)}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
} 