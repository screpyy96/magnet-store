-- DEBUG: De ce is_admin() returnează FALSE

-- 1. Verifică cine ești logat în Supabase SQL Editor
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_email;

-- 2. Verifică dacă există profilul pentru utilizatorul curent
SELECT 
    id,
    email,
    full_name,
    is_admin,
    created_at
FROM profiles 
WHERE id = auth.uid();

-- 3. Verifică TOȚI utilizatorii și cine este admin
SELECT 
    id,
    email,
    full_name,
    is_admin,
    created_at,
    CASE 
        WHEN id = auth.uid() THEN '👤 THIS IS YOU'
        ELSE ''
    END as is_current_user
FROM profiles
ORDER BY is_admin DESC, created_at DESC;

-- 4. Verifică funcția is_admin() pas cu pas
SELECT 
    auth.uid() as my_id,
    (
        SELECT is_admin 
        FROM profiles 
        WHERE id = auth.uid()
    ) as my_admin_status,
    public.is_admin() as function_result;

-- 5. Dacă nu ești logat (auth.uid() este NULL), logează-te
-- Dacă auth.uid() este NULL, înseamnă că nu ești autentificat în Supabase SQL Editor

-- 6. SETEAZĂ utilizatorul curent ca admin (ÎNLOCUIEȘTE cu email-ul tău)
-- Decomentează și rulează doar dacă știi email-ul tău:
-- UPDATE profiles 
-- SET is_admin = TRUE 
-- WHERE email = 'your-email@example.com';

-- 7. SAU setează prin ID dacă știi ID-ul
-- UPDATE profiles 
-- SET is_admin = TRUE 
-- WHERE id = auth.uid();

-- 8. VERIFICARE FINALĂ
SELECT 
    'După update' as status,
    auth.uid() as my_id,
    auth.email() as my_email,
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) as my_admin_status,
    public.is_admin() as function_result;