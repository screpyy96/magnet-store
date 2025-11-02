-- Script pentru debugging comenzi Stripe -> Supabase

-- 1. Verifică ultimele comenzi
SELECT 
    id,
    user_id,
    status,
    payment_status,
    payment_intent_id,
    total,
    created_at,
    guest_email
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Verifică comenzile cu payment_intent_id
SELECT 
    id,
    payment_intent_id,
    payment_status,
    status,
    total,
    created_at
FROM orders 
WHERE payment_intent_id IS NOT NULL
ORDER BY created_at DESC;

-- 3. Verifică items-urile din comenzi
SELECT 
    o.id as order_id,
    o.payment_intent_id,
    o.payment_status,
    o.total as order_total,
    oi.product_name,
    oi.quantity,
    oi.price_per_unit,
    oi.image_url,
    o.created_at
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
ORDER BY o.created_at DESC
LIMIT 20;

-- 4. Verifică comenzile fără items (problematic)
SELECT 
    o.id,
    o.payment_intent_id,
    o.status,
    o.total,
    o.created_at,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.payment_intent_id, o.status, o.total, o.created_at
HAVING COUNT(oi.id) = 0
ORDER BY o.created_at DESC;

-- 5. Statistici generale
SELECT 
    status,
    payment_status,
    COUNT(*) as count,
    SUM(total) as total_amount
FROM orders
GROUP BY status, payment_status
ORDER BY count DESC;

-- 6. Verifică comenzile din ultima oră
SELECT 
    id,
    payment_intent_id,
    status,
    payment_status,
    total,
    guest_email,
    created_at
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 7. Verifică comenzile guest vs user
SELECT 
    CASE 
        WHEN user_id IS NULL THEN 'Guest'
        ELSE 'Registered User'
    END as customer_type,
    COUNT(*) as order_count,
    SUM(total) as total_revenue
FROM orders
GROUP BY customer_type;

-- 8. Detalii complete comenzi GUEST cu imagini
SELECT 
    o.id as order_id,
    o.guest_email,
    o.guest_full_name,
    o.guest_phone,
    o.guest_address_line1,
    o.guest_city,
    o.guest_county,
    o.guest_postal_code,
    o.total as order_total,
    o.payment_status,
    o.payment_intent_id,
    oi.product_name,
    oi.image_url,
    oi.size,
    oi.price_per_unit,
    oi.special_requirements,
    o.created_at
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id IS NULL  -- Doar comenzi guest
ORDER BY o.created_at DESC, oi.product_name;

-- 9. Verifică comenzile guest fără detalii complete (problematic)
SELECT 
    id,
    guest_email,
    guest_full_name,
    guest_city,
    total,
    payment_status,
    created_at,
    CASE 
        WHEN guest_email IS NULL THEN '❌ Missing email'
        WHEN guest_full_name IS NULL THEN '❌ Missing name'
        WHEN guest_address_line1 IS NULL THEN '❌ Missing address'
        WHEN guest_city IS NULL THEN '❌ Missing city'
        WHEN guest_phone IS NULL THEN '⚠️ Missing phone'
        ELSE '✅ Complete'
    END as data_status
FROM orders
WHERE user_id IS NULL
ORDER BY created_at DESC;

-- 10. Comenzi guest cu număr de imagini
SELECT 
    o.id,
    o.guest_email,
    o.guest_full_name,
    o.total,
    o.payment_status,
    COUNT(oi.id) as image_count,
    STRING_AGG(oi.product_name, ', ') as products,
    o.created_at
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id IS NULL
GROUP BY o.id, o.guest_email, o.guest_full_name, o.total, o.payment_status, o.created_at
ORDER BY o.created_at DESC;
