'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Obține comenzile utilizatorului
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, status, total_price, shipping_cost')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Pentru fiecare comandă, obținem detaliile produselor
      const ordersWithItems = await Promise.all(ordersData.map(async (order) => {
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
          return {
            ...order,
            items: []
          };
        }
        
        return {
          ...order,
          items: orderItems || [],
          total: order.total_price || 0,
          date: new Date(order.created_at).toLocaleDateString()
        };
      }));
      
      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-2 text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Order Placed: </span>
              <span className="text-sm font-medium">{order.date}</span>
            </div>
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Order # {order.id.substring(0, 8)}...</p>
            </div>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-start py-3 border-t border-gray-100 first:border-0">
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden relative">
                    {(item.image || item.image_url || item.fileData) ? (
                      <Image
                        src={item.image || item.image_url || item.fileData}
                        alt={item.name || 'Product image'}
                        fill
                        sizes="64px"
                        className="object-cover"
                        onError={(e) => {
                          console.error("Error loading image:", e);
                          e.target.src = "/placeholder-magnet.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {item.product_name || item.name || `Product #${index + 1}`}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      £{(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">£{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 