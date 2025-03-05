'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { selectCartItems, selectCartTotalAmount } from '@/store/cartSlice'
import { clearCart } from '@/store/cartSlice'
import { useToast } from '@/contexts/ToastContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
  const [formData, setFormData] = useState({
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
    setFormData({
      ...formData,
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
            ...formData,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error

      setAddresses([...addresses, data])
      setSelectedAddressId(data.id)
      setShowNewAddressForm(false)
      setFormData({
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
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            shipping_address_id: selectedAddressId,
            status: 'pending',
            subtotal: cartTotal,
            shipping_cost: cartTotal >= 50 ? 0 : 4.99,
            total: cartTotal >= 50 ? cartTotal : cartTotal + 4.99,
            shipping_method: 'standard'
          }
        ])
        .select()
        .single()

      if (orderError) {
        showToast('Failed to create order', 'error')
        throw orderError
      }

      showToast('Order created successfully', 'success')

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        quantity: item.quantity,
        price_per_unit: item.price,
        image_url: item.fileData,
        size: 'small'
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        // If order items fail, delete the order
        const { error: deleteError } = await supabase
          .from('orders')
          .delete()
          .eq('id', order.id)
        
        if (deleteError) {
          console.error('Error deleting order:', deleteError)
        }
        showToast('Failed to create order items', 'error')
        throw itemsError
      }

      // Clear cart and redirect
      dispatch(clearCart())
      setOrderPlaced(true)
      showToast('Order placed successfully!', 'success')
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to create order. Please try again.')
      setIsLoading(false)
    }
  }

  if (!user || cartItems.length === 0) {
    return null // Loading state handled by useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Shipping Address */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Saved Addresses */}
          {addresses.length > 0 && !showNewAddressForm && (
            <div className="space-y-4 mb-6">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAddressId === address.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <p className="font-medium">{address.full_name}</p>
                      <p className="text-gray-600 text-sm mt-1">
                        {address.address_line1}
                        {address.address_line2 && `, ${address.address_line2}`}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {address.city}, {address.county} {address.postal_code}
                      </p>
                      {address.phone && (
                        <p className="text-gray-600 text-sm mt-1">{address.phone}</p>
                      )}
                      {address.is_default && (
                        <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Default Address
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
              
              <button
                onClick={() => setShowNewAddressForm(true)}
                className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add New Address
              </button>
            </div>
          )}

          {/* New Address Form */}
          {(showNewAddressForm || addresses.length === 0) && (
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="address_line1"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleAddressChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  id="address_line2"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleAddressChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="county" className="block text-sm font-medium text-gray-700">
                    County
                  </label>
                  <input
                    type="text"
                    id="county"
                    name="county"
                    value={formData.county}
                    onChange={handleAddressChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleAddressChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
                  Set as default address
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
            
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

            <button
              onClick={handlePlaceOrder}
              disabled={isLoading || !selectedAddressId}
              className="w-full mt-6 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" light />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                'Place Order'
              )}
            </button>

            <p className="mt-4 text-sm text-gray-500 text-center">
              Free shipping on orders over £50
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 