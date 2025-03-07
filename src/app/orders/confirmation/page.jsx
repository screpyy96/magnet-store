'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function OrderConfirmation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, supabase } = useAuth()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const orderId = searchParams.get('order_id')
  
  useEffect(() => {
    if (!user || !orderId) {
      if (!user) {
        router.push('/login')
      } else if (!orderId) {
        router.push('/orders')
      }
      return
    }
    
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true)
        
        // Get the order details
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
        
        // Verify the order belongs to the user
        if (orderData.user_id !== user.id) {
          throw new Error('Unauthorized')
        }
        
        // Check if payment is completed
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_transactions')
          .select('status')
          .eq('order_id', orderId)
          .eq('payment_method', 'stripe')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (paymentError) {
          console.error('Error fetching payment status:', paymentError)
          // Continue even if payment data can't be fetched
        } else if (paymentData.status !== 'completed' && orderData.status !== 'paid') {
          // If payment is not completed and order is not marked as paid, redirect to payment page
          router.push(`/payment/${orderId}`)
          return
        }
        
        setOrder(orderData)
      } catch (error) {
        console.error('Error fetching order details:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOrderDetails()
  }, [orderId, user, supabase, router])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View Orders
          </Link>
        </div>
      </div>
    )
  }
  
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the order you're looking for.</p>
          <Link
            href="/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View Orders
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You for Your Order!</h1>
        <p className="text-gray-600">Your payment has been successfully processed.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-medium">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium capitalize">{order.status}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {order.order_items.map((item) => (
            <div key={item.id} className="p-6 flex items-center">
              <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-4">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">{item.product_name}</h3>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <div className="text-sm font-medium">
                £{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>£{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping:</span>
              <span>£{order.shipping_cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200 mt-2">
              <span>Total:</span>
              <span>£{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
        <div className="space-y-1 text-sm">
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
      
      <div className="text-center">
        <Link
          href="/orders"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View All Orders
        </Link>
      </div>
    </div>
  )
} 