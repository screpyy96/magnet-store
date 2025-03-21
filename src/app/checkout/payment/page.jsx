'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useDispatch } from 'react-redux'
import { clearCart } from '@/store/cartSlice'
import React from 'react'

// Loading component for Suspense
function PaymentLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing payment...</p>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const dispatch = useDispatch()
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const paymentIntentId = searchParams.get('payment_intent')
    const orderId = searchParams.get('order_id')

    if (paymentIntentId && orderId) {
      // Clear cart and show success message
      dispatch(clearCart())
      setStatus('success')
      
      // Delay redirect to allow user to see success message
      const timer = setTimeout(() => {
        router.push('/account/orders')
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      // If no payment intent or order id, redirect to checkout
      router.push('/checkout')
    }
  }, [user, router, searchParams, dispatch])

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600">
            Redirecting you to your orders...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing your payment...</p>
      </div>
    </div>
  )
}

// Export the wrapped component with Suspense
export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
} 