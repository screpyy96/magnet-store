-- Supabase Schema Recreation Script
-- Generated based on codebase analysis

-- Stop on error
\set ON_ERROR_STOP on

BEGIN;

-- 1. Drop existing objects to start fresh
DROP TABLE IF EXISTS public.deletion_requests CASCADE;
DROP TABLE IF EXISTS public.payment_transactions CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.shipping_addresses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.order_status;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.deletion_request_status;

-- 2. Create ENUM types for status columns for data consistency
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
);

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'requires_payment_method',
    'requires_confirmation',
    'requires_action',
    'processing',
    'requires_capture',
    'canceled',
    'succeeded',
    'failed'
);

CREATE TYPE public.deletion_request_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

-- 3. Create Tables

-- Profiles Table (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.profiles IS 'Stores public user profile information.';

-- Shipping Addresses Table
CREATE TABLE public.shipping_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    county TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'Romania' NOT NULL,
    phone TEXT,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.shipping_addresses IS 'Stores shipping addresses for users.';

-- Payment Methods Table
CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_method_id TEXT UNIQUE NOT NULL,
    card_brand TEXT,
    last4 TEXT,
    exp_month INT,
    exp_year INT,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.payment_methods IS 'Stores customer payment methods.';

-- Orders Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    shipping_address_id UUID REFERENCES public.shipping_addresses(id) ON DELETE SET NULL,
    status public.order_status DEFAULT 'pending' NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    payment_status public.payment_status,
    payment_intent_id TEXT UNIQUE,
    tracking_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.orders IS 'Stores customer order information.';

-- Order Items Table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT,
    product_name TEXT NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    size TEXT,
    image_url TEXT,
    special_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.order_items IS 'Stores individual items within an order.';

-- Payment Transactions Table
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL,
    status public.payment_status NOT NULL,
    payment_method_id TEXT,
    stripe_payment_intent_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.payment_transactions IS 'Logs all payment attempts and transactions.';

-- Data Deletion Requests Table
CREATE TABLE public.deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- A user can only have one open request
    status public.deletion_request_status DEFAULT 'pending' NOT NULL,
    reason TEXT,
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.deletion_requests IS 'Handles user requests for data deletion.';


-- 4. Create Functions and Triggers

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Trigger to create a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically update 'updated_at' columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER on_profiles_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_shipping_addresses_update
  BEFORE UPDATE ON public.shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_payment_methods_update
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_orders_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 5. Set up Row Level Security (RLS)

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles Policies
CREATE POLICY "Users can manage their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Shipping Addresses Policies
CREATE POLICY "Users can manage their own shipping addresses" ON public.shipping_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Payment Methods Policies
CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Orders Policies
CREATE POLICY "Users can manage their own orders" ON public.orders
  FOR ALL USING (auth.uid() = user_id);

-- Order Items Policies
CREATE POLICY "Users can view order items for their own orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Payment Transactions Policies
CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Deletion Requests Policies
CREATE POLICY "Users can create and view their own deletion requests" ON public.deletion_requests
  FOR ALL USING (auth.uid() = user_id);

-- Admin Policies (Example - Admins can see everything)
-- Note: You need a way to identify admins, e.g., the is_admin flag in the profiles table.
-- This requires a helper function to check for admin status.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  );
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Create function to create user profile
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  full_name TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (user_id, user_email, full_name)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT) TO authenticated;

-- Create function to get user admin status
CREATE OR REPLACE FUNCTION public.get_user_admin_status(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = user_id AND profiles.is_admin = TRUE
  );
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_admin_status(UUID) TO authenticated;

-- Create function to get user orders with items
CREATE OR REPLACE FUNCTION public.get_user_orders_with_items(user_id UUID)
RETURNS TABLE (
  orders JSON,
  order_items JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    json_agg(
      json_build_object(
        'id', o.id,
        'user_id', o.user_id,
        'status', o.status,
        'total_amount', o.total_amount,
        'created_at', o.created_at,
        'updated_at', o.updated_at
      )
    ) as orders,
    json_agg(
      json_build_object(
        'id', oi.id,
        'order_id', oi.order_id,
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'price', oi.price,
        'image_url', oi.image_url,
        'custom_data', oi.custom_data
      )
    ) as order_items
  FROM public.orders o
  LEFT JOIN public.order_items oi ON o.id = oi.order_id
  WHERE o.user_id = get_user_orders_with_items.user_id
  GROUP BY o.id;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_orders_with_items(UUID) TO authenticated;

-- Create function to get admin orders
CREATE OR REPLACE FUNCTION public.get_admin_orders()
RETURNS TABLE (
  orders JSON,
  order_items JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    json_agg(
      json_build_object(
        'id', o.id,
        'user_id', o.user_id,
        'status', o.status,
        'total_amount', o.total_amount,
        'created_at', o.created_at,
        'updated_at', o.updated_at
      )
    ) as orders,
    json_agg(
      json_build_object(
        'id', oi.id,
        'order_id', oi.order_id,
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'price', oi.price,
        'image_url', oi.image_url,
        'custom_data', oi.custom_data
      )
    ) as order_items
  FROM public.orders o
  LEFT JOIN public.order_items oi ON o.id = oi.order_id
  GROUP BY o.id
  ORDER BY o.created_at DESC;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_orders() TO authenticated;

-- Create function to validate discount codes
CREATE OR REPLACE FUNCTION public.validate_discount_code(code TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_percent INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder function - you can implement your own discount logic
  RETURN QUERY
  SELECT 
    CASE 
      WHEN code = 'WELCOME10' THEN TRUE
      WHEN code = 'SAVE20' THEN TRUE
      ELSE FALSE
    END as is_valid,
    CASE 
      WHEN code = 'WELCOME10' THEN 10
      WHEN code = 'SAVE20' THEN 20
      ELSE 0
    END as discount_percent,
    CASE 
      WHEN code = 'WELCOME10' THEN 'Welcome discount applied!'
      WHEN code = 'SAVE20' THEN '20% discount applied!'
      ELSE 'Invalid discount code'
    END as message;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_discount_code(TEXT) TO authenticated;

-- Create push subscriptions table and functions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to create push subscriptions function
CREATE OR REPLACE FUNCTION public.create_push_subscriptions_function()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is called during setup to ensure the push_subscriptions table exists
  -- The table is already created above, so this function just returns
  RETURN;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.create_push_subscriptions_function() TO authenticated;

-- Create function to create push subscriptions if not exists
CREATE OR REPLACE FUNCTION public.create_push_subscriptions_if_not_exists()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is called during setup to ensure the push_subscriptions table exists
  -- The table is already created above, so this function just returns
  RETURN;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.create_push_subscriptions_if_not_exists() TO authenticated;

-- Create policies for push subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create trigger for push subscriptions updated_at
CREATE TRIGGER on_push_subscriptions_update
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- Now, create admin override policies
CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to shipping addresses" ON public.shipping_addresses
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to payment methods" ON public.payment_methods
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to orders" ON public.orders
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to order items" ON public.order_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to payment transactions" ON public.payment_transactions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to deletion requests" ON public.deletion_requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


COMMIT;

-- End of script