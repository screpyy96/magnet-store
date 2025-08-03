'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSelector, useDispatch } from 'react-redux'
import { selectCartItems, clearCart } from '@/store/slices/cartSlice'
import AddressSelector from '@/components/checkout/AddressSelector'
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector'
import OrderSummary from '@/components/checkout/OrderSummary'
import DeliveryInfo from '@/components/custom/DeliveryInfo'

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useDispatch()

  const cartItems = useSelector(selectCartItems)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [justPlacedOrder, setJustPlacedOrder] = useState(false)
  const { user, loading, refreshSession, setRedirectAfterLogin } = useAuth()
  
  // Calculate total from cart items
  const total = cartItems.reduce((sum, item) => {
    // For packages or items with totalPrice, use that. Otherwise multiply price by quantity
    const itemTotal = item.totalPrice || (item.price * (item.quantity || 1));
   
    return sum + itemTotal;
  }, 0)
  

  useEffect(() => {
    if (!loading && !user) {
      setRedirectAfterLogin('/checkout')
      router.push('/login')
      return
    }

    if (!loading && cartItems.length === 0 && !justPlacedOrder) {
      console.log('Cart is empty, redirecting to custom page')
      router.push('/custom')
      return
    }
  }, [user, loading, cartItems, router, justPlacedOrder])

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
    
    if (!user || !user.id) {
      setError('You must be logged in to place an order')
      router.push('/login?redirect=/checkout')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create order using API
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          total: total,
          shippingAddressId: selectedAddress.id,
          paymentMethodId: selectedPaymentMethod.stripe_payment_method_id,
          userId: user.id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      console.log('Order created successfully:', data)

      // Set flag to prevent redirect
      setJustPlacedOrder(true)
      
      // Clear cart first
      dispatch(clearCart())
      
      // Then redirect to confirmation page
      console.log('Redirecting to confirmation page with order ID:', data.orderId)
      router.push(`/orders/confirmation?order_id=${data.orderId}&from_confirmation=true`)
      
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
          
          <DeliveryInfo />
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