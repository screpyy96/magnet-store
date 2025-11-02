# Ghid Rapid de Testare - Fix Admin Access

## 🚀 Pași Rapizi de Testare

### 1. Pentru fiecare user admin care are probleme:

**În browser (apasă F12 pentru console):**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 2. Logout și Login din nou

1. Logout din aplicație
2. Închide toate tab-urile browser-ului
3. Deschide un tab nou
4. Login cu credențialele admin

### 3. Verifică Accesul

Încearcă să accesezi:
- `/admin/dashboard` - ar trebui să funcționeze
- `/admin/orders` - ar trebui să vezi toate comenzile
- `/admin/customers` - ar trebui să vezi toți clienții

### 4. Dacă încă nu funcționează

**Verifică în Supabase SQL Editor:**

```sql
-- Verifică statusul admin
SELECT id, email, is_admin 
FROM profiles 
WHERE email = 'email@tau.com';
```

Dacă `is_admin` este `false`, rulează:

```sql
-- Setează admin
UPDATE profiles 
SET is_admin = true 
WHERE email = 'email@tau.com';
```

Apoi repetă pașii 1-3.

## ✅ Cum Știi Că Funcționează

După login, ar trebui să vezi:
- Link-ul "Admin Dashboard" în navbar (dacă există)
- Poți accesa `/admin/dashboard` fără redirect
- Poți vedea lista de comenzi în `/admin/orders`
- Toate comenzile sunt vizibile, nu doar ale tale

## 🔧 Debug cu DebugAdminStatus

Dacă vrei să vezi statusul în timp real, adaugă în orice pagină admin:

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

Ar trebui să vezi toate statusurile ca TRUE:
- ✅ Context isAdmin: TRUE
- ✅ API Status: TRUE
- ✅ DB Status: TRUE
- ✅ All Match: YES

## 📝 Note

- Problema era cauzată de import-uri greșite care foloseau o instanță globală de Supabase
- Acum toate paginile folosesc clientul din `useAuth()` care are sesiunea corectă
- Clear cache este important pentru a elimina sesiunile vechi cached
