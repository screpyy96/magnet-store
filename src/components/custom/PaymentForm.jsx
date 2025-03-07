'use client'

import { useState, useEffect } from 'react'
import { 
  PaymentElement, 
  useStripe, 
  useElements,
  AddressElement
} from '@stripe/react-stripe-js'
import { formatCardError } from '@/lib/stripe'

export default function PaymentForm({ amount, orderId, onSuccess, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  
  useEffect(() => {
    if (!stripe) {
      return
    }
    
    // Check for payment intent result from redirect
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    )
    
    if (!clientSecret) {
      return
    }
    
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setErrorMessage(null)
          onSuccess(paymentIntent.id)
          break
        case 'processing':
          setErrorMessage('Your payment is processing.')
          break
        case 'requires_payment_method':
          setErrorMessage('Your payment was not successful, please try again.')
          break
        default:
          setErrorMessage('Something went wrong.')
          break
      }
    })
  }, [stripe, onSuccess])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return
    }
    
    setIsLoading(true)
    setErrorMessage(null)
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/confirmation?order_id=${orderId}`,
        },
        redirect: 'if_required',
      })
      
      if (error) {
        // Show error to your customer
        setErrorMessage(formatCardError(error))
        onError(error)
      } else {
        // Payment succeeded
        onSuccess()
      }
    } catch (err) {
      console.error('Payment error:', err)
      setErrorMessage('An unexpected error occurred.')
      onError(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Card Details</h3>
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}
      
      <button
        disabled={isLoading || !stripe || !elements}
        className={`w-full flex items-center justify-center py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          isLoading || !stripe || !elements
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
        type="submit"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>Pay £{amount.toFixed(2)}</>
        )}
      </button>
    </form>
  )
}