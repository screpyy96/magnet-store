'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function OrdersPage() {
  const { user, supabase } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadOrders()
  }, [user])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          payment_transactions (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      console.log('Orders data:', ordersData)
      ordersData?.forEach(order => {
        order.order_items?.forEach(item => {
          console.log('Item image URL:', item.image_url)
        })
      })

      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (item) => {
    // Returnăm direct URL-ul dacă există
    return item.image_url || null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Order placed: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Order ID: {order.id}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center py-2">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      {(item.image_url || item.fileData || item.image) ? (
                        <Image
                          src={item.image_url || item.fileData || item.image}
                          alt={`Custom magnet - Order ${order.id}`}
                          width={80}
                          height={80}
                          sizes="80px"
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100">
                          <svg 
                            className="h-8 w-8 text-gray-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium">
                        {item.product_name || 'Custom Magnet'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} x £{item.price_per_unit}
                      </p>
                      {item.size && (
                        <p className="text-sm text-gray-600">
                          Size: {item.size}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>£{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span>£{order.shipping_cost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span>£{order.tax}</span>
                </div>
                <div className="flex justify-between font-medium mt-2 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>£{order.total}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 