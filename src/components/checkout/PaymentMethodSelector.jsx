'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function PaymentMethodSelector({ selectedPaymentMethod, onPaymentMethodSelect }) {
  const { user } = useAuth()
  const [savedCards, setSavedCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSavedCards()
    }
  }, [user])

  const loadSavedCards = async () => {
    try {
      // Simulate loading saved cards
      const mockCards = [
        {
          id: 'card_1',
          user_id: user.id,
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
          is_default: true,
          status: 'active',
          stripe_payment_method_id: 'pm_mock_1'
        },
        {
          id: 'card_2',
          user_id: user.id,
          brand: 'mastercard',
          last4: '5555',
          exp_month: 8,
          exp_year: 2026,
          is_default: false,
          status: 'active',
          stripe_payment_method_id: 'pm_mock_2'
        }
      ]
      
      setSavedCards(mockCards)

      // Auto-select default payment method
      const defaultCard = mockCards.find(card => card.is_default)
      if (defaultCard && !selectedPaymentMethod) {
        onPaymentMethodSelect(defaultCard)
      }
    } catch (error) {
      console.error('Error loading payment methods:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCardNumber = (number) => `•••• •••• •••• ${number}`

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
                      <div className="h-8 w-12 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                    )}
                    {card.brand === 'mastercard' && (
                      <div className="h-8 w-12 bg-red-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">MC</span>
                      </div>
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

          <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-500 text-sm">
              💳 Payment processing will be added later with Stripe integration
            </p>
          </div>
        </>
      )}
    </div>
  )
} 