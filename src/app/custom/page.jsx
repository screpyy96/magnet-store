'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function CustomOrder() {
  const { user } = useAuth()
  const [magnetOptions, setMagnetOptions] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    fetchMagnetOptions()
  }, [])

  useEffect(() => {
    calculateTotalPrice()
  }, [orderItems])

  const fetchMagnetOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('magnet_options')
        .select('*')
        .eq('is_active', true)
        .order('price')

      if (error) throw error
      setMagnetOptions(data)
    } catch (error) {
      console.error('Error fetching magnet options:', error)
      setError('Failed to load magnet options')
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prevFiles => [...prevFiles, ...files])

    // Create order items for each file
    const newOrderItems = files.map(file => ({
      file,
      size: 'medium', // default size
      quantity: 1,
      specialRequirements: '',
      price: magnetOptions.find(opt => opt.size === 'medium')?.price || 0
    }))

    setOrderItems(prevItems => [...prevItems, ...newOrderItems])
  }

  const handleQuantityChange = (index, value) => {
    const newItems = [...orderItems]
    newItems[index].quantity = parseInt(value)
    setOrderItems(newItems)
  }

  const handleSizeChange = (index, size) => {
    const newItems = [...orderItems]
    newItems[index].size = size
    newItems[index].price = magnetOptions.find(opt => opt.size === size)?.price || 0
    setOrderItems(newItems)
  }

  const handleRequirementsChange = (index, value) => {
    const newItems = [...orderItems]
    newItems[index].specialRequirements = value
    setOrderItems(newItems)
  }

  const calculateTotalPrice = () => {
    const total = orderItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity)
    }, 0)
    setTotalPrice(total)
  }

  const handleSubmitOrder = async () => {
    if (!user) {
      setError('Please sign in to place an order')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First, create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_price: totalPrice,
          status: 'pending'
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // Upload images and create order items
      for (const item of orderItems) {
        // Upload image to Supabase Storage
        const fileExt = item.file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${order.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('magnet-images')
          .upload(filePath, item.file)

        if (uploadError) throw uploadError

        // Get public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('magnet-images')
          .getPublicUrl(filePath)

        // Create order item
        const { error: itemError } = await supabase
          .from('order_items')
          .insert([{
            order_id: order.id,
            image_url: publicUrl,
            quantity: item.quantity,
            size: item.size,
            price_per_unit: item.price,
            special_requirements: item.specialRequirements
          }])

        if (itemError) throw itemError
      }

      // Clear form and show success
      setSelectedFiles([])
      setOrderItems([])
      alert('Order placed successfully!')
    } catch (error) {
      console.error('Error submitting order:', error)
      setError('Failed to submit order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setOrderItems(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Custom Magnets</h1>
          <p className="mt-2 text-gray-600">Upload your images and customize your magnets</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Price Guide */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Price Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {magnetOptions.map((option) => (
              <div key={option.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{option.size.charAt(0).toUpperCase() + option.size.slice(1)}</h3>
                <p className="text-gray-600">{option.dimensions}</p>
                <p className="text-lg font-bold mt-2">${option.price}</p>
                <p className="text-sm text-gray-500 mt-1">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Images</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
        </div>

        {/* Order Items */}
        {orderItems.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Order</h2>
            <div className="space-y-6">
              {orderItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative w-24 h-24">
                      <Image
                        src={URL.createObjectURL(item.file)}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Size</label>
                          <select
                            value={item.size}
                            onChange={(e) => handleSizeChange(index, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            {magnetOptions.map((option) => (
                              <option key={option.id} value={option.size}>
                                {option.size} ({option.dimensions})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Price</label>
                          <p className="mt-2 text-lg font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Special Requirements</label>
                        <textarea
                          value={item.specialRequirements}
                          onChange={(e) => handleRequirementsChange(index, e.target.value)}
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Any special instructions for this magnet?"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-6">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">Total: ${totalPrice.toFixed(2)}</span>
                <button
                  onClick={handleSubmitOrder}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 