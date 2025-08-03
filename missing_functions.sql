-- Missing functions that need to be created in Supabase
-- Execute this in your Supabase SQL editor

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