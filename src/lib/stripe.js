import { loadStripe } from '@stripe/stripe-js'

// Load the Stripe publishable key from environment variable
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default stripePromise

// Helper function to format card errors
export const formatCardError = (error) => {
  const knownErrors = {
    'card_declined': 'Card was declined. Please try another card.',
    'expired_card': 'Card is expired. Please try another card.',
    'incorrect_cvc': 'CVC code is incorrect. Please check and try again.',
    'incorrect_number': 'Card number is incorrect. Please check and try again.',
    'incomplete_number': 'Card number is incomplete. Please check and try again.',
    'incomplete_cvc': 'CVC code is incomplete. Please check and try again.',
    'incomplete_expiry': 'Expiry date is incomplete. Please check and try again.',
    'invalid_expiry_month': 'Expiry month is invalid. Please check and try again.',
    'invalid_expiry_year': 'Expiry year is invalid. Please check and try again.',
  }

  if (error.type === 'card_error' || error.type === 'validation_error') {
    return knownErrors[error.code] || error.message
  }
  
  return 'An unexpected error occurred. Please try again later.'
} 