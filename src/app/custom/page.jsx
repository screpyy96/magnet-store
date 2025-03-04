'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { AnimatePresence } from 'framer-motion'
import PriceGuide from '@/components/custom/PriceGuide'
import ImageUploader from '@/components/custom/ImageUploader'
import OrderItem from '@/components/custom/OrderItem'
import OrderSummary from '@/components/custom/OrderSummary'

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

    const newOrderItems = files.map(file => ({
      file,
      size: 'medium',
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

      for (const item of orderItems) {
        const fileExt = item.file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${order.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('magnet-images')
          .upload(filePath, item.file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('magnet-images')
          .getPublicUrl(filePath)

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Custom Magnets</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your favorite photos into beautiful fridge magnets. Perfect for preserving memories or giving unique gifts.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <PriceGuide magnetOptions={magnetOptions} />
      
      <ImageUploader onFileChange={handleFileChange} />

      {orderItems.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
          <AnimatePresence>
            {orderItems.map((item, index) => (
              <OrderItem
                key={index}
                item={item}
                index={index}
                magnetOptions={magnetOptions}
                onQuantityChange={handleQuantityChange}
                onSizeChange={handleSizeChange}
                onRequirementsChange={handleRequirementsChange}
                onRemove={removeItem}
              />
            ))}
          </AnimatePresence>
          
          <OrderSummary
            totalPrice={totalPrice}
            onSubmit={handleSubmitOrder}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
} 