'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminOrderDetails({ params }) {
  const { orderId } = params
  const { user, supabase } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const checkAdminStatus = async () => {
      try {
        // Check if user is admin
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (!data || !data.is_admin) {
          // Not an admin, redirect to home
          router.push('/')
          return
        }

        setIsAdmin(true)
        await fetchOrderDetails()
      } catch (error) {
        console.error('Error checking admin status:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, router, supabase, orderId])

  const fetchOrderDetails = async () => {
    try {
      // Get order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (id, email),
          shipping_addresses (*),
          order_items (*),
          payment_transactions (*)
        `)
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError

      setOrder(orderData)
    } catch (error) {
      console.error('Error fetching order details:', error)
    }
  }

  const updateOrderStatus = async (newStatus) => {
    try {
      setIsUpdating(true)
      setStatusUpdateSuccess(false)

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      // Refresh order data
      await fetchOrderDetails()
      setStatusUpdateSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setStatusUpdateSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-indigo-100 text-indigo-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="mt-2 text-sm text-gray-600">
            Order #{order.id.substring(0, 8)}...
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            href="/admin/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </Link>
        </div>
      </div>

      {statusUpdateSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Order status updated successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Order Date:</span>
              <span className="text-sm font-medium">{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Status:</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Subtotal:</span>
              <span className="text-sm font-medium">£{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Shipping:</span>
              <span className="text-sm font-medium">£{order.shipping_cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-900">Total:</span>
              <span className="text-sm font-bold text-gray-900">£{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500 block">Name:</span>
              <span className="text-sm font-medium">{order.shipping_addresses?.full_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Email:</span>
              <span className="text-sm font-medium">{order.profiles?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Phone:</span>
              <span className="text-sm font-medium">{order.shipping_addresses?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
          <div className="space-y-1">
            <p className="text-sm">{order.shipping_addresses?.full_name}</p>
            <p className="text-sm">{order.shipping_addresses?.address_line1}</p>
            {order.shipping_addresses?.address_line2 && (
              <p className="text-sm">{order.shipping_addresses.address_line2}</p>
            )}
            <p className="text-sm">
              {order.shipping_addresses?.city}, {order.shipping_addresses?.county}
            </p>
            <p className="text-sm">{order.shipping_addresses?.postal_code}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
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
                <h3 className="text-sm font-medium text-gray-900">{item.product_name}</h3>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                £{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
        {order.payment_transactions && order.payment_transactions.length > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Method:</span>
              <span className="text-sm font-medium capitalize">{order.payment_transactions[0].payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Status:</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.payment_transactions[0].status)}`}>
                {order.payment_transactions[0].status.charAt(0).toUpperCase() + order.payment_transactions[0].status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Transaction ID:</span>
              <span className="text-sm font-medium">{order.payment_transactions[0].stripe_payment_intent_id?.substring(0, 12) || 'N/A'}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Date:</span>
              <span className="text-sm font-medium">{formatDate(order.payment_transactions[0].created_at)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No payment information available</p>
        )}
      </div>

      {/* Update Order Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => updateOrderStatus('pending')}
            disabled={order.status === 'pending' || isUpdating}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              order.status === 'pending'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => updateOrderStatus('paid')}
            disabled={order.status === 'paid' || isUpdating}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              order.status === 'paid'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => updateOrderStatus('shipped')}
            disabled={order.status === 'shipped' || isUpdating}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              order.status === 'shipped'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => updateOrderStatus('completed')}
            disabled={order.status === 'completed' || isUpdating}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              order.status === 'completed'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => updateOrderStatus('cancelled')}
            disabled={order.status === 'cancelled' || isUpdating}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              order.status === 'cancelled'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            Cancelled
          </button>
        </div>
        {isUpdating && (
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
            Updating order status...
          </div>
        )}
      </div>
    </div>
  )
} 