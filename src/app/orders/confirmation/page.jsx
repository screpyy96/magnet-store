'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function OrderConfirmation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [orderId, setOrderId] = useState(null)
  
  useEffect(() => {
    const orderIdParam = searchParams.get('order_id')
    if (!user) {
      router.push('/login')
      return
    }
    if (!orderIdParam) {
      // Instead of redirecting, just show a message
      console.log('No order_id in URL')
      return
    }
    setOrderId(orderIdParam)
  }, [searchParams, user, router])
  
  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmation</h1>
          <p className="text-gray-600 mb-4">No order information found.</p>
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
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You for Your Order!</h1>
        <p className="text-gray-600">Your order has been successfully placed.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium text-yellow-600">Pending</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">What's Next?</h2>
        <div className="space-y-4 text-sm">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-medium">Order Processing</p>
              <p className="text-gray-600">We'll start processing your custom magnets within 24 hours.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-xs font-bold">2</span>
            </div>
            <div>
              <p className="font-medium">Production</p>
              <p className="text-gray-600">Your magnets will be custom-made with your uploaded images.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-medium">Shipping</p>
              <p className="text-gray-600">We'll ship your order within 3-5 business days.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-yellow-800">Payment Processing</p>
            <p className="text-yellow-700 text-sm">Payment processing will be integrated with Stripe later. For now, this is a demo order.</p>
          </div>
        </div>
      </div>
      
      <div className="text-center space-x-4">
        <Link
          href="/orders"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View All Orders
        </Link>
        <Link
          href="/custom"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Create More Magnets
        </Link>
      </div>
    </div>
  )
} 