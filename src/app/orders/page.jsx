'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

export default function Orders() {
  const router = useRouter()
  const { user, supabase, isLoading: isAuthLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState({})

  useEffect(() => {
    if (isAuthLoading) return

    if (!user) {
      router.push('/login?redirect=/orders')
      return
    }

    const fetchOrders = async () => {
      try {
        // Get orders
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              price_per_unit,
              image_url,
              size,
              product_name,
              special_requirements
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching orders data:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log('No orders found for user:', user.id);
          setOrders([]);
          setIsLoading(false);
          return;
        }
        
        console.log('Orders fetched successfully:', data.length);
        
        // Add shipping addresses separately
        try {
          const ordersWithAddresses = await Promise.all(data.map(async (order) => {
            if (order.shipping_address_id) {
              try {
                // Get shipping address for each order
                const { data: addressData, error: addressError } = await supabase
                  .from('shipping_addresses')
                  .select('full_name, city, postal_code')
                  .eq('id', order.shipping_address_id)
                  .single()
                
                if (addressError) {
                  console.error(`Error fetching address for order ${order.id}:`, addressError);
                  return {
                    ...order,
                    shipping_addresses: null
                  };
                }
                  
                return {
                  ...order,
                  shipping_addresses: addressData || null
                }
              } catch (addressFetchError) {
                console.error(`Error processing address for order ${order.id}:`, addressFetchError);
                return {
                  ...order,
                  shipping_addresses: null
                };
              }
            }
            return {
              ...order,
              shipping_addresses: null
            }
          }))
          
          console.log('Orders with addresses processed:', ordersWithAddresses.length);
          setOrders(ordersWithAddresses || []);
        } catch (addressesError) {
          console.error('Error processing addresses:', addressesError);
          // Display orders without addresses in case of error
          setOrders(data || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error?.message || error?.details || 'Failed to load orders');
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user, supabase, router, isAuthLoading])

  if (isAuthLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;
    
    try {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      
      if (error) throw error;
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      alert(`Order #${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('An error occurred while updating the order status.');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="w-16 h-16 mx-auto mb-4">
              <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to create your first order</p>
            <Link
              href="/custom"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Create Your First Magnet
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Your Orders</h1>
        
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="sm:flex sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingStatus[order.id]}
                            className="text-xs border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Complete Order</option>
                            <option value="cancelled">Cancel Order</option>
                          </select>
                          {updatingStatus[order.id] && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                        <span>Order placed</span>
                        <span>•</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order.id.substring(0, 8).toUpperCase()}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        £{order.total?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.order_items?.length} {order.order_items?.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {order.shipping_addresses?.city || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.shipping_addresses?.postal_code || ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {order.order_items.map((item, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 rounded-lg border-2 border-white overflow-hidden shadow-sm"
                          style={{ marginLeft: index > 0 ? '-0.5rem' : '0' }}
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={`Order item ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error("Error loading image:", e);
                                e.target.src = "/placeholder-magnet.png";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-600">
                        {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Shipping to: {order.shipping_addresses?.full_name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 