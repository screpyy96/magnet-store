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
import { loadStripe } from '@stripe/stripe-js'

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
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    county: '',
    postal_code: '',
    country: 'United Kingdom',
    phone: '',
    is_default: false
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
    const loadAddresses = async () => {
      try {
        const { data, error } = await supabase
          .from('shipping_addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }) // Cele mai recente primele
        
        if (error) throw error
        
        setAddresses(data || [])
        
        // Selectează automat prima adresă (dacă există)
        if (data && data.length > 0) {
          setSelectedAddressId(data[0].id)
        }
      } catch (error) {
        console.error('Error loading addresses:', error)
      }
    }
    
    if (user) {
      loadAddresses()
    }
  }, [user, supabase])

  const handleAddressChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    })
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    
    // Validează datele de formular
    if (!shippingInfo.full_name || !shippingInfo.address_line1 || !shippingInfo.city || !shippingInfo.postal_code) {
      showToast('Te rugăm să completezi toate câmpurile obligatorii', 'error')
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      // Adaugă timestamp-ul curent
      const currentTime = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('shipping_addresses')
        .insert([
          {
            user_id: user.id,
            full_name: shippingInfo.full_name,
            address_line1: shippingInfo.address_line1,
            address_line2: shippingInfo.address_line2 || null,
            city: shippingInfo.city,
            county: shippingInfo.county || null,
            postal_code: shippingInfo.postal_code,
            country: shippingInfo.country,
            phone: shippingInfo.phone || null,
            is_default: shippingInfo.is_default,
            created_at: currentTime,
            updated_at: currentTime
          }
        ])
        .select()

      if (error) throw error

      // Dacă adresa este setată ca implicită, actualizează celelalte adrese
      if (shippingInfo.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .neq('id', data[0].id)
          .eq('user_id', user.id)
      }

      // Actualizează lista de adrese și selectează noua adresă
      const { data: updatedAddresses } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setAddresses(updatedAddresses || [])
      setSelectedAddressId(data[0].id)
      
      // Resetează formularul
      setShippingInfo({
        full_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        county: '',
        postal_code: '',
        country: 'United Kingdom',
        phone: '',
        is_default: false
      })
      
      showToast('Adresa a fost salvată cu succes', 'success')
    } catch (error) {
      console.error('Error saving address:', error)
      setError('Nu am putut salva adresa. Te rugăm să încerci din nou.')
      showToast('Eroare la salvarea adresei', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Te rugăm să selectezi o adresă de livrare', 'error')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // În handlePlaceOrder, adaugă această verificare
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        showToast('Eroare de configurare la sistemul de plată. Te rugăm să contactezi suportul.', 'error');
        setIsLoading(false);
        return;
      }

      // Pasul 1: Creează comanda în baza de date
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
        throw new Error(data.error || 'Eroare la procesarea comenzii')
      }

      // Pasul 2: Creează sesiunea de plată cu Stripe
      const stripeResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.order.id,
          amount: data.order.total
        }),
      })

      const stripeData = await stripeResponse.json()
      
      if (!stripeResponse.ok) {
        throw new Error(stripeData.error || 'Eroare la inițierea plății')
      }
      
      // Pasul 3: Redirecționează către pagina de confirmare CU orderId
      // Vom gestiona plata în Success_URL din Stripe
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      
      // Redirecționează către Checkout Stripe
      const result = await stripe.redirectToCheckout({
        sessionId: stripeData.sessionId
      })
      
      if (result.error) {
        throw new Error(result.error.message)
      }

    } catch (error) {
      console.error('Error:', error)
      setError(error.message || 'Eroare la procesarea comenzii. Te rugăm să încerci din nou.')
      setIsLoading(false)
    }
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
              
              {addresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Alege o adresă de livrare</h3>
                  <div className="space-y-3">
                    {addresses.map(address => (
                      <div 
                        key={address.id} 
                        className={`border p-4 rounded-lg cursor-pointer ${
                          selectedAddressId === address.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === address.id}
                            onChange={() => setSelectedAddressId(address.id)}
                            className="mr-2"
                          />
                          <div>
                            <p className="font-medium">{address.full_name}</p>
                            <p className="text-sm text-gray-500">{address.address_line1}</p>
                            {address.address_line2 && <p className="text-sm text-gray-500">{address.address_line2}</p>}
                            <p className="text-sm text-gray-500">
                              {address.city}, {address.postal_code}
                            </p>
                            <p className="text-sm text-gray-500">{address.country}</p>
                            {address.is_default && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                                Adresă implicită
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">
                  {addresses.length > 0 ? 'Sau adaugă o adresă nouă' : 'Adaugă o adresă de livrare'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nume complet*</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={shippingInfo.full_name}
                      onChange={handleAddressChange}
                      name="full_name"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresă linia 1*</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={shippingInfo.address_line1}
                      onChange={handleAddressChange}
                      name="address_line1"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresă linia 2</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={shippingInfo.address_line2}
                      onChange={handleAddressChange}
                      name="address_line2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oraș*</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={shippingInfo.city}
                      onChange={handleAddressChange}
                      name="city"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Județ/Sector</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={shippingInfo.county}
                      onChange={handleAddressChange}
                      name="county"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cod poștal*</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={shippingInfo.postal_code}
                      onChange={handleAddressChange}
                      name="postal_code"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Țară*</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={shippingInfo.country}
                      onChange={handleAddressChange}
                      name="country"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={shippingInfo.phone}
                      onChange={handleAddressChange}
                      name="phone"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center">
                    <input 
                      type="checkbox" 
                      id="is_default"
                      className="mr-2"
                      checked={shippingInfo.is_default}
                      onChange={(e) => setShippingInfo({...shippingInfo, is_default: e.target.checked})}
                    />
                    <label htmlFor="is_default" className="text-sm text-gray-700">
                      Setează ca adresă implicită
                    </label>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleAddressSubmit}
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                disabled={isLoading}
              >
                {isLoading ? 'Se salvează...' : 'Salvează adresa'}
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
                  onClick={handlePlaceOrder}
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