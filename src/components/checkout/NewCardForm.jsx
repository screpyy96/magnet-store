'use client'

import { useState, useEffect } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '@/contexts/AuthContext'
import { formatCardError } from '@/lib/stripe-client'

export default function NewCardForm({ onSuccess, onCancel }) {
  const stripe = useStripe()
  const elements = useElements()
  const { user, supabase } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isDefault, setIsDefault] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    console.log('User in NewCardForm:', user);
    
    if (!user || !user.id) {
      console.log('User sau user.id lipsește:', user);
      const timer = setTimeout(() => {
        if (!user || !user.id) {
          setError('Sesiune utilizator invalidă. Încearcă să te deloghezi și să te loghezi din nou.');
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }

    // Pentru dezvoltare locală, evităm apelul la API
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: using mock client secret');
      setClientSecret('seti_mock_12345');
      return;
    }

    // Codul pentru producție
    const getSetupIntent = async () => {
      try {
        console.log('Obținere setup intent pentru utilizatorul:', user.id);
        setIsLoading(true);
        
        const response = await fetch('/api/stripe/setup-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });

        const data = await response.json()
        
        console.log('Setup intent response status:', response.status);
        console.log('Setup intent response data:', data);
        
        if (!response.ok) {
          throw new Error(data.error || `Request failed with status ${response.status}`)
        }

        if (!data.clientSecret) {
          throw new Error('No client secret received from the server')
        }

        setClientSecret(data.clientSecret)
      } catch (error) {
        console.error('Error getting setup intent:', error)
        setError(error.message || 'Failed to set up payment method')
      } finally {
        setIsLoading(false)
      }
    }

    getSetupIntent()
  }, [user])

  useEffect(() => {
    // Verifică sesiunea în consolă
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      console.log('Current session status:', data)
      if (error) {
        console.error('Session check error:', error)
      }
    }
    
    checkSession()
  }, [supabase.auth])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user || !user.id) {
      setError('Trebuie să fii autentificat pentru a adăuga o metodă de plată.');
      return;
    }
    
    if (!stripe || !elements) {
      setError('Stripe nu s-a încărcat corect. Reîncarcă pagina și încearcă din nou.');
      return;
    }
    
    if (!clientSecret) {
      setError('Nu s-a putut obține un client secret. Încearcă din nou mai târziu.');
      return;
    }

    setIsLoading(true)
    setError(null)

    try {
      setProcessing(true)
      
      if (process.env.NODE_ENV === 'development' && clientSecret === 'seti_mock_12345') {
        const mockPaymentMethodId = 'pm_mock_' + Math.random().toString(36).substring(2, 10);
        
        const mockCardDetails = {
          id: mockPaymentMethodId,
          last4: '4242',
          brand: 'visa',
          exp_month: 12,
          exp_year: 2030,
          is_default: isDefault,
        };
        
        console.log('Simulare card salvat în modul de dezvoltare:', mockCardDetails);
        
        const { error: dbError } = await supabase
          .from('payment_methods')
          .insert([
            {
              user_id: user.id,
              stripe_payment_method_id: mockPaymentMethodId,
              is_default: isDefault,
              status: 'active',
              last4: '4242',
              brand: 'visa',
              exp_month: 12,
              exp_year: 2030,
            },
          ]);
          
        if (dbError) {
          console.error('Eroare la salvarea metodei de plată în baza de date:', dbError);
          throw dbError;
        }
        
        onSuccess(mockCardDetails);
        setProcessing(false);
        setIsLoading(false);
        return;
      }

      // Confirm card setup
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user?.user_metadata?.full_name || user?.email || 'Customer',
          },
        },
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      // Get payment method details from our API
      const pmResponse = await fetch('/api/stripe/payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: result.setupIntent.payment_method
        }),
      })

      if (!pmResponse.ok) {
        throw new Error('Failed to retrieve payment method details')
      }

      const paymentMethod = await pmResponse.json()

      // Save to database
      const { error: dbError } = await supabase
        .from('payment_methods')
        .insert([
          {
            user_id: user.id,
            stripe_payment_method_id: result.setupIntent.payment_method,
            is_default: isDefault,
            status: 'active',
            last4: paymentMethod.card.last4,
            brand: paymentMethod.card.brand,
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year,
          },
        ])

      if (dbError) throw dbError

      onSuccess({
        id: result.setupIntent.payment_method,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
        is_default: isDefault,
      })

    } catch (err) {
      console.error('Error saving card:', err)
      setError(formatCardError(err))
    } finally {
      setIsLoading(false)
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="border rounded-lg p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
        <div className="text-sm text-gray-500">
          <p>Test card: 4242 4242 4242 4242</p>
          <p>Expiry: Any future date (ex: 12/34)</p>
          <p>CVC: Any 3 digits (ex: 123)</p>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="defaultCard"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="defaultCard">Set as default payment method</label>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={!stripe || !clientSecret || processing}
          className={`w-full py-2 px-4 rounded-md text-white font-medium 
            ${processing ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {processing ? 'Processing...' : 'Add Card'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  )
} 