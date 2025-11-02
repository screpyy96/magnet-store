# Ce Date se Salvează pentru Guest Users (Utilizatori Neînregistrați)

## Rezumat

✅ **DA**, toate datele sunt salvate în Supabase pentru comenzile guest, inclusiv:
- Detalii de livrare (adresă completă)
- Email pentru contact
- Imaginile încărcate pentru magneți
- Toate detaliile produselor

## Structura Datelor

### 1. Tabelul `orders` - Comanda Principală

Pentru **guest users** (`user_id` = NULL), se salvează:

```sql
-- Câmpuri standard
id                    -- UUID unic al comenzii
user_id               -- NULL pentru guest
status                -- 'processing', 'completed', etc.
payment_status        -- 'succeeded', 'failed', etc.
payment_intent_id     -- ID-ul plății din Stripe
subtotal              -- Subtotal comandă
shipping_cost         -- Cost livrare (0 în cazul vostru)
total                 -- Total comandă
created_at            -- Data comenzii
updated_at            -- Ultima actualizare

-- Câmpuri GUEST (salvate direct în orders)
guest_email           -- Email-ul clientului
guest_full_name       -- Nume complet
guest_address_line1   -- Adresa linia 1
guest_address_line2   -- Adresa linia 2 (opțional)
guest_city            -- Oraș
guest_county          -- Județ
guest_postal_code     -- Cod poștal
guest_phone           -- Telefon
```

**Exemplu:**
```json
{
  "id": "uuid-123",
  "user_id": null,
  "status": "processing",
  "payment_status": "succeeded",
  "payment_intent_id": "pi_abc123",
  "total": 17.00,
  "guest_email": "client@example.com",
  "guest_full_name": "Ion Popescu",
  "guest_address_line1": "Str. Florilor nr. 10",
  "guest_city": "București",
  "guest_county": "București",
  "guest_postal_code": "012345",
  "guest_phone": "+40712345678"
}
```

### 2. Tabelul `order_items` - Produsele din Comandă

Pentru **fiecare magnet/imagine**, se salvează:

```sql
id                    -- UUID unic
order_id              -- Referință la comanda principală
product_name          -- Nume produs (ex: "Custom Magnet Package - Image 1")
quantity              -- Cantitate (de obicei 1 per imagine)
size                  -- Dimensiune (ex: "5x5", "10x10")
price_per_unit        -- Preț per unitate
image_url             -- ⭐ URL-ul imaginii încărcate
special_requirements  -- Cerințe speciale (finish, etc.)
created_at            -- Data creării
```

**Exemplu pentru un pachet de 6 magneți:**
```json
[
  {
    "id": "uuid-item-1",
    "order_id": "uuid-123",
    "product_name": "Custom Magnet Package - Image 1",
    "quantity": 1,
    "size": "5x5",
    "price_per_unit": 2.83,
    "image_url": "https://storage.url/image1.jpg",
    "special_requirements": "Package 6 - glossy finish"
  },
  {
    "id": "uuid-item-2",
    "order_id": "uuid-123",
    "product_name": "Custom Magnet Package - Image 2",
    "quantity": 1,
    "size": "5x5",
    "price_per_unit": 2.83,
    "image_url": "https://storage.url/image2.jpg",
    "special_requirements": "Package 6 - glossy finish"
  },
  // ... încă 4 imagini
]
```

### 3. Tabelul `shipping_addresses` - NU se folosește pentru guest

Pentru guest users, adresa **NU** se salvează în `shipping_addresses`.
Toate detaliile de livrare sunt salvate direct în tabelul `orders` (câmpurile `guest_*`).

Doar utilizatorii înregistrați au adrese salvate în `shipping_addresses` pentru refolosire.

## Fluxul Complet pentru Guest Checkout

### 1. Clientul completează formularul
```javascript
{
  full_name: "Ion Popescu",
  email: "client@example.com",
  address_line1: "Str. Florilor nr. 10",
  city: "București",
  county: "București",
  postal_code: "012345",
  phone: "+40712345678"
}
```

### 2. Clientul încarcă imagini pentru magneți
Imaginile sunt stocate (probabil în Supabase Storage sau alt serviciu) și URL-urile sunt salvate în cart:
```javascript
{
  custom_data: {
    type: "custom_magnet_package",
    packageId: "6",
    images: [
      "https://storage.url/image1.jpg",
      "https://storage.url/image2.jpg",
      // ...
    ],
    size: "5x5",
    finish: "glossy"
  }
}
```

### 3. La finalizarea comenzii
API-ul `/api/orders/create` primește:
```javascript
{
  items: [...], // Cart items cu imagini
  shippingDetails: {...}, // Detalii guest
  email: "client@example.com",
  paymentIntentId: "pi_abc123",
  userId: null // Guest
}
```

### 4. Se salvează în Supabase

**Tabelul `orders`:**
- 1 rând cu toate detaliile comenzii + detalii guest

**Tabelul `order_items`:**
- 1 rând pentru fiecare imagine/magnet
- Fiecare rând conține `image_url` cu imaginea specifică

## Verificare în Supabase

### Query pentru comenzi guest cu imagini:

```sql
-- Toate comenzile guest cu detaliile lor
SELECT 
    o.id,
    o.guest_email,
    o.guest_full_name,
    o.guest_address_line1,
    o.guest_city,
    o.guest_county,
    o.guest_postal_code,
    o.guest_phone,
    o.total,
    o.payment_status,
    o.created_at,
    COUNT(oi.id) as total_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id IS NULL  -- Guest orders
GROUP BY o.id
ORDER BY o.created_at DESC;

-- Detalii complete: comandă + toate imaginile
SELECT 
    o.id as order_id,
    o.guest_email,
    o.guest_full_name,
    o.guest_phone,
    o.total as order_total,
    o.payment_status,
    oi.product_name,
    oi.image_url,  -- ⭐ Imaginea
    oi.size,
    oi.price_per_unit,
    oi.special_requirements,
    o.created_at
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id IS NULL  -- Guest orders
ORDER BY o.created_at DESC, oi.product_name;
```

## Migrații Necesare

Verifică că toate câmpurile guest există în tabelul `orders`:

```sql
-- Verifică structura tabelului
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name LIKE 'guest%'
ORDER BY column_name;
```

Dacă lipsesc câmpuri, rulează:

```sql
-- Adaugă toate câmpurile guest
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_full_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_address_line1 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_address_line2 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_county TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_postal_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Adaugă comentarii
COMMENT ON COLUMN orders.guest_email IS 'Email for guest orders';
COMMENT ON COLUMN orders.guest_full_name IS 'Full name for guest orders';
COMMENT ON COLUMN orders.guest_address_line1 IS 'Address line 1 for guest orders';
COMMENT ON COLUMN orders.guest_city IS 'City for guest orders';
COMMENT ON COLUMN orders.guest_county IS 'County for guest orders';
COMMENT ON COLUMN orders.guest_postal_code IS 'Postal code for guest orders';
COMMENT ON COLUMN orders.guest_phone IS 'Phone for guest orders';
```

## Concluzie

✅ **Toate datele sunt salvate pentru guest users:**
- ✅ Email și detalii de contact
- ✅ Adresa completă de livrare
- ✅ Toate imaginile încărcate (URL-uri în `order_items.image_url`)
- ✅ Detalii despre produse (dimensiune, finish, preț)
- ✅ Status plată și comandă

**Nu se pierde nicio informație!** Datele sunt salvate direct în tabelul `orders` (câmpuri `guest_*`) și `order_items` (inclusiv `image_url`).
