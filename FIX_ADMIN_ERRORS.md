# Fix: Erori Admin Dashboard

## Erorile Identificate

### 1. Multiple GoTrueClient instances
```
Multiple GoTrueClient instances detected in the same browser context
```

**Cauză:** Există două implementări diferite ale clientului Supabase:
- `src/lib/supabase.js` (veche)
- `src/utils/supabase/client.js` (nouă, SSR)

În `admin/dashboard/page.js` se foloseau **ambele**:
```javascript
import { supabase } from '@/lib/supabase'  // ❌ Import duplicat
const { user, supabase } = useAuth()       // ✅ Corect
```

**Soluție:** ✅ **AM REZOLVAT** - Am șters import-ul duplicat.

### 2. Error 500 la `/orders?select=*`
```
Failed to load resource: the server responded with a status of 500
Error loading dashboard data: Object { message: "" }
```

**Cauză:** RLS (Row Level Security) policies blochează accesul adminului la tabelul `orders`.

**Soluție:** Trebuie să rulezi script-ul SQL pentru a fixa policy-urile.

## Soluții

### Pasul 1: Am Fixat Import-ul Duplicat ✅

Am șters linia:
```javascript
import { supabase } from '@/lib/supabase'
```

Acum se folosește doar clientul din `useAuth()`.

### Pasul 2: Fixează RLS Policies

Rulează în **Supabase SQL Editor**:

```sql
-- 1. Verifică dacă funcția is_admin() funcționează
SELECT public.is_admin() as am_i_admin;
-- Ar trebui să returneze TRUE dacă ești admin

-- 2. Șterge policy-urile vechi care pot cauza conflicte
DROP POLICY IF EXISTS "Admins have full access to orders" ON orders;
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- 3. Creează policy nou pentru admini
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (
    public.is_admin() = TRUE
    OR
    auth.uid() = user_id
  );

-- 4. Policy pentru update
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);

-- 5. Testează că funcționează
SELECT COUNT(*) FROM orders;
-- Ar trebui să vezi toate comenzile
```

### Pasul 3: Fixează Policy-uri pentru Order Items

```sql
-- Policy pentru order_items
DROP POLICY IF EXISTS "Admins have full access to order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;

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

CREATE POLICY "Admins can modify order items" ON order_items
  FOR ALL
  USING (public.is_admin() = TRUE)
  WITH CHECK (public.is_admin() = TRUE);
```

### Pasul 4: Restart Browser

După ce rulezi SQL-urile:
1. **Închide toate tab-urile** aplicației
2. **Deschide din nou** `/admin/dashboard`
3. Verifică că nu mai apar erori în Console

## Script Complet de Fix

Am creat fișierul `fix_admin_rls_policies.sql` care conține toate comenzile necesare.

**Rulează-l în Supabase SQL Editor:**
1. Deschide Supabase Dashboard
2. Mergi la **SQL Editor**
3. Copiază conținutul din `fix_admin_rls_policies.sql`
4. Click **Run**

## Verificare

După fix, verifică în Console (F12):

```javascript
// Nu ar trebui să mai apară erori
// Ar trebui să vezi:
// "Admin status from DB: true"
// Fără erori 500
```

În dashboard ar trebui să vezi:
- ✅ Statistici (Total Orders, Total Sales, etc.)
- ✅ Grafice cu vânzări
- ✅ Lista cu comenzi recente
- ✅ Fără erori în Console

## Debugging Avansat

Dacă încă ai probleme, verifică:

### 1. Verifică funcția is_admin()
```sql
-- Rulează când ești logat în Supabase
SELECT public.is_admin();
-- Ar trebui TRUE
```

### 2. Verifică policy-urile
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'orders';
```

### 3. Testează query-ul direct
```sql
-- Exact query-ul care eșuează
SELECT * FROM orders LIMIT 5;
```

Dacă primești eroare aici, înseamnă că RLS blochează accesul.

### 4. Soluție temporară (DOAR pentru debugging!)
```sql
-- ATENȚIE: Nu lăsa asta în producție!
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
```

După ce verifici că funcționează, reactivează RLS:
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
```

## Probleme Comune

### "is_admin() returns FALSE"
**Cauză:** Profilul nu are `is_admin = TRUE`

**Soluție:**
```sql
UPDATE profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

### "Policy check violation"
**Cauză:** Policy-urile sunt prea restrictive

**Soluție:** Rulează script-ul `fix_admin_rls_policies.sql`

### "Multiple instances warning"
**Cauză:** Import-uri duplicate de Supabase client

**Soluție:** ✅ Deja rezolvat - am șters import-ul duplicat

## Concluzie

Am rezolvat:
1. ✅ **Multiple GoTrueClient instances** - Șters import duplicat
2. ⏳ **Error 500** - Trebuie să rulezi `fix_admin_rls_policies.sql`

După ce rulezi SQL-ul, dashboard-ul ar trebui să funcționeze perfect! 🚀
