-- Script pentru verificarea și adăugarea câmpurilor guest în tabelul orders

-- 1. VERIFICARE: Vezi ce coloane guest există deja
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
AND column_name LIKE 'guest%'
ORDER BY column_name;

-- 2. ADAUGĂ toate câmpurile guest (IF NOT EXISTS previne erori dacă există deja)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_full_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_address_line1 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_address_line2 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_county TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_postal_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- 3. ADAUGĂ comentarii pentru documentație
COMMENT ON COLUMN orders.guest_email IS 'Email address for guest orders (when user_id is null)';
COMMENT ON COLUMN orders.guest_full_name IS 'Full name for guest orders';
COMMENT ON COLUMN orders.guest_address_line1 IS 'Address line 1 for guest orders';
COMMENT ON COLUMN orders.guest_address_line2 IS 'Address line 2 for guest orders (optional)';
COMMENT ON COLUMN orders.guest_city IS 'City for guest orders';
COMMENT ON COLUMN orders.guest_county IS 'County/State for guest orders';
COMMENT ON COLUMN orders.guest_postal_code IS 'Postal/ZIP code for guest orders';
COMMENT ON COLUMN orders.guest_phone IS 'Phone number for guest orders';

-- 4. VERIFICARE FINALĂ: Confirmă că toate coloanele există
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
AND column_name LIKE 'guest%'
ORDER BY column_name;

-- 5. TEST: Verifică comenzile guest existente
SELECT 
    id,
    user_id,
    guest_email,
    guest_full_name,
    guest_city,
    total,
    payment_status,
    created_at
FROM orders
WHERE user_id IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- 6. STATISTICI: Câte comenzi guest vs registered users
SELECT 
    CASE 
        WHEN user_id IS NULL THEN 'Guest'
        ELSE 'Registered'
    END as customer_type,
    COUNT(*) as order_count,
    SUM(total) as total_revenue,
    AVG(total) as avg_order_value
FROM orders
GROUP BY customer_type;
