-- QUICK FIX: Setează utilizatorul ca admin și verifică totul
-- ÎNLOCUIEȘTE 'your-email@example.com' cu email-ul tău real!

-- 1. Verifică utilizatorul curent
SELECT 
    id,
    email,
    full_name,
    is_admin,
    'Înainte de update' as status
FROM profiles 
WHERE email = 'your-email@example.com';

-- 2. Setează ca admin
UPDATE profiles 
SET 
    is_admin = TRUE,
    updated_at = NOW()
WHERE email = 'your-email@example.com';

-- 3. Verifică după update
SELECT 
    id,
    email,
    full_name,
    is_admin,
    updated_at,
    'După update' as status
FROM profiles 
WHERE email = 'your-email@example.com';

-- 4. Verifică funcția is_admin() (doar dacă ești logat cu acest user în Supabase)
-- SELECT public.is_admin() as sunt_admin;

-- 5. Verifică toți adminii
SELECT 
    email,
    full_name,
    is_admin,
    created_at
FROM profiles 
WHERE is_admin = TRUE
ORDER BY created_at DESC;

-- 6. Dacă utilizatorul nu există deloc în profiles, creează-l
-- (Găsește mai întâi ID-ul din auth.users)
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Apoi inserează (decomentează și completează):
-- INSERT INTO profiles (id, email, full_name, is_admin)
-- VALUES (
--     'uuid-from-auth-users',
--     'your-email@example.com', 
--     'Your Name',
--     TRUE
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET is_admin = TRUE, updated_at = NOW();

-- 7. VERIFICARE FINALĂ - Ar trebui să vezi is_admin = true
SELECT 
    '✅ SUCCESS' as message,
    email,
    is_admin,
    updated_at
FROM profiles 
WHERE email = 'your-email@example.com' 
AND is_admin = TRUE;
