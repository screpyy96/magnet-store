export default function ProductDetails() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
      
      <div className="space-y-6">
        {/* Product Description */}
        <div>
          <p className="text-gray-700 leading-relaxed">
            Transform your favourite photos into stunning 5cm × 5cm custom magnets. Perfect for decorating your fridge, 
            office space, or any magnetic surface. Our high-quality photo magnets make excellent gifts and help you 
            keep precious memories visible every day.
          </p>
        </div>

        {/* Features List */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Features</h4>
          <ul className="space-y-2">
            {[
              'Premium photo printing directly onto magnet',
              'Flexible magnetic backing for curved surfaces',
              'Rounded corners for safety and style',
              'Weather-resistant coating',
              'Strong magnetic hold',
              'Photo prints to edge of magnet'
            ].map((feature, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Specifications */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Specifications</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Size:</span>
              <span className="ml-2 text-gray-900 font-medium">5cm × 5cm</span>
            </div>
            <div>
              <span className="text-gray-500">Material:</span>
              <span className="ml-2 text-gray-900 font-medium">Flexible vinyl</span>
            </div>
            <div>
              <span className="text-gray-500">Thickness:</span>
              <span className="ml-2 text-gray-900 font-medium">0.8mm</span>
            </div>
            <div>
              <span className="text-gray-500">Shape:</span>
              <span className="ml-2 text-gray-900 font-medium">Square</span>
            </div>
          </div>
        </div>

        {/* Care Instructions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Care Instructions</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Clean with damp cloth when needed</li>
            <li>• Avoid exposure to extreme heat</li>
            <li>• Store flat when not in use</li>
            <li>• Remove carefully to avoid damage</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 