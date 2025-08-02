# 🔧 Configurarea Google OAuth pentru Supabase

## 📋 Pași pentru a configura Google OAuth

### 1. **Configurarea în Google Cloud Console**

1. Mergi la [Google Cloud Console](https://console.cloud.google.com/)
2. Creează un proiect nou sau selectează unul existent
3. Activează **Google+ API** și **Google Identity API**:
   - Mergi la **APIs & Services** → **Library**
   - Caută și activează **Google+ API**
   - Caută și activează **Google Identity API**

4. **Configurează OAuth Consent Screen**:
   - Mergi la **APIs & Services** → **OAuth consent screen**
   - Selectează **External** (dacă nu ai un domeniu verificat)
   - Completează informațiile necesare:
     - **App name**: My Sweet Magnets
     - **User support email**: email-ul tău
     - **Developer contact information**: email-ul tău
   - Adaugă domeniile autorizate:
     - `localhost:3000` (pentru development)
     - `yourdomain.com` (pentru production)

5. **Creează OAuth 2.0 Credentials**:
   - Mergi la **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client IDs**
   - Selectează **Web application**
   - **Name**: My Sweet Magnets OAuth
   - **Authorized redirect URIs**: 
     ```
     https://jsoghahpeiuvstzigwbc.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback (pentru development)
     ```
   - Salvează **Client ID** și **Client Secret**

### 2. **Configurarea în Supabase Dashboard**

1. Mergi la **Supabase Dashboard** → **Authentication** → **Providers**
2. Găsește **Google** în listă și activează-l
3. Completează:
   - **Client ID**: ID-ul din Google Cloud Console
   - **Client Secret**: Secret-ul din Google Cloud Console
   - **Redirect URL**: `https://jsoghahpeiuvstzigwbc.supabase.co/auth/v1/callback`

### 3. **Verificarea Configurării**

După configurare, testează:

1. Mergi la pagina de login/register
2. Click pe "Continue with Google"
3. Ar trebui să fii redirecționat către Google pentru autentificare
4. După autentificare, ar trebui să fii redirecționat înapoi la aplicația ta

### 4. **Troubleshooting**

#### Eroarea "redirect_uri_mismatch"
- Verifică că URL-ul de redirect din Google Cloud Console se potrivește exact cu cel din Supabase
- Asigură-te că nu ai spații suplimentare

#### Eroarea "invalid_client"
- Verifică că Client ID și Client Secret sunt corecte
- Asigură-te că ai activat API-urile necesare în Google Cloud Console

#### Eroarea "access_denied"
- Verifică că OAuth consent screen este configurat corect
- Asigură-te că domeniile sunt adăugate în domeniile autorizate

### 5. **Configurarea pentru Production**

Pentru production, asigură-te că:

1. **OAuth Consent Screen**:
   - Adaugă domeniul de production în **Authorized domains**
   - Publică aplicația (dacă este necesar)

2. **Redirect URIs**:
   - Adaugă URL-ul de production în Google Cloud Console
   - Actualizează redirect URL-ul în Supabase dacă este necesar

3. **Environment Variables**:
   - Verifică că toate variabilele de environment sunt setate corect

### 6. **Testarea Finală**

După configurare, testează următoarele scenarii:

1. ✅ Înregistrare cu Google (utilizator nou)
2. ✅ Login cu Google (utilizator existent)
3. ✅ Redirect după autentificare
4. ✅ Persistența sesiunii
5. ✅ Logout

## 🔍 Debugging

Pentru debugging, verifică:

1. **Console-ul browser-ului** pentru erori JavaScript
2. **Network tab** pentru cereri HTTP eșuate
3. **Supabase Dashboard** → **Authentication** → **Logs** pentru erori de autentificare
4. **Google Cloud Console** → **APIs & Services** → **OAuth consent screen** → **Test users** (dacă aplicația este în test)

## 📞 Suport

Dacă întâmpini probleme:

1. Verifică că toate pașii au fost urmați corect
2. Verifică console-ul browser-ului pentru erori
3. Verifică logs-urile din Supabase Dashboard
4. Asigură-te că nu ai conflicte între configurațiile de development și production 