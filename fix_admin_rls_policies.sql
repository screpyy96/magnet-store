-- Fix RLS Policies pentru Admin Access

-- 1. VERIFICĂ policy-urile existente pentru orders
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- 2. VERIFICĂ funcția is_admin()
SELECT public.is_admin() as am_i_admin;

-- 3. VERIFICĂ dacă adminii pot citi toate comenzile
-- Dacă primești eroare aici, înseamnă că policy-ul lipsește sau nu funcționează
SELECT COUNT(*) as total_orders FROM orders;

-- 4. ȘTERGE policy-urile vechi care pot cauza conflicte (dacă există)
DROP POLICY IF EXISTS "Admins have full access to orders" ON orders;
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- 5. CREEAZĂ policy nou pentru admini să vadă TOATE comenzile
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (
    -- Adminii pot vedea toate comenzile
    public.is_admin() = TRUE
    OR
    -- Utilizatorii pot vedea doar comenzile lor
    auth.uid() = user_id
  );

-- 6. CREEAZĂ policy pentru admini să modifice comenzile
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

-- 7. CREEAZĂ policy pentru admini să șteargă comenzile
CREATE POLICY "Admins can delete orders" ON orders
  FOR DELETE
  USING (public.is_admin() = TRUE);

-- 8. VERIFICARE FINALĂ - Testează că adminii pot citi comenzile
SELECT 
    id,
    user_id,
    status,
    total,
    created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- 9. VERIFICĂ policy-urile pentru order_items
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'order_items'
ORDER BY policyname;

-- 10. FIX policy-uri pentru order_items (dacă e nevoie)
DROP POLICY IF EXISTS "Admins have full access to order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;

-- Policy pentru admini să vadă toate order_items
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT
  USING (
    public.is_admin() = TRUE
    OR
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Policy pentru admini să modifice order_items
CREATE POLICY "Admins can modify order items" ON order_items
  FOR ALL
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

-- 11. VERIFICARE COMPLETĂ
SELECT 
    'Orders' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as guest_orders,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as user_orders
FROM orders
UNION ALL
SELECT 
    'Order Items' as table_name,
    COUNT(*) as total_rows,
    NULL as guest_orders,
    NULL as user_orders
FROM order_items;

-- 12. Testează query-ul exact care eșuează în dashboard
SELECT 
    o.id,
    o.created_at,
    o.total,
    o.status,
    o.user_id,
    o.guest_email
FROM orders o
ORDER BY o.created_at DESC
LIMIT 5;
