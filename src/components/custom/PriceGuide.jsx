import { motion } from 'framer-motion';

export default function PriceGuide({ magnetOptions }) {
  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Size</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {magnetOptions.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-indigo-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {option.size.charAt(0).toUpperCase() + option.size.slice(1)}
              </h3>
              <span className="text-2xl font-bold text-indigo-600">£{option.price}</span>
            </div>
            <p className="text-gray-600 font-medium mb-2">{option.dimensions}</p>
            <p className="text-sm text-gray-500">{option.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 