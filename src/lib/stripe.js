import Stripe from 'stripe'

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      console.warn('STRIPE_SECRET_KEY not available during build');
      return { paymentIntents: { create: () => Promise.resolve({}) } };
    }
    throw new Error('STRIPE_SECRET_KEY is missing. Please check your environment variables.')
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
  })
}

// Lazy initialization with Proxy for legacy compatibility  
export const stripe = new Proxy({}, {
  get(target, prop) {
    if (!target._instance) {
      target._instance = getStripe();
    }
    return target._instance[prop];
  }
})

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