-- Fix RLS pentru comenzile guest
-- Problema: Politica actuală nu permite inserarea comenzilor cu user_id NULL

-- 1. Verifică politicile existente pentru orders
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- 2. Șterge politica veche care blochează guest orders
DROP POLICY IF EXISTS "Users can manage their own orders" ON orders;

-- 3. Creează politici separate pentru fiecare operație

-- Permite utilizatorilor să vadă propriile comenzi
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permite utilizatorilor să își actualizeze propriile comenzi
CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permite inserarea comenzilor pentru utilizatori autentificați
CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- IMPORTANT: Permite inserarea comenzilor guest (user_id NULL)
-- Aceasta este cheia pentru a permite comenzile guest
CREATE POLICY "Allow guest order creation" ON orders
  FOR INSERT
  WITH CHECK (user_id IS NULL);

-- 4. Verifică politicile pentru order_items
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'order_items';

-- 5. Asigură-te că order_items permite inserarea pentru comenzile guest
DROP POLICY IF EXISTS "Users can view order items for their own orders" ON order_items;

-- Permite vizualizarea order_items pentru comenzile proprii
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Permite inserarea order_items pentru orice comandă (necesară pentru API)
-- Aceasta este sigură deoarece API-ul verifică payment intent-ul
CREATE POLICY "Allow order items creation" ON order_items
  FOR INSERT
  WITH CHECK (true);

-- 6. Verifică rezultatul
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, cmd;
