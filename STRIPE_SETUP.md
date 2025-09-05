# Stripe Setup Guide

## 1. Create a Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account setup and verification process

## 2. Get Your API Keys
1. In your Stripe Dashboard, go to Developers > API keys
2. Copy your **Publishable key** and **Secret key**
3. For testing, use the test keys (they start with `pk_test_` and `sk_test_`)

## 3. Configure Environment Variables
Create a `.env.local` file in your project root with the following variables:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Test the Integration
1. Start your development server: `npm run dev`
2. Go through the checkout process
3. Use Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Expired**: `4000 0000 0000 0069`
   - **Incorrect CVC**: `4000 0000 0000 0127`

## 5. Webhook Setup (Optional for Production)
For production, you'll want to set up webhooks to handle payment events:

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## 6. Production Deployment
When deploying to production:

1. Replace test keys with live keys
2. Update `NEXT_PUBLIC_SITE_URL` to your production domain
3. Set up webhooks for production
4. Test the complete payment flow

## Security Notes
- Never commit your `.env.local` file to version control
- Keep your secret keys secure
- Use test keys for development
- Monitor your Stripe dashboard for any issues 