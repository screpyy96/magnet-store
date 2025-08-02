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