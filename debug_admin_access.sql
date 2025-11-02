-- Script pentru debugging acces admin

-- 1. VERIFICĂ toți utilizatorii și statusul lor de admin
SELECT 
    id,
    email,
    full_name,
    is_admin,
    created_at,
    updated_at
FROM profiles
ORDER BY created_at DESC;

-- 2. VERIFICĂ doar adminii
SELECT 
    id,
    email,
    full_name,
    is_admin,
    created_at
FROM profiles
WHERE is_admin = TRUE;

-- 3. VERIFICĂ dacă există coloana is_admin în tabelul profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name = 'is_admin';

-- 4. VERIFICĂ funcția is_admin() există
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'is_admin';

-- 5. TESTEAZĂ funcția is_admin() pentru utilizatorul curent
-- (Rulează acest query când ești logat în Supabase)
SELECT public.is_admin() as am_i_admin;

-- 6. VERIFICĂ policy-urile pentru tabele admin
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
WHERE tablename IN ('profiles', 'orders', 'order_items')
AND policyname LIKE '%admin%'
ORDER BY tablename, policyname;

-- 7. SETEAZĂ un utilizator ca admin (ÎNLOCUIEȘTE email-ul)
-- ATENȚIE: Rulează doar pentru utilizatorul tău!
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';

-- 8. VERIFICĂ din nou după update
SELECT 
    id,
    email,
    full_name,
    is_admin,
    updated_at
FROM profiles
WHERE email = 'your-email@example.com';

-- 9. VERIFICĂ dacă există utilizatori în auth.users dar nu în profiles
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created,
    p.id as profile_id,
    p.is_admin
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 10. CREEAZĂ profil manual dacă lipsește (ÎNLOCUIEȘTE valorile)
-- INSERT INTO profiles (id, email, full_name, is_admin)
-- VALUES (
--     'user-uuid-from-auth-users',
--     'your-email@example.com',
--     'Your Name',
--     TRUE
-- );

-- 11. VERIFICĂ trigger-ul pentru crearea automată a profilului
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%profile%'
OR action_statement LIKE '%profile%';

-- 12. STATISTICI generale
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_admin = TRUE THEN 1 END) as admin_count,
    COUNT(CASE WHEN is_admin = FALSE THEN 1 END) as regular_users
FROM profiles;
