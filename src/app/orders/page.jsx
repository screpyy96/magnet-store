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

  useEffect(() => {
    if (isAuthLoading) return

    if (!user) {
      router.push('/login?redirect=/orders')
      return
    }

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              quantity,
              price_per_unit,
              image_url
            ),
            shipping_addresses (
              full_name,
              city,
              postal_code
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(data || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
        setError('Failed to load orders')
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
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <span>Order placed</span>
                      <span>•</span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">£{order.total.toFixed(2)}</span>
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
                          <img
                            src={item.image_url}
                            alt={`Order item ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-600">
                        {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Shipping to: {order.shipping_addresses.full_name}
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