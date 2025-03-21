import { loadStripe } from '@stripe/stripe-js'

export const getStripe = () => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  return stripePromise
}

export const formatCardError = (error) => {
  switch (error.code) {
    case 'card_declined':
      return 'Your card was declined. Please try another card.'
    case 'expired_card':
      return 'Your card has expired. Please try another card.'
    case 'incorrect_cvc':
      return 'The CVC number is incorrect. Please try again.'
    case 'processing_error':
      return 'There was an error processing your card. Please try again.'
    default:
      return 'There was an error with your payment. Please try again.'
  }
} 