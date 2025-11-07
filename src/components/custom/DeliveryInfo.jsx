export default function DeliveryInfo() {
  const today = new Date();
  const deliveryStart = new Date(today);
  deliveryStart.setDate(today.getDate() + 3); // 3 days from now
  
  const deliveryEnd = new Date(today);
  deliveryEnd.setDate(today.getDate() + 5); // 5 days from now

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">Delivery Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Production time:</span>
              <span className="font-medium text-gray-900">1-2 business days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">UK Standard delivery:</span>
              <span className="font-medium text-gray-900">2-3 business days</span>
            </div>
            <div className="pt-2 border-t border-blue-200">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">
                  <strong>Estimated delivery:</strong> {formatDate(deliveryStart)} - {formatDate(deliveryEnd)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Options */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <h4 className="font-medium text-gray-900 mb-3">Delivery Options</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Standard UK Delivery</span>
            </div>
            <span className="font-medium text-gray-900">FREE</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">International</span>
            </div>
            <span className="font-medium text-gray-900">£9.99+</span>
          </div>
        </div>
      </div>
    </div>
  );
} 