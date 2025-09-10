'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useAuth } from '@/contexts/AuthContext'

export default function StripePaymentForm({ onPlaceOrder, isLoading, error, prepareOrderPayload, billingDefaults, canPay = true }) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [localError, setLocalError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setLocalError(null)

    try {
      if (!canPay) {
        setLocalError('Please enter your shipping details')
        setProcessing(false)
        return
      }

      const { error: submitError } = await elements.submit()
      if (submitError) {
        setLocalError(submitError.message)
        setProcessing(false)
        return
      }

      // Persist order payload in case 3DS redirect occurs
      if (typeof window !== 'undefined' && prepareOrderPayload) {
        try {
          const payload = await prepareOrderPayload()
          window.localStorage.setItem('pendingOrder', JSON.stringify(payload))
        } catch (e) {
          console.warn('Failed to prepare pending order payload', e)
        }
      }

      const { paymentIntent, error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/confirmation`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setLocalError(confirmError.message)
        setProcessing(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        // Call the parent's onPlaceOrder with the payment intent ID
        await onPlaceOrder(paymentIntent.id)
        // Clear pendingOrder since we completed without redirect
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('pendingOrder')
        }
      } else {
        setLocalError('Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setLocalError('An unexpected error occurred. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const displayError = error || localError

  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-200 p-6">
      <h3 className="text-lg font-medium text-pink-900 mb-4">Payment Information</h3>
      
      {displayError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{displayError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <PaymentElement 
          options={{
            layout: 'tabs',
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'auto',
                address: {
                  country: 'auto',
                  line1: 'auto',
                  line2: 'auto',
                  city: 'auto',
                  state: 'auto',
                  postalCode: 'auto',
                },
              },
            },
            defaultValues: billingDefaults ? {
              billingDetails: {
                name: billingDefaults.full_name || undefined,
                email: billingDefaults.email || undefined,
                phone: billingDefaults.phone || undefined,
                address: {
                  country: billingDefaults.country || undefined,
                  line1: billingDefaults.address_line1 || undefined,
                  line2: billingDefaults.address_line2 || undefined,
                  city: billingDefaults.city || undefined,
                  state: billingDefaults.county || undefined,
                  postalCode: billingDefaults.postal_code || undefined,
                },
              }
            } : undefined,
          }}
        />
        
        <button
          type="submit"
          disabled={!stripe || processing || isLoading || !canPay}
          className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing || isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            'Pay Now'
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        {!canPay && (
          <p className="text-red-600 mb-1">Please enter your shipping details</p>
        )}
        <p>Your payment information is secure and encrypted.</p>
        <p>Powered by Stripe</p>
      </div>
    </div>
  )
} 
