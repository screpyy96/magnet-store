'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe-client'
import NewCardForm from './NewCardForm'

export default function PaymentMethodSelector({ selectedPaymentMethod, onPaymentMethodSelect }) {
  const { user, supabase } = useAuth()
  const [savedCards, setSavedCards] = useState([])
  const [showNewCardForm, setShowNewCardForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSavedCards()
    }
  }, [user])

  const loadSavedCards = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('is_default', { ascending: false })

      if (error) throw error
      setSavedCards(data)

      // Auto-select default payment method
      const defaultCard = data.find(card => card.is_default)
      if (defaultCard && !selectedPaymentMethod) {
        onPaymentMethodSelect(defaultCard)
      }
    } catch (error) {
      console.error('Error loading payment methods:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewCardSaved = (newCard) => {
    setShowNewCardForm(false)
    setSavedCards([...savedCards, newCard])
    onPaymentMethodSelect(newCard)
  }

  const formatCardNumber = (number) => `•••• •••• •••• ${number.slice(-4)}`

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium mb-6">Payment Method</h2>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {savedCards.map(card => (
            <div
              key={card.id}
              className={`border p-4 rounded-lg mb-4 cursor-pointer ${
                selectedPaymentMethod?.id === card.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
              }`}
              onClick={() => onPaymentMethodSelect(card)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    {card.brand === 'visa' && (
                      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                        {/* Add Visa card SVG here */}
                      </svg>
                    )}
                    {card.brand === 'mastercard' && (
                      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                        {/* Add Mastercard SVG here */}
                      </svg>
                    )}
                    <span className="font-medium">{formatCardNumber(card.last4)}</span>
                  </div>
                  <p className="text-sm text-gray-600">Expires {card.exp_month}/{card.exp_year}</p>
                </div>
                {card.is_default && (
                  <span className="text-sm text-indigo-600">Default</span>
                )}
              </div>
            </div>
          ))}

          {showNewCardForm ? (
            <Elements stripe={getStripe()}>
              <NewCardForm
                onSuccess={handleNewCardSaved}
                onCancel={() => setShowNewCardForm(false)}
              />
            </Elements>
          ) : (
            <button
              onClick={() => setShowNewCardForm(true)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              + Add New Card
            </button>
          )}
        </>
      )}
    </div>
  )
} 