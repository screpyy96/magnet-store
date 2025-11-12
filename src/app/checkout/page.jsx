'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSelector, useDispatch } from 'react-redux'
import { selectCartItems, clearCart } from '@/store/slices/cartSlice'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import AddressSelector from '@/components/checkout/AddressSelector'
import GuestAddressForm from '@/components/checkout/GuestAddressForm'
import OrderSummary from '@/components/checkout/OrderSummary'
import DeliveryInfo from '@/components/custom/DeliveryInfo'
import StripePaymentForm from '@/components/checkout/StripePaymentForm'

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, loading } = useAuth()
  const isGuest = !user
  const isDev = process.env.NODE_ENV !== 'production'
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey])
  const publishableKeyMode = publishableKey.startsWith('pk_live') ? 'live' : 'test'

  const cartItems = useSelector(selectCartItems)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [guestAddress, setGuestAddress] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [justPlacedOrder, setJustPlacedOrder] = useState(false)
  
  // Calculate total from cart items
  const subtotal = cartItems.reduce((sum, item) => {
    // For packages or items with totalPrice, use that. Otherwise multiply price by quantity
    const itemTotal = item.totalPrice || (item.price * (item.quantity || 1));
   
    return sum + itemTotal;
  }, 0)
  // Local preview (final values come from server):
  const estimatedShipping = 0
  const estimatedTax = 0
  const estimatedTotal = subtotal + estimatedShipping + estimatedTax

  // Create payment intent when total changes
  // Server computed totals
  const [serverTotals, setServerTotals] = useState(null)

  useEffect(() => {
    if (cartItems.length > 0 && publishableKey) {
      createPaymentIntent()
    }
    // Intenția de plată nu depinde de câmpurile adreselor; evităm recrearea la fiecare tastă
    // Guest details sunt trimise ulterior la crearea comenzii
  }, [subtotal, publishableKey])

  useEffect(() => {
    if (!publishableKey) {
      setError('Payment service is temporarily unavailable. Please try again later.')
    }
  }, [publishableKey])

  // Clear previous error when guest address becomes valid
  useEffect(() => {
    if (guestAddress) {
      setError(null)
    }
  }, [guestAddress])

  const createPaymentIntent = async () => {
    try {
      if (!publishableKey) {
        throw new Error('Missing Stripe publishable key')
      }

      // Strip out large image data before sending to API
      const sanitizedCart = cartItems.map(item => {
        const { fileData, image, image_url, images, thumbnails, ...rest } = item
        return rest
      })

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-key-mode': publishableKeyMode,
        },
        body: JSON.stringify({
          cart: sanitizedCart,
          currency: 'gbp',
          guest: isGuest ? {
            email: guestAddress?.email || null,
            shipping: guestAddress || null,
          } : null,
          metadata: {
            cart_items: cartItems.length.toString()
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent')
      }

      setClientSecret(data.clientSecret)
      if (data.totals) {
        setServerTotals(data.totals)
      }
    } catch (err) {
      if (isDev) {
        console.error('Error creating payment intent:', err)
      }
      setError(isDev ? err.message || 'Failed to initialize payment.' : 'Payment service is temporarily unavailable. Please try again later.')
    }
  }
  

  useEffect(() => {
    if (!loading && cartItems.length === 0 && !justPlacedOrder) {
      if (isDev) {
        console.log('Cart is empty, redirecting to custom page')
      }
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

  if (cartItems.length === 0) {
    return null
  }

  const handlePlaceOrder = async (paymentIntentId) => {
    if (!isGuest && !selectedAddress) {
      setError('Please select a shipping address')
      return
    }
    if (isGuest && !guestAddress) {
      setError('Please enter your shipping details')
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
          totals: serverTotals,
          subtotal,
          shippingAddressId: !isGuest ? selectedAddress?.id : null,
          shippingDetails: isGuest ? guestAddress : null,
          paymentIntentId: paymentIntentId,
          userId: user?.id || null,
          email: isGuest ? guestAddress?.email : user?.email || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      if (isDev) {
        console.log('Order created successfully:', data)
      }

      // Set flag to prevent redirect
      setJustPlacedOrder(true)
      
      // Clear cart first
      dispatch(clearCart())
      
      // Then redirect to confirmation page
      if (isDev) {
        console.log('Redirecting to confirmation page with order ID:', data.orderId)
      }
      router.push(`/orders/confirmation?order_id=${data.orderId}&from_confirmation=true`)
      
    } catch (err) {
      if (isDev) {
        console.error('Error creating order:', err)
      }
      setError(isDev ? err.message : 'We could not place your order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error ? (
          <div className="max-w-md w-full bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-1">Payment initialization failed</h3>
            <p className="text-sm mb-3">
              {isDev ? error : "We couldn't initialize the payment. Please refresh and try again."}
            </p>
            {isDev && (
              <ul className="list-disc list-inside text-sm mb-4">
                <li>Verifică că ai setat corect cheile Stripe în environment (.env): <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> și <code>STRIPE_SECRET_KEY</code>.</li>
                <li>Asigură-te că ai produse în coș.</li>
                <li>Reîncearcă mai târziu sau reîmprospătează pagina.</li>
              </ul>
            )}
            <button onClick={() => { setError(null); createPaymentIntent(); }} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Reîncearcă</button>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        )}
      </div>
    )
  }

  const canPay = !isGuest || !!guestAddress

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {isGuest ? (
            <GuestAddressForm 
              error={error}
              onAddressChange={setGuestAddress}
            />
          ) : (
            <AddressSelector 
              selectedAddress={selectedAddress}
              onAddressSelect={setSelectedAddress}
            />
          )}
          
          {stripePromise && (
            <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                onPlaceOrder={handlePlaceOrder}
                isLoading={isLoading}
                error={error}
                canPay={canPay}
                billingDefaults={isGuest ? guestAddress : null}
                prepareOrderPayload={async () => ({
                  items: cartItems,
                  totals: serverTotals,
                  subtotal,
                  shippingAddressId: !isGuest ? selectedAddress?.id : null,
                  shippingDetails: isGuest ? guestAddress : null,
                  userId: user?.id || null,
                  email: isGuest ? guestAddress?.email : user?.email || null,
                })}
              />
            </Elements>
          )}
          
          <DeliveryInfo />
        </div>

        <div className="lg:pl-8">
           <OrderSummary 
             onPlaceOrder={() => {}} // This will be handled by StripePaymentForm
             isLoading={isLoading}
             error={error}
            totalPrice={(serverTotals?.total ?? estimatedTotal)}
            shippingCost={(serverTotals?.shipping ?? estimatedShipping)}
            showAction={false}
          />
        </div>
      </div>
    </div>
  )
}
