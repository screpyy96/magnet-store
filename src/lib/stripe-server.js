import Stripe from 'stripe'

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    // During build time, return a mock
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      console.warn('STRIPE_SECRET_KEY not available during build');
      return { paymentIntents: { create: () => Promise.resolve({}) } };
    }
    throw new Error('STRIPE_SECRET_KEY is missing. Please check your environment variables.')
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
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