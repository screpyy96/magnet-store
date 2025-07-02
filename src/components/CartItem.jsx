'use client';

import { useDispatch } from 'react-redux';
import { removeItem, updateQuantity } from '@/store/slices/cartSlice';
import Image from 'next/image';
import { useToast } from '@/contexts/ToastContext';
import { getCartItemImage } from '@/utils/localStorage';

export default function CartItem({ item, index }) {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const handleQuantityChange = (newValue) => {
    const quantity = parseInt(newValue);
    if (quantity < 1) return;
    dispatch(updateQuantity({ index, quantity }));
    showToast('Quantity updated', 'success');
  };

  const handleRemove = () => {
    dispatch(removeItem(index));
    showToast('Item removed from cart', 'success');
  };

  return (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden relative">
        {(() => {
          const imageUrl = getCartItemImage(item);
          return imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          );
        })()}
      </div>
      
      <div className="ml-4 flex-1">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {item.dimensions && (
          <p className="text-xs text-gray-500 mt-1">Size: {item.dimensions}</p>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center border border-gray-200 rounded">
            <button
              onClick={() => handleQuantityChange(Math.max(1, item.quantity - 1))}
              className="px-2 py-1 text-gray-600 hover:bg-gray-50"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-12 text-center border-x border-gray-200 py-1 text-sm"
              aria-label="Quantity"
            />
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <p className="text-sm font-medium text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
} 