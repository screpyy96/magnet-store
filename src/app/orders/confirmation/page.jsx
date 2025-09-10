'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { clearCart } from '@/store/slices/cartSlice'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const [status, setStatus] = useState('processing')
  const [orderId, setOrderId] = useState(null)
  const [message, setMessage] = useState('Processing your payment...')

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent')
    const clientSecret = searchParams.get('payment_intent_client_secret')
    const oid = searchParams.get('order_id')
    setOrderId(oid)

    const maybeFinalizeAfterRedirect = async () => {
      try {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem('pendingOrder') : null
        if (stored && (paymentIntent || clientSecret)) {
          const payload = JSON.parse(stored)
          const res = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...payload,
              paymentIntentId: paymentIntent,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to finalize order')
          setOrderId(data.orderId)
          setStatus('success')
          setMessage('Order placed successfully.')
          // Clear cart and local storage
          dispatch(clearCart())
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('pendingOrder')
          }
          return
        }
        // No pending order; just show success
        if (paymentIntent || clientSecret) {
          setStatus('success')
          setMessage('Payment confirmed successfully.')
        } else if (oid) {
          setStatus('success')
          setMessage('Order placed successfully.')
        } else {
          setStatus('processing')
          setMessage('Finalizing your payment...')
        }
      } catch (e) {
        console.error('Finalize after redirect error:', e)
        setStatus('success')
        setMessage('Payment confirmed. We will email your order details shortly.')
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('pendingOrder')
        }
      }
    }

    maybeFinalizeAfterRedirect()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        {status === 'success' ? (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Thank you!</h1>
            <p className="text-gray-600 mb-2">{message}</p>
            {orderId && (
              <p className="text-sm text-gray-500">Order ID: {orderId}</p>
            )}
            <button
              onClick={() => router.push('/')}
              className="mt-6 inline-flex items-center px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Back to Home
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}
