'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function PaymentClient({ orderId }) {
  const router = useRouter()
  const { user, supabase } = useAuth()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchOrder = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            shipping_addresses (*),
            order_items (*)
          `)
          .eq('id', orderId)
          .single()

        if (orderError) throw orderError

        // Verify order belongs to user
        if (orderData.user_id !== user.id) {
          throw new Error('Unauthorized')
        }

        setOrder(orderData)
      } catch (error) {
        console.error('Error fetching order:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, user, supabase, router])

  if (!user) return null
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading payment details...</p>
      </div>
    </div>
  )
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-sm text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => router.push('/orders')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View Orders
        </button>
      </div>
    </div>
  )
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-sm text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
        <p className="text-gray-600 mb-4">We couldn't find the order you're looking for.</p>
        <button
          onClick={() => router.push('/orders')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View Orders
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Payment Details</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>£{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>£{order.shipping_cost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>£{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
        <div className="space-y-2">
          <p>{order.shipping_addresses.full_name}</p>
          <p>{order.shipping_addresses.address_line1}</p>
          {order.shipping_addresses.address_line2 && (
            <p>{order.shipping_addresses.address_line2}</p>
          )}
          <p>
            {order.shipping_addresses.city}, {order.shipping_addresses.county}
          </p>
          <p>{order.shipping_addresses.postal_code}</p>
          {order.shipping_addresses.phone && (
            <p>Phone: {order.shipping_addresses.phone}</p>
          )}
        </div>
      </div>

      <button
        onClick={() => {
          // Handle payment here
          console.log('Processing payment for order:', orderId)
        }}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Pay £{order.total.toFixed(2)}
      </button>
    </div>
  )
} 