# 🚀 Supabase Setup Guide pentru My Sweet Magnets

Această ghid te va ajuta să configurezi corect Supabase pentru aplicația ta.

## 📋 Pași de Setup

### 1. 🗃️ Crearea Bazei de Date

Intră în **Supabase Dashboard** → **SQL Editor** și rulează scriptul din `supabase_setup.sql`:

```sql
-- Copie conținutul din supabase_setup.sql și rulează-l în SQL Editor
```

Acest script va crea:
- ✅ Tabelele necesare (`profiles`, `orders`, `order_items`, etc.)
- ✅ Funcția RPC `check_admin_status`
- ✅ Politicile de securitate (RLS)
- ✅ Trigger-urile pentru actualizarea automată

### 2. 📁 Crearea Storage Bucket-ului

1. Mergi la **Storage** din sidebar-ul Supabase
2. Creează un bucket nou cu numele `magnet-orders`
3. Setează bucket-ul ca **Public** (pentru a permite accesul la imagini)

### 3. 🔐 Configurarea Politicilor de Storage

În **Storage** → **Policies**, adaugă aceste politici pentru bucket-ul `magnet-orders`:

#### Politica pentru Upload (INSERT):
```sql
CREATE POLICY "Users can upload their own images" ON storage.objects 
FOR INSERT WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Politica pentru Vizualizare (SELECT):
```sql
CREATE POLICY "Public can view images" ON storage.objects 
FOR SELECT USING (bucket_id = 'magnet-orders');
```

#### Politica pentru Actualizare (UPDATE):
```sql
CREATE POLICY "Users can update their own images" ON storage.objects 
FOR UPDATE USING (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Politica pentru Ștergere (DELETE):
```sql
CREATE POLICY "Users can delete their own images" ON storage.objects 
FOR DELETE USING (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. 🔑 Configurarea Environment Variables

Asigură-te că ai următoarele variabile în `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 5. 👤 Setarea unui utilizator ca Admin (Opțional)

Pentru a seta un utilizator ca admin:

1. Mergi la **Authentication** → **Users**
2. Găsește utilizatorul dorit și copiază UUID-ul
3. În **SQL Editor**, rulează:

```sql
INSERT INTO public.profiles (id, email, is_admin) 
VALUES ('USER_UUID_HERE', 'admin@example.com', true)
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;
```

### 6. 🧪 Testarea Setup-ului

După ce ai terminat setup-ul, testează:

1. ✅ Înregistrează un cont nou
2. ✅ Încearcă să urci o imagine în pagina custom
3. ✅ Verifică dacă imaginea apare în bucket-ul `magnet-orders`
4. ✅ Testează funcționalitatea de admin (dacă ai setat un admin)

## 🔧 Troubleshooting

### Eroarea `check_admin_status` nu există
- Asigură-te că ai rulat scriptul SQL complet
- Verifică că funcția există în **Database** → **Functions**

### Probleme cu upload-ul de imagini
- Verifică că bucket-ul `magnet-orders` este **Public**
- Verifică că politicile de storage sunt setate corect
- Asigură-te că utilizatorul este autentificat

### Probleme cu autentificarea
- Verifică că variabilele de environment sunt setate corect
- Verifică că URL-ul și cheile Supabase sunt corecte

## 📝 Structura Bucket-ului

Imaginile vor fi organizate astfel în bucket:
```
magnet-orders/
├── user-uuid-1/
│   ├── custom/
│   │   ├── 1640995200000.png
│   │   └── 1640995300000.png
│   └── order-uuid/
│       ├── 1640995400000.jpg
│       └── 1640995500000.jpg
└── user-uuid-2/
    └── custom/
        └── 1640995600000.png
```

## 🎉 Gata!

Dacă toate pașii au fost urmați corect, aplicația ta ar trebui să funcționeze perfect cu Supabase! 

Pentru probleme suplimentare, verifică consolele browser-ului pentru erori detaliate. 