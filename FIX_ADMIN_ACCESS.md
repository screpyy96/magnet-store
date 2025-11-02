# Rezolvare Problemă: Acces Admin Nu Funcționează

## Problema
Ai setat `is_admin = TRUE` în tabelul `profiles`, dar accesul la paginile admin nu funcționează.

## Cauze Posibile

### 1. **Cache-ul browser-ului** (Cea mai comună)
Frontend-ul poate avea cache-uit statusul vechi de admin.

### 2. **Sesiunea nu este reîmprospătată**
AuthContext verifică statusul de admin la login, dar nu se actualizează automat.

### 3. **RLS (Row Level Security) blochează citirea**
Policy-urile Supabase pot bloca citirea propriului profil.

### 4. **Profilul nu există sau nu este sincronizat**
Utilizatorul există în `auth.users` dar nu în `profiles`.

## Soluții - Pas cu Pas

### Pasul 1: Verifică în Supabase Dashboard

1. Deschide **Supabase Dashboard** → **Table Editor** → **profiles**
2. Găsește utilizatorul tău după email
3. Verifică că `is_admin` = `TRUE` (checkbox bifat)

**Dacă nu există utilizatorul:**
```sql
-- Găsește ID-ul din auth.users
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Creează profilul manual
INSERT INTO profiles (id, email, full_name, is_admin)
VALUES (
    'uuid-from-above',
    'your-email@example.com',
    'Your Name',
    TRUE
);
```

**Dacă există dar is_admin = FALSE:**
```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';
```

### Pasul 2: Șterge Cache-ul Browser

1. **Chrome/Edge**: 
   - `Ctrl+Shift+Delete` (Windows) sau `Cmd+Shift+Delete` (Mac)
   - Selectează "Cached images and files" și "Cookies"
   - Click "Clear data"

2. **Sau mai simplu**: Deschide în **Incognito/Private Mode**

3. **Sau șterge localStorage manual**:
   - Deschide Console (F12)
   - Rulează:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

### Pasul 3: Logout și Login Din Nou

1. Click pe profilul tău → **Logout**
2. **Închide toate tab-urile** aplicației
3. Deschide din nou și **Login**
4. Verifică dacă apare link-ul "Admin Dashboard" în navbar

### Pasul 4: Verifică în Console Browser

După login, deschide Console (F12) și verifică:

```javascript
// Verifică dacă user este setat
console.log('User:', window.localStorage.getItem('supabase_session'));

// Testează API-ul direct
fetch('/api/check-admin', { credentials: 'include' })
  .then(r => r.json())
  .then(data => console.log('Admin status:', data));
```

Ar trebui să vezi: `{ isAdmin: true }`

### Pasul 5: Verifică RLS Policies în Supabase

Rulează în **SQL Editor**:

```sql
-- Verifică dacă poți citi propriul profil
SELECT * FROM profiles WHERE id = auth.uid();

-- Testează funcția is_admin()
SELECT public.is_admin() as am_i_admin;
```

**Dacă primești erori sau rezultate goale**, RLS blochează accesul.

**Soluție temporară** (doar pentru debugging):
```sql
-- ATENȚIE: Doar pentru testare! Nu lăsa asta în producție!
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

După ce verifici că funcționează, reactivează RLS:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Pasul 6: Verifică Policy-urile

Rulează în SQL Editor:

```sql
-- Vezi toate policy-urile pentru profiles
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

**Ar trebui să existe:**
- Policy pentru utilizatori să-și citească propriul profil
- Policy pentru admini să citească toate profilurile

**Dacă lipsesc**, rulează:

```sql
-- Policy pentru utilizatori să-și citească propriul profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy pentru admini
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
```

### Pasul 7: Forțează Refresh în AuthContext

Adaugă un buton temporar în aplicație pentru debugging:

```jsx
// Adaugă în orice pagină pentru testare
import { useAuth } from '@/contexts/AuthContext';

function DebugAdminButton() {
  const { refreshSession, isAdmin } = useAuth();
  
  const handleRefresh = async () => {
    await refreshSession();
    window.location.reload();
  };
  
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      <button onClick={handleRefresh} style={{ padding: '10px', background: 'red', color: 'white' }}>
        Refresh Admin Status
      </button>
      <p>Is Admin: {isAdmin ? 'YES' : 'NO'}</p>
    </div>
  );
}
```

## Verificare Finală

După ce ai urmat pașii de mai sus:

1. ✅ Logout complet
2. ✅ Șterge cache browser
3. ✅ Login din nou
4. ✅ Verifică în navbar dacă apare "Admin Dashboard"
5. ✅ Încearcă să accesezi `/admin/dashboard`

## Debugging Avansat

### Verifică fluxul complet:

1. **În Supabase SQL Editor:**
```sql
-- Verifică utilizatorul
SELECT id, email, is_admin FROM profiles WHERE email = 'your-email@example.com';

-- Testează funcția
SELECT public.is_admin();
```

2. **În Browser Console:**
```javascript
// Verifică sesiunea
const session = JSON.parse(localStorage.getItem('supabase_session'));
console.log('User ID:', session?.user?.id);

// Testează API
fetch('/api/check-admin', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log);
```

3. **În Network Tab (F12):**
- Reîmprospătează pagina
- Caută request-ul la `/api/check-admin`
- Verifică răspunsul: ar trebui `{ "isAdmin": true }`

## Soluție Rapidă (Quick Fix)

Dacă nimic nu funcționează, încearcă această secvență:

```sql
-- 1. În Supabase SQL Editor
UPDATE profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

```javascript
// 2. În Browser Console
localStorage.clear();
sessionStorage.clear();
```

```bash
# 3. În Terminal (restart server)
# Ctrl+C pentru a opri serverul
npm run dev
```

4. Deschide browser în **Incognito Mode**
5. Login din nou
6. Verifică dacă funcționează

## Probleme Comune

### "Admin Dashboard" nu apare în navbar
- **Cauză**: `isAdmin` din AuthContext este `false`
- **Soluție**: Verifică Pasul 4 (Console) și Pasul 7 (Refresh)

### Redirect la homepage când accesezi `/admin/dashboard`
- **Cauză**: Verificarea admin din pagină eșuează
- **Soluție**: Verifică RLS policies (Pasul 5)

### API `/api/check-admin` returnează `{ isAdmin: false }`
- **Cauză**: Sesiunea nu este validă sau profilul nu există
- **Soluție**: Verifică Pasul 1 (Supabase Dashboard)

## Script Complet de Verificare

Rulează în **Supabase SQL Editor**:

```sql
-- Verificare completă
DO $$
DECLARE
    admin_email TEXT := 'your-email@example.com'; -- ÎNLOCUIEȘTE CU EMAIL-UL TĂU
    user_record RECORD;
BEGIN
    -- Caută utilizatorul
    SELECT * INTO user_record FROM profiles WHERE email = admin_email;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'EROARE: Utilizatorul cu email % nu există în profiles!', admin_email;
    ELSE
        RAISE NOTICE 'Utilizator găsit: ID = %, is_admin = %', user_record.id, user_record.is_admin;
        
        IF user_record.is_admin THEN
            RAISE NOTICE '✅ Utilizatorul ESTE admin în baza de date';
        ELSE
            RAISE NOTICE '❌ Utilizatorul NU este admin în baza de date';
            RAISE NOTICE 'Setez is_admin = TRUE...';
            UPDATE profiles SET is_admin = TRUE WHERE email = admin_email;
            RAISE NOTICE '✅ is_admin setat la TRUE';
        END IF;
    END IF;
END $$;
```

## Concluzie

Problema este de obicei una din:
1. **Cache browser** - Șterge cache și relogin
2. **Sesiune veche** - Logout/Login
3. **RLS policies** - Verifică în SQL Editor

Urmează pașii în ordine și ar trebui să funcționeze! 🚀
