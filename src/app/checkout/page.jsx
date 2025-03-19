'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { selectCartItems, selectCartTotalAmount } from '@/store/cartSlice'
import { clearCart } from '@/store/cartSlice'
import { useToast } from '@/contexts/ToastContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

export default function Checkout() {
  const router = useRouter()
  const { user, supabase } = useAuth()
  const cartItems = useSelector(selectCartItems)
  const cartTotal = useSelector(selectCartTotalAmount)
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Review
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United Kingdom'
  })
  const { showToast } = useToast()

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout')
      return
    }
    if (cartItems.length === 0 && !orderPlaced) {
      router.push('/custom')
      return
    }
  }, [user, cartItems, router, orderPlaced])

  // Fetch user's saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('shipping_addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })

        if (error) throw error

        setAddresses(data || [])
        // Select default address if exists
        const defaultAddress = data?.find(addr => addr.is_default)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
        setError('Failed to load saved addresses')
      }
    }

    fetchAddresses()
  }, [user, supabase])

  const handleAddressChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    })
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .insert([
          {
            ...shippingInfo,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error

      setAddresses([...addresses, data])
      setSelectedAddressId(data.id)
      setShowNewAddressForm(false)
      setShippingInfo({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'United Kingdom'
      })
    } catch (error) {
      console.error('Error saving address:', error)
      setError('Failed to save address. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select a shipping address', 'error')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Folosim noul API endpoint pentru checkout
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          shippingAddressId: selectedAddressId,
          cartItems: cartItems,
          cartTotal: cartTotal
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process checkout')
      }

      // Succes - golim coșul și redirecționăm
      dispatch(clearCart())
      setOrderPlaced(true)
      showToast('Order placed successfully!', 'success')
      router.push(`/orders/${data.order.id}`)
    } catch (error) {
      console.error('Error:', error)
      setError(error.message || 'Failed to create order. Please try again.')
      setIsLoading(false)
    }
  }

  const handleSubmitOrder = () => {
    // Aici ar veni logica de procesare a plății
    // După procesare reușită, redirecționează către pagina de confirmare
    router.push('/checkout/confirmation')
  }

  if (!user || cartItems.length === 0) {
    return null // Loading state handled by useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Checkout</h1>
        <div className="flex items-center">
          <div className={`flex items-center ${step >= 1 ? 'text-pink-600' : 'text-gray-400'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-pink-100' : 'bg-gray-100'}`}>1</span>
            <span className="ml-2 text-sm font-medium">Shipping</span>
          </div>
          <div className={`h-0.5 w-12 mx-2 ${step >= 2 ? 'bg-pink-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-pink-600' : 'text-gray-400'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-pink-100' : 'bg-gray-100'}`}>2</span>
            <span className="ml-2 text-sm font-medium">Payment</span>
          </div>
          <div className={`h-0.5 w-12 mx-2 ${step >= 3 ? 'bg-pink-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-pink-600' : 'text-gray-400'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-pink-100' : 'bg-gray-100'}`}>3</span>
            <span className="ml-2 text-sm font-medium">Review</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={shippingInfo.firstName}
                    onChange={handleAddressChange}
                    name="firstName"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={shippingInfo.lastName}
                    onChange={handleAddressChange}
                    name="lastName"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={shippingInfo.email}
                    onChange={handleAddressChange}
                    name="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={shippingInfo.address}
                    onChange={handleAddressChange}
                    name="address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={shippingInfo.city}
                    onChange={handleAddressChange}
                    name="city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={shippingInfo.postalCode}
                    onChange={handleAddressChange}
                    name="postalCode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={shippingInfo.country}
                    onChange={handleAddressChange}
                    name="country"
                  />
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="mt-6 bg-gradient-to-r from-pink-400 to-amber-400 hover:from-pink-500 hover:to-amber-500 text-white px-4 py-2 rounded-full font-medium"
              >
                Continue to Payment
              </button>
            </div>
          )}
          
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
              {/* Aici ar veni formularul de plată */}
              <div className="flex mt-6 space-x-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 font-medium"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="bg-gradient-to-r from-pink-400 to-amber-400 hover:from-pink-500 hover:to-amber-500 text-white px-4 py-2 rounded-full font-medium"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Review Your Order</h2>
              {/* Rezumatul comenzii */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium">£{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <span className="text-sm font-medium">{cartTotal >= 50 ? 'Free' : '£4.99'}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>£{(cartTotal >= 50 ? cartTotal : cartTotal + 4.99).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex mt-6 space-x-4">
                <button 
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 font-medium"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmitOrder}
                  className="bg-gradient-to-r from-pink-400 to-amber-400 hover:from-pink-500 hover:to-amber-500 text-white px-4 py-2 rounded-full font-medium"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
          {/* Aici ar veni sumarul produselor din coș */}
          <div className="space-y-4 mb-6">
            {cartItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 h-20 relative rounded-md overflow-hidden border border-gray-200 bg-white shrink-0">
                  <img
                    src={item.fileData}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium">Custom Magnet</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">£{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">£{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{cartTotal >= 50 ? 'Free' : '£4.99'}</span>
            </div>
            <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>£{(cartTotal >= 50 ? cartTotal : cartTotal + 4.99).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 