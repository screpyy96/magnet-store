'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function OrderDetails({ params }) {
  const { orderId } = params
  const router = useRouter()
  const { user, supabase, isLoading: isAuthLoading } = useAuth()
  const [order, setOrder] = useState(null)
  const [address, setAddress] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthLoading) return

    if (!user) {
      router.push('/login?redirect=/orders/' + orderId)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single()

        if (orderError) throw orderError
        if (!orderData) {
          setError('Order not found')
          setIsLoading(false)
          return
        }

        setOrder(orderData)

        // Fetch shipping address
        const { data: addressData, error: addressError } = await supabase
          .from('shipping_addresses')
          .select('*')
          .eq('id', orderData.shipping_address_id)
          .single()

        if (addressError) throw addressError
        setAddress(addressData)

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId)

        if (itemsError) throw itemsError
        setOrderItems(itemsData)

      } catch (error) {
        console.error('Error fetching order details:', error)
        setError('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [user, orderId, supabase, router, isAuthLoading])

  // Show loading spinner while checking auth status
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Order Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Order Details</h1>
          <p className="mt-1 text-sm text-gray-500">Order #{orderId}</p>
        </div>

        <div className="px-6 py-4">
          {/* Order Status */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900">Status</h2>
            <span className={`inline-flex mt-2 items-center px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'completed' ? 'bg-green-100 text-green-800' :
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{address.full_name}</p>
              <p>{address.address_line1}</p>
              {address.address_line2 && <p>{address.address_line2}</p>}
              <p>{address.city}, {address.county} {address.postal_code}</p>
              <p>{address.country}</p>
              {address.phone && <p className="mt-1">Phone: {address.phone}</p>}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Order Items</h2>
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 h-20 relative rounded-md overflow-hidden border border-gray-200 bg-white shrink-0">
                    <img
                      src={item.image_url}
                      alt={`Order item ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">Custom Magnet</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                  </div>
                  <p className="text-sm font-medium">£{(item.price_per_unit * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">£{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {order.shipping_cost === 0 ? 'Free' : `£${order.shipping_cost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>£{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 