-- Script pentru verificarea și repararea problemelor de acces admin
-- Rulează acest script în Supabase SQL Editor

-- 1. Verifică toți userii admin din tabela profiles
SELECT 
  id,
  email,
  is_admin,
  created_at,
  updated_at
FROM profiles
WHERE is_admin = true
ORDER BY email;

-- 2. Verifică dacă există useri în auth.users care nu au profil
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  p.id as profile_id,
  p.is_admin
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 3. Creează profiluri lipsă pentru userii din auth.users (dacă există)
INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  false, -- implicit nu sunt admin
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. Verifică din nou după inserare
SELECT 
  au.id,
  au.email,
  p.is_admin,
  CASE 
    WHEN p.id IS NULL THEN 'NO PROFILE'
    WHEN p.is_admin = true THEN 'ADMIN'
    ELSE 'USER'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.email;

-- 5. Dacă vrei să faci un user specific admin, folosește:
-- UPDATE profiles SET is_admin = true WHERE email = 'email@example.com';

-- 6. Verifică politicile RLS pentru tabela orders
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
WHERE tablename = 'orders';

-- 7. Verifică politicile RLS pentru tabela profiles
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
WHERE tablename = 'profiles';
