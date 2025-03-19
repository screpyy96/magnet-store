'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { clearCart } from '@/store/cartSlice'

export default function OrderConfirmation() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  
  // Obține ID-ul comenzii din parametrii URL
  const orderId = searchParams.get('orderId')
  
  // Adaugă parametrul status
  const status = searchParams.get('status')
  const isPaymentSuccessful = status === 'success'
  
  useEffect(() => {
    if (!orderId) {
      // Dacă nu există ID comandă, redirecționează către pagina principală
      router.push('/')
      return
    }
    
    // Încarcă detaliile comenzii
    const loadOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) throw new Error('Nu am putut încărca detaliile comenzii')
        
        const data = await response.json()
        setOrderDetails(data)
      } catch (error) {
        console.error('Eroare la încărcarea detaliilor comenzii:', error)
      } finally {
        setLoading(false)
      }
    }
    
    // Dacă plata a fost reușită, actualizăm statusul comenzii
    if (isPaymentSuccessful) {
      updateOrderStatus()
    }
    
    loadOrderDetails()
  }, [orderId, isPaymentSuccessful, router])
  
  // Adaugă funcția pentru actualizarea statusului comenzii
  const updateOrderStatus = async () => {
    try {
      await fetch(`/api/orders/${orderId}/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'paid' // sau statusul care reflectă plata reușită
        }),
      })
      
      // Actualizăm Redux store pentru a curăța coșul
      dispatch(clearCart())
    } catch (error) {
      console.error('Eroare la actualizarea statusului comenzii:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Se încarcă detaliile comenzii...</h2>
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent mx-auto"></div>
        </div>
      </div>
    )
  }
  
  if (!orderDetails) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Nu am putut găsi detaliile comenzii</h2>
          <p className="mb-4">Ne pare rău, dar nu am putut găsi informații despre comanda ta.</p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            Înapoi la pagina principală
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        {isPaymentSuccessful && (
          <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6 text-center">
            <div className="font-bold mb-2">Plată procesată cu succes!</div>
            <div>Mulțumim pentru comanda ta. Vei primi un email cu confirmarea comenzii.</div>
          </div>
        )}
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-green-100 rounded-full mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Comandă confirmată!</h1>
          <p className="text-gray-600 mt-2">Îți mulțumim pentru comandă.</p>
        </div>
        
        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Număr comandă:</span>
            <span className="text-gray-600">{orderDetails.id}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Data:</span>
            <span className="text-gray-600">
              {new Date(orderDetails.created_at).toLocaleDateString('ro-RO')}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Status:</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {orderDetails.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total:</span>
            <span className="font-bold">{orderDetails.total_amount} lei</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Rezumatul comenzii</h3>
          {orderDetails.items?.map((item, index) => (
            <div key={index} className="flex justify-between py-2 border-b">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-gray-500">Cantitate: {item.quantity}</p>
              </div>
              <span>{item.price * item.quantity} lei</span>
            </div>
          ))}
        </div>
        
        <div className="mt-8 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Informații livrare</h3>
            <p>{orderDetails.shipping_address?.full_name}</p>
            <p>{orderDetails.shipping_address?.address}</p>
            <p>{orderDetails.shipping_address?.city}, {orderDetails.shipping_address?.postal_code}</p>
            <p>{orderDetails.shipping_address?.country}</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/account" 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md"
          >
            Vezi toate comenzile
          </Link>
        </div>
      </div>
    </div>
  )
} 