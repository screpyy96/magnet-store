# Fix: LocalStorage Quota & 413 Error la Payment

## Problema
Când utilizatorii încercau să facă checkout cu magneți personalizați, apăreau două erori:
1. **QuotaExceededError**: `Failed to execute 'setItem' on 'Storage': Setting the value of 'package_1_images' exceeded the quota`
2. **413 Payload Too Large**: Server-ul Stripe respingea request-ul pentru că body-ul era prea mare

## Cauza
Imaginile în format base64 (fiecare imagine ~1-2MB) erau salvate în:
- localStorage prin redux-persist
- Trimise către API-ul Stripe în request body

Pentru un pachet de 12 magneți, asta însemna ~12-24MB de date, depășind:
- Limita localStorage (5-10MB în majoritatea browserelor)
- Limita Stripe API pentru request body

## Soluția Implementată

### 1. Upload imagini pe server înainte de checkout
**Fișier**: `src/app/custom/page.jsx`

Modificat `handleAddToCart()` pentru a:
- Uploada fiecare imagine pe Supabase Storage
- Salva doar URL-urile imaginilor în cart (nu base64)
- Afișa progress bar în timpul upload-ului

```javascript
// Înainte: salvam base64 în cart
custom_data: JSON.stringify({
  images: packageImages.map(img => img.fullImage), // ❌ base64 mare
  thumbnails: packageImages.map(img => img.thumbnail)
})

// Acum: salvăm doar URL-uri
const packageItem = {
  id: `package-${selectedPackage.id}-${Date.now()}`,
  name: `${selectedPackage.name}`,
  price: packagePrice,
  images: uploadedImageUrls, // ✅ URL-uri pentru afișare în cart
  custom_data: JSON.stringify({
    type: 'custom_magnet_package',
    thumbnails: uploadedImageUrls, // Pentru backward compatibility
    imageUrls: uploadedImageUrls, // URL-uri server
    imageCount: uploadedImageUrls.length
  })
}
```

### 2. Actualizat API-ul de upload
**Fișier**: `src/app/api/upload/route.js`

API-ul acum acceptă două formate:
- **FormData** (nou): pentru upload direct de fișiere blob
- **JSON cu base64** (legacy): pentru compatibilitate

```javascript
// Detectează tipul de request
if (contentType.includes('multipart/form-data')) {
  // Handle FormData upload
  const formData = await request.formData()
  const file = formData.get('file')
  // ...
} else {
  // Handle JSON base64 upload (legacy)
  // ...
}
```

### 3. Simplificat transform-ul Redux
**Fișier**: `src/store/store.js`

- Eliminat logica de restaurare a imaginilor din localStorage
- Transform-ul acum doar curăță datele mari înainte de persist
- Nu mai încearcă să restaureze imagini (sunt deja URL-uri)

```javascript
out: (state, key) => {
  // No need to restore images - they're already URLs on the server
  return state
}
```

## Beneficii

1. **LocalStorage**: Doar ~1KB per item în loc de ~2MB
2. **API Requests**: Doar URL-uri în loc de base64 (99% mai mic)
3. **Performance**: Checkout-ul se încarcă instant
4. **Scalabilitate**: Funcționează cu orice număr de magneți
5. **Backup**: Imaginile sunt pe server, nu se pierd la clear cache

## Afișare Imagini în Cart

**Fișier**: `src/components/Cart.jsx`

Cart-ul afișează imaginile din:
1. `item.images` array (URL-uri de pe server)
2. `customData.thumbnails` din `custom_data` (pentru backward compatibility)
3. Fallback la placeholder dacă nu există imagini

```javascript
// Cart caută imagini în această ordine:
const thumbnails = customData.thumbnails || item.images || [];
```

## Testare

Pentru a testa fix-ul:

1. Mergi la `/custom`
2. Selectează un pachet (ex: 12 magneți)
3. Uploadează toate imaginile
4. Click pe "Add to Cart"
5. Verifică că:
   - Progress bar-ul apare în timpul upload-ului
   - Nu apar erori în consolă
   - Imaginile apar în cart (click pe icon-ul de cart)
   - Checkout-ul se încarcă corect
   - Payment-ul funcționează fără eroare 413

## Note Tehnice

- Imaginile sunt stocate în bucket-ul Supabase `magnet-images`
- Numele fișierelor: `magnet_[timestamp]_[random].jpg`
- URL-urile sunt publice și pot fi accesate direct
- Imaginile rămân pe server chiar dacă utilizatorul abandonează cart-ul

## Protecții Adiționale

**Fișier**: `src/utils/localStorage.js`

1. **Blocare salvare imagini**: `setJSON()` blochează orice încercare de a salva chei care încep cu `package_` și se termină cu `_images`
2. **Cleanup automat**: La încărcarea aplicației, se șterg automat toate datele vechi de imagini din localStorage
3. **Limitare dimensiune**: Dacă `persist:root` depășește 1MB, se păstrează doar ultimele 10 items din cart

```javascript
// Blocare explicită
if (key.startsWith('package_') && key.endsWith('_images')) {
  console.warn('Blocked attempt to store images in localStorage');
  return false;
}
```

## Migrare Date Vechi

Utilizatorii care au deja imagini în localStorage vor vedea:
- Cleanup automat la următoarea încărcare a paginii
- Mesaj în consolă: "Removing legacy package images from localStorage"
- Nu se pierd date importante (doar imagini temporare)
