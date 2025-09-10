-- Queries pentru verificarea comenzilor în Supabase după testare

-- 1. Verifică ultimele comenzi (guest și registered users)
SELECT 
  id,
  user_id,
  guest_email,
  status,
  payment_status,
  total,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Verifică comenzile guest (user_id = null)
SELECT 
  id,
  guest_email,
  status,
  payment_status,
  total,
  payment_intent_id,
  created_at
FROM orders 
WHERE user_id IS NULL
ORDER BY created_at DESC;

-- 3. Verifică adresele create pentru guest orders
SELECT 
  sa.id,
  sa.user_id,
  sa.full_name,
  sa.address_line1,
  sa.city,
  sa.postal_code,
  sa.created_at,
  o.id as order_id,
  o.guest_email
FROM shipping_addresses sa
LEFT JOIN orders o ON sa.id = o.shipping_address_id
WHERE sa.user_id IS NULL
ORDER BY sa.created_at DESC;

-- 4. Verifică order items pentru ultimele comenzi
SELECT 
  oi.id,
  oi.order_id,
  oi.product_name,
  oi.quantity,
  oi.price_per_unit,
  oi.size,
  o.guest_email,
  o.user_id
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
ORDER BY oi.created_at DESC
LIMIT 20;

-- 5. Verifică payment transactions (dacă există)
SELECT 
  pt.id,
  pt.order_id,
  pt.amount,
  pt.status,
  pt.stripe_payment_intent_id,
  o.guest_email,
  o.user_id
FROM payment_transactions pt
JOIN orders o ON pt.order_id = o.id
ORDER BY pt.created_at DESC
LIMIT 10;
