'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import React from 'react'
import Link from 'next/link'

export default function AdminOrderPage({ params }) {
  const unwrappedParams = React.use(params);
  const orderId = unwrappedParams.orderId
  const { user, supabase, isAdmin: contextIsAdmin } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(contextIsAdmin)
  const [isLoading, setIsLoading] = useState(!contextIsAdmin)
  const [order, setOrder] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false)
  const [redirectAttempted, setRedirectAttempted] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    // If contextIsAdmin is already true, we can load the order details directly
    if (contextIsAdmin) {
      setIsAdmin(true)
      setIsLoading(false)
      fetchOrderDetails()
      return
    }
    
    // If the user is not authenticated, redirect to login
    if (user === null && !redirectAttempted) {
      setRedirectAttempted(true)
      router.push(`/login?redirect=/admin/orders/${orderId}`)
      return
    }

    // If the user is defined but we haven't confirmed they're an admin, we check
    if (user && !contextIsAdmin) {
      checkAdminStatus()
    }
  }, [user, orderId, router, redirectAttempted, contextIsAdmin])

  const checkAdminStatus = async () => {
    try {
      console.log('Checking admin for user:', user.id)
      
      // Admin verification
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle()

      console.log('Admin verification result:', data, error)

      if (error) {
        console.error('Error checking admin status:', error)
        return
      }

      if (!data || !data.is_admin) {
        // Not an admin, redirect to home page, but only if we haven't already tried
        console.log('User is not admin:', user.id)
        if (!redirectAttempted) {
          setRedirectAttempted(true)
          router.push('/')
        }
        return
      }

      // Is admin, set state and load order details
      console.log('User is admin, loading order details')
      setIsAdmin(true)
      // Save status in localStorage to avoid future checks
      localStorage.setItem('isAdmin', 'true')
      await fetchOrderDetails()
    } catch (error) {
      console.error('Error checking admin status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrderDetails = async () => {
    try {
      console.log('Loading order details with ID:', orderId)
      
      // Check if we already have the order in localStorage
      const cachedOrder = localStorage.getItem(`order_${orderId}`)
      if (cachedOrder) {
        try {
          const parsedOrder = JSON.parse(cachedOrder)
          setOrder(parsedOrder)
          console.log('Order loaded from cache')
          
          // Still, load fresh data in the background
          loadFreshOrderDetails()
          return
        } catch (e) {
          console.error('Error parsing cached data:', e)
        }
      }
      
      loadFreshOrderDetails()
    } catch (error) {
      console.error('Error fetching order details:', error)
    }
  }
  
  const loadFreshOrderDetails = async () => {
    try {
      // Modify the query to correctly get order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle()

      if (orderError) {
        console.error('Error getting order:', orderError)
        throw orderError
      }

      if (!orderData) {
        console.log('No order found with the specified ID')
        return
      }

      console.log('Base order found:', orderData)

      // Get additional information in separate queries
      try {
        // Get order items
        const { data: orderItemsData, error: orderItemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        // Get shipping address
        // Here's the main change - we move the shipping address code outside of Promise.all
        const shippingAddressId = orderData.shipping_address_id;
        let shippingAddressData = null;
        let shippingAddressError = null;

        if (shippingAddressId) {
          const shippingAddressResponse = await supabase
            .from('shipping_addresses')
            .select('*')
            .eq('id', shippingAddressId)
            .maybeSingle();
          
          shippingAddressData = shippingAddressResponse.data;
          shippingAddressError = shippingAddressResponse.error;
        }

        // If we don't find the address by ID, try to find it through user_id
        if (!shippingAddressData && orderData.user_id) {
          const userAddressResponse = await supabase
            .from('shipping_addresses')
            .select('*')
            .eq('user_id', orderData.user_id)
            .eq('is_default', true)  // Try to get the default address
            .maybeSingle();
          
          if (userAddressResponse.data) {
            shippingAddressData = userAddressResponse.data;
            shippingAddressError = userAddressResponse.error;
          }
        }

        console.log('Shipping address response:', { data: shippingAddressData, error: shippingAddressError });

        // Get payment transactions and user profile in parallel
        const [paymentTransactionsResponse, profileResponse] = await Promise.all([
          // Get payment transactions
          supabase
            .from('payment_transactions')
            .select('*')
            .eq('order_id', orderId),
          
          // Get profile information, if order has user_id
          orderData.user_id ? 
            supabase
              .from('profiles')
              .select('id, email')
              .eq('id', orderData.user_id)
              .maybeSingle() 
            : Promise.resolve({ data: null, error: null })
        ]);

        // Combine all data into a single object, include guest fields
        const fullOrderData = {
          ...orderData,
          order_items: orderItemsError ? [] : orderItemsData || [],
          shipping_addresses: shippingAddressError ? null : shippingAddressData,
          payment_transactions: paymentTransactionsResponse.error ? [] : paymentTransactionsResponse.data || [],
          profiles: profileResponse.error ? null : profileResponse.data
        }

        console.log('Complete order data:', fullOrderData)
        setOrder(fullOrderData)
        
        // Save order in localStorage for future faster access
        localStorage.setItem(`order_${orderId}`, JSON.stringify(fullOrderData))
      } catch (error) {
        console.error('Error getting additional data:', error)
        // Set the base order even if we failed to get all additional data
        setOrder(orderData)
      }
    } catch (error) {
      console.error('Error loading fresh order details:', error)
    }
  }

  const updateOrderStatus = async (newStatus) => {
    try {
      setIsUpdating(true)
      setStatusUpdateSuccess(false)

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      // Refresh order data
      await fetchOrderDetails()
      setStatusUpdateSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setStatusUpdateSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'paid':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border border-purple-200'
      case 'completed':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'processing':
        return '🔄'
      case 'paid':
        return '✅'
      case 'shipped':
        return '🚚'
      case 'completed':
        return '🎉'
      case 'cancelled':
        return '❌'
      default:
        return '📋'
    }
  }

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-orange-500';
      case 'paid':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-indigo-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  const getImageUrl = (item) => {
    // Try to get the image URL from all possible fields
    let imageUrl = item.image_url || item.fileData || item.image;
    
    // Check if the item might have custom_data with an image URL (common database pattern)
    if (!imageUrl && item.custom_data) {
      try {
        // If custom_data is stored as a string, parse it
        const customData = typeof item.custom_data === 'string' 
          ? JSON.parse(item.custom_data) 
          : item.custom_data;
          
        // Check if customData has image information
        imageUrl = customData.image || customData.imageUrl || customData.url;
      } catch (error) {
        console.error('Error parsing custom_data:', error);
      }
    }
    
    // Check for metadata field (common in Supabase)
    if (!imageUrl && item.metadata) {
      try {
        // If metadata is stored as a string, parse it
        const metadata = typeof item.metadata === 'string' 
          ? JSON.parse(item.metadata) 
          : item.metadata;
          
        // Check if metadata has image information  
        imageUrl = metadata.image || metadata.imageUrl || metadata.url;
      } catch (error) {
        console.error('Error parsing metadata:', error);
      }
    }
    
    // If no image found, return null
    if (!imageUrl) {
      return null; // Return null to indicate no image is available
    }
    
    // If URL is in Supabase storage format, convert to public URL
    if (imageUrl && imageUrl.includes('magnet_images/')) {
      try {
        // Extract path if it's a full storage URL
        if (imageUrl.includes('storage/v1/object/public/')) {
          return imageUrl; // Already a public URL
        }
        
        // If it's just a path, convert to public URL
        if (imageUrl.startsWith('magnet_images/')) {
          return supabaseClient.storage
            .from('magnet_images')
            .getPublicUrl(imageUrl.replace('magnet_images/', '')).data.publicUrl;
        }
        
        // If it contains the path but isn't formatted correctly
        const pathMatch = imageUrl.match(/magnet_images\/(.+)/);
        if (pathMatch && pathMatch[1]) {
          return supabaseClient.storage
            .from('magnet_images')
            .getPublicUrl(pathMatch[1]).data.publicUrl;
        }
      } catch (error) {
        console.error('Error creating public URL:', error);
        return imageUrl; // Return original URL if conversion fails
      }
    }
    
    return imageUrl;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
            <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => setPreviewImage(null)}
                  className="bg-white rounded-full p-3 hover:bg-gray-100 focus:outline-none shadow-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <img src={previewImage.url} alt={previewImage.name} className="max-h-[80vh] w-full object-contain" />
                <div className="p-6 flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{previewImage.name}</h3>
                    {previewImage.size && <p className="text-sm text-gray-600 mt-1">Dimensiune: {previewImage.size}</p>}
                  </div>
                  {previewImage.url && (
                    <a 
                      href={previewImage.url} 
                      download={`magnet-${previewImage.id}.jpg`}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center font-medium transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descarcă Imaginea
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">📋</span>
                Detalii Comandă
              </h1>
              <div className="mt-2 flex items-center space-x-4">
                <p className="text-sm sm:text-base text-gray-600">
                  ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">#{order.id.substring(0, 8)}...</span>
                </p>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                  {getStatusEmoji(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/admin/orders"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Înapoi la Comenzi
              </Link>
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                <span className="mr-1">🟢</span>
                Live
              </div>
            </div>
          </div>
        </div>



        {/* Success Message */}
        {statusUpdateSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  ✅ Statusul comenzii a fost actualizat cu succes!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm border border-indigo-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
                <span className="mr-2">💰</span>
                Rezumat Comandă
              </h2>
              <div className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                £{order.total.toFixed(2)}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-700">📅 Data comenzii:</span>
                <span className="text-sm font-medium text-indigo-900">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-700">📊 Status:</span>
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                  {getStatusEmoji(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-700">💵 Subtotal:</span>
                <span className="text-sm font-medium text-indigo-900">£{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-700">🚚 Livrare:</span>
                <span className="text-sm font-medium text-indigo-900">
                  {order.shipping_cost > 0 ? `£${order.shipping_cost.toFixed(2)}` : 'GRATUITĂ'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-indigo-200">
                <span className="text-sm font-semibold text-indigo-900">💎 Total:</span>
                <span className="text-lg font-bold text-indigo-900">£{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-green-900 flex items-center">
                <span className="mr-2">👤</span>
                Informații Client
              </h2>
              <div className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {order.user_id ? 'Înregistrat' : 'Guest'}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-green-700 block mb-1">👨‍💼 Nume:</span>
                <span className="text-sm font-medium text-green-900">{order.shipping_addresses?.full_name || order.guest_full_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-green-700 block mb-1">📧 Email:</span>
                <span className="text-sm font-medium text-green-900 break-all">{order.profiles?.email || order.guest_email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-green-700 block mb-1">📱 Telefon:</span>
                <span className="text-sm font-medium text-green-900">{order.shipping_addresses?.phone || order.guest_phone || 'N/A'}</span>
              </div>
              {order.user_id && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">
                    ✅ Client cu cont înregistrat
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-purple-900 flex items-center">
                <span className="mr-2">🏠</span>
                Adresa de Livrare
              </h2>
              <div className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                UK
              </div>
            </div>
            {order.shipping_addresses ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-900">{order.shipping_addresses.full_name || 'N/A'}</p>
                <p className="text-sm text-purple-800">{order.shipping_addresses.address_line1 || 'N/A'}</p>
                {order.shipping_addresses.address_line2 && (
                  <p className="text-sm text-purple-800">{order.shipping_addresses.address_line2}</p>
                )}
                <p className="text-sm text-purple-800">
                  {order.shipping_addresses.city || 'N/A'}, {order.shipping_addresses.county || 'N/A'}
                </p>
                <p className="text-sm font-medium text-purple-900">{order.shipping_addresses.postal_code || 'N/A'}</p>
                <p className="text-sm text-purple-800">📞 {order.shipping_addresses.phone || 'N/A'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-900">{order.guest_full_name || 'N/A'}</p>
                <p className="text-sm text-purple-800">{order.guest_address_line1 || 'N/A'}</p>
                {order.guest_address_line2 && (
                  <p className="text-sm text-purple-800">{order.guest_address_line2}</p>
                )}
                <p className="text-sm text-purple-800">{order.guest_city || 'N/A'}, {order.guest_county || 'N/A'}</p>
                <p className="text-sm font-medium text-purple-900">{order.guest_postal_code || 'N/A'}</p>
                <p className="text-sm text-purple-800">📞 {order.guest_phone || 'N/A'}</p>
                {order.guest_email && (
                  <p className="text-sm text-purple-700">📧 {order.guest_email}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-orange-900 flex items-center">
                <span className="mr-3">🛍️</span>
                Produse Comandate
              </h2>
              <div className="flex items-center space-x-3">
                <span className="bg-orange-200 text-orange-800 py-1 px-3 rounded-full text-sm font-medium">
                  {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'produs' : 'produse'}
                </span>
                <span className="bg-white text-orange-900 py-1 px-3 rounded-full text-sm font-semibold shadow-sm">
                  Total: £{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {order.order_items && order.order_items.length > 0 ? (
              order.order_items.map((item, index) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image section */}
                    <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
                      {(() => {
                        const imageUrl = getImageUrl(item);
                        
                        return imageUrl ? (
                          <>
                            {/* Product number badge */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                                Produs #{index + 1}
                              </span>
                              <span className="text-xs text-gray-500">
                                ID: {item.id.substring(0, 8)}
                              </span>
                            </div>
                            
                            {/* Image container */}
                            <div className="relative overflow-hidden rounded-xl shadow-lg border-2 border-gray-200 aspect-square bg-white">
                              <img
                                src={imageUrl}
                                alt={item.product_name}
                                className="w-full h-full object-contain p-3"
                                onError={(e) => {
                                  console.error("Error loading image:", e);
                                  e.target.src = "/placeholder-magnet.png";
                                }}
                              />
                              <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                                <span className="text-xs">🧲</span>
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => setPreviewImage({
                                  url: imageUrl,
                                  name: item.product_name,
                                  id: item.id,
                                  size: item.size
                                })}
                                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                              >
                                <span>🔍</span>
                                Previzualizare
                              </button>
                              
                              <a 
                                href={imageUrl} 
                                download={`magnet-${item.id}.jpg`}
                                className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                              >
                                <span>⬇️</span>
                                Descarcă
                              </a>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                                Produs #{index + 1}
                              </span>
                              <span className="text-xs text-gray-500">
                                ID: {item.id.substring(0, 8)}
                              </span>
                            </div>
                            
                            <div className="bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 aspect-square flex items-center justify-center">
                              <div className="text-center p-4">
                                <div className="text-4xl mb-2">📷</div>
                                <span className="text-sm text-gray-500 font-medium">Fără imagine</span>
                              </div>
                            </div>
                            
                            <button className="py-2 px-3 w-full bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
                              <span className="mr-1">⚠️</span>
                              Imagine indisponibilă
                            </button>
                          </>
                        );
                      })()}
                    </div>
                    
                    {/* Product details */}
                    <div className="flex-1">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                          <span className="mr-2">🧲</span>
                          {item.product_name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            Magnet personalizat
                          </span>
                          {item.size && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              📏 {item.size}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-900">📦 Cantitate</span>
                            <span className="text-lg font-bold text-blue-900">{item.quantity}</span>
                          </div>
                          <div className="text-xs text-blue-700">
                            {item.quantity === 1 ? 'Bucată' : 'Bucăți'}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-900">💰 Preț/bucată</span>
                            <span className="text-lg font-bold text-green-900">£{parseFloat(item.price_per_unit).toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-green-700">
                            Total: £{(item.price_per_unit * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {item.special_requirements && (
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                          <div className="flex items-start">
                            <span className="text-lg mr-2">📝</span>
                            <div>
                              <h4 className="font-medium text-amber-900 mb-1">Cerințe speciale:</h4>
                              <p className="text-sm text-amber-800 leading-relaxed">
                                {item.special_requirements}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Nu există produse</h4>
                <p className="text-gray-500">Această comandă nu conține produse</p>
              </div>
            )}
          </div>
        </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
        {order.payment_transactions && order.payment_transactions.length > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Method:</span>
              <span className="text-sm font-medium capitalize">{order.payment_transactions[0].payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Status:</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.payment_transactions[0].status)}`}>
                {order.payment_transactions[0].status.charAt(0).toUpperCase() + order.payment_transactions[0].status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Transaction ID:</span>
              <span className="text-sm font-medium">{order.payment_transactions[0].stripe_payment_intent_id?.substring(0, 12) || 'N/A'}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Date:</span>
              <span className="text-sm font-medium">{formatDate(order.payment_transactions[0].created_at)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No payment information available</p>
        )}
      </div>

      {/* Update Order Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h2>
        
        {/* Progress Bar for visualizing order flow */}
        <div className="mb-6">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-xs font-semibold text-indigo-600 uppercase">
                Order Progress
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block uppercase">
                  {order.status}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              {order.status === 'pending' && (
                <div style={{ width: "20%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"></div>
              )}
              {order.status === 'paid' && (
                <div style={{ width: "40%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
              )}
              {order.status === 'shipped' && (
                <div style={{ width: "60%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              )}
              {order.status === 'completed' && (
                <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
              )}
              {order.status === 'cancelled' && (
                <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
              )}
            </div>
          </div>
        </div>
        
        {/* Buttons for updating status, organized by flow */}
        <div className="flex flex-col space-y-4">
          {/* Recommendation of next status based on current status */}
          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <div className="mb-2 p-3 border border-indigo-100 bg-indigo-50 rounded-md">
              <p className="text-sm text-indigo-700">
                <span className="font-medium">Recommended action:</span> {' '}
                {order.status === 'pending' ? 'Mark order as paid' : 
                 order.status === 'paid' ? 'Mark order as shipped' : 
                 order.status === 'shipped' ? 'Mark order as completed' : ''}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Grouping buttons by flow */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Normal flow</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => updateOrderStatus('pending')}
                  disabled={order.status === 'pending' || isUpdating || order.status === 'cancelled'}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    order.status === 'pending' || isUpdating || order.status === 'cancelled'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => updateOrderStatus('paid')}
                  disabled={order.status === 'paid' || isUpdating || order.status === 'cancelled' || 
                           (order.status !== 'pending' && order.status !== 'processing')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    order.status === 'paid' || isUpdating || order.status === 'cancelled' || 
                    (order.status !== 'pending' && order.status !== 'processing')
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => updateOrderStatus('shipped')}
                  disabled={order.status === 'shipped' || isUpdating || order.status === 'cancelled' || 
                           (order.status !== 'paid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    order.status === 'shipped' || isUpdating || order.status === 'cancelled' || 
                    (order.status !== 'paid')
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  Shipped
                </button>
                <button
                  onClick={() => updateOrderStatus('completed')}
                  disabled={order.status === 'completed' || isUpdating || order.status === 'cancelled' || 
                           (order.status !== 'shipped')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    order.status === 'completed' || isUpdating || order.status === 'cancelled' || 
                    (order.status !== 'shipped')
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Special actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => updateOrderStatus('processing')}
                  disabled={order.status === 'processing' || isUpdating || order.status === 'cancelled' || 
                           (order.status !== 'pending')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    order.status === 'processing' || isUpdating || order.status === 'cancelled' || 
                    (order.status !== 'pending')
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                  }`}
                >
                  Processing
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
                      updateOrderStatus('cancelled');
                    }
                  }}
                  disabled={order.status === 'cancelled' || isUpdating || order.status === 'completed'}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    order.status === 'cancelled' || isUpdating || order.status === 'completed'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  Cancel order
                </button>
              </div>
            </div>
          </div>
          
          {/* Notify user - optional */}
          {(order.status === 'paid' || order.status === 'shipped' || order.status === 'completed') && (
            <div className="mt-4">
              <div className="flex items-center">
                <input 
                  id="notify-customer" 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="notify-customer" className="ml-2 block text-sm text-gray-700">
                  Notify customer about status change
                </label>
              </div>
            </div>
          )}
        </div>
        
        {isUpdating && (
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
            Updating order status...
          </div>
        )}
        
        {/* Status History - optional */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Status History</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${getStatusBadgeClass(order.status)}`}></span>
                <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
              </div>
              <span className="text-gray-500">{formatDate(order.updated_at || order.created_at)}</span>
            </div>
            {/* Here you can add more history elements if you store status history */}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
} 
