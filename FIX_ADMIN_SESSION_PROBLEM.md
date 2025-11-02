# Rezolvarea Problemei de Acces Admin

## Problema Identificată

Toți userii au `is_admin = true` în tabela `profiles`, dar doar un user poate vedea panoul de admin și comenzile.

## Cauza Principală

**Import greșit al clientului Supabase** în paginile admin:
- Paginile foloseau `import { supabase } from '@/lib/supabase'` care creează o instanță globală
- Această instanță **nu are sesiunea utilizatorului curent**
- În loc să folosească clientul din `useAuth()` care are sesiunea corectă

## Soluția Aplicată

Am eliminat importurile greșite din următoarele fișiere:
1. ✅ `src/app/admin/orders/page.jsx` - eliminat `import { supabase } from '@/lib/supabase'`
2. ✅ `src/app/admin/customers/page.jsx` - eliminat `import { supabase } from '@/lib/supabase'`
3. ✅ `src/app/admin/deletion-requests/page.jsx` - eliminat `import { supabase } from '@/lib/supabase'` și adăugat `supabase` din `useAuth()`
4. ✅ `src/app/admin/orders/[orderId]/page.jsx` - eliminat `import { createClient } from '@/utils/supabase/client'` și variabila `supabaseClient` nefolosită

Acum toate paginile folosesc **doar** `supabase` din `useAuth()` context, care are sesiunea utilizatorului curent.

## Pași pentru Testare

### 1. Clear Cache și Logout

Pentru fiecare user care are probleme:

```javascript
// În browser console (F12)
localStorage.clear();
sessionStorage.clear();
```

Apoi:
1. Logout din aplicație
2. Închide toate tab-urile
3. Deschide un tab nou
4. Login din nou

### 2. Verifică în Supabase SQL Editor

Rulează scriptul `fix_admin_session.sql` pentru a verifica:
- Toți userii admin
- Dacă există useri fără profil
- Politicile RLS

### 3. Testează cu DebugAdminStatus

Adaugă componenta `DebugAdminStatus` în orice pagină admin:

```jsx
import DebugAdminStatus from '@/components/DebugAdminStatus'

function AdminPage() {
  return (
    <>
      <DebugAdminStatus />
      {/* rest of page */}
    </>
  )
}
```

Verifică că toate cele 3 statusuri sunt TRUE:
- ✅ Context isAdmin: TRUE
- ✅ API Status: TRUE  
- ✅ DB Status: TRUE
- ✅ All Match: YES

### 4. Dacă Problema Persistă

#### Opțiunea A: Refresh Session
1. Click pe butonul "🔄 Refresh Session" din DebugAdminStatus
2. Așteaptă reload-ul paginii

#### Opțiunea B: Clear Cache & Reload
1. Click pe butonul "🗑️ Clear Cache & Reload"
2. Login din nou

#### Opțiunea C: SQL Manual
Rulează în Supabase SQL Editor:

```sql
-- Verifică statusul
SELECT id, email, is_admin FROM profiles WHERE email = 'email@tau.com';

-- Dacă is_admin este false, setează-l pe true
UPDATE profiles SET is_admin = true WHERE email = 'email@tau.com';

-- Verifică din nou
SELECT id, email, is_admin FROM profiles WHERE email = 'email@tau.com';
```

## De Ce Funcționa Pentru Un User?

Acel user probabil:
1. Avea sesiunea cached corect în localStorage
2. Sau a făcut login după ce aplicația a fost configurată corect
3. Sau browser-ul său avea cookies-urile sincronizate corect

## Verificări Suplimentare

### Verifică Politicile RLS

Asigură-te că politicile RLS permit adminilor să vadă toate comenzile:

```sql
-- Pentru tabela orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Pentru tabela profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
```

### Verifică API Route

API-ul `/api/check-admin/route.js` verifică corect statusul:
- ✅ Folosește `createClient()` din `@/utils/supabase/server`
- ✅ Verifică sesiunea din cookies
- ✅ Returnează `is_admin` din profiles

## Concluzie

Problema era cauzată de **import-uri greșite** care foloseau o instanță globală de Supabase fără sesiunea utilizatorului. Acum toate paginile admin folosesc clientul corect din `useAuth()` context.

După aplicarea acestor modificări și clear cache, toți userii cu `is_admin = true` ar trebui să poată accesa panoul de admin și să vadă comenzile.
