'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSelector, useDispatch } from 'react-redux'
import { selectCartItems, clearCart } from '@/store/cartSlice'
import AddressSelector from '@/components/checkout/AddressSelector'
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector'
import OrderSummary from '@/components/checkout/OrderSummary'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading, setRedirectAfterLogin } = useAuth()
  const cartItems = useSelector(state => state.cart.items)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  useEffect(() => {
    if (!loading && !user) {
      setRedirectAfterLogin('/checkout')
      router.push('/login')
      return
    }

    if (!loading && cartItems.length === 0) {
      router.push('/cart')
      return
    }
  }, [user, loading, cartItems, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user || cartItems.length === 0) {
    return null
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPaymentMethod) {
      setError('Please select both shipping address and payment method')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          total: total,
          shippingAddressId: selectedAddress.id,
          paymentMethodId: selectedPaymentMethod.stripe_payment_method_id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      router.push(`/checkout/payment?payment_intent=${data.paymentIntentId}&order_id=${data.orderId}`)
    } catch (err) {
      console.error('Error creating order:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <AddressSelector 
            selectedAddress={selectedAddress}
            onAddressSelect={setSelectedAddress}
          />
          
          <PaymentMethodSelector
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={setSelectedPaymentMethod}
          />
        </div>

        <div className="lg:pl-8">
          <OrderSummary 
            onPlaceOrder={handlePlaceOrder}
            isLoading={isLoading}
            error={error}
            totalPrice={total}
          />
        </div>
      </div>
    </div>
  )
} 