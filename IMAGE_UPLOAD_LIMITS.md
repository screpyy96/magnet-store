# Image Upload Limits & Best Practices

## Limite Implementate

### 1. Dimensiune Fișier Original
- **Maximum**: 10MB per fișier
- **Validare**: La selectarea fișierului (înainte de crop)
- **Mesaj eroare**: "Some files are too large (max 10MB). Please use smaller images."

### 2. Tipuri Fișiere Acceptate
- **Formate**: JPG, JPEG, PNG, WebP
- **Validare**: La selectarea fișierului
- **Mesaj eroare**: "Please upload only JPG, PNG, or WebP images"

### 3. Dimensiune După Procesare
- **Target**: Sub 5MB per imagine după crop
- **Compresie automată**: Dacă > 5MB, se comprimă la quality 0.7
- **Format final**: JPEG pentru dimensiune optimă

### 4. Limite Supabase Storage
- **Per fișier**: 50MB (default Supabase)
- **Bucket**: `magnet-images`
- **Public access**: Da (pentru afișare în cart/orders)

### 5. Limite Next.js API
- **Body size**: 4MB default (dar folosim FormData streaming)
- **Timeout**: 10s default per request

## Flow de Upload

```
1. User selectează fișiere
   ↓
2. Validare: dimensiune < 10MB, tip valid
   ↓
3. Crop în ImageEditor (2000x2000px pentru print quality)
   ↓
4. Conversie la base64 (temporar în memory)
   ↓
5. La "Add to Cart":
   - Conversie base64 → Blob
   - Check dimensiune: dacă > 5MB → compresie
   - Upload la Supabase via FormData
   ↓
6. Salvare URL în cart (nu base64!)
```

## Compresie Imagini

### Când se aplică:
- **Automat**: Dacă blob > 5MB după crop
- **Quality**: 0.7 (70% JPEG quality)
- **Dimensiuni**: Păstrate (2000x2000px pentru print)

### De ce 2000x2000px?
- **Print quality**: 400 DPI la 5x5cm
- **Calcul**: 5cm × 400 DPI ÷ 2.54 = ~787px
- **Safety margin**: 2000px asigură calitate excelentă

## Troubleshooting

### "Failed to upload image"
**Cauze posibile:**
1. Imagine prea mare (> 10MB original)
2. Format invalid (nu JPG/PNG/WebP)
3. Probleme de rețea
4. Supabase bucket nu există sau nu e public

**Soluție:**
- Verifică dimensiunea fișierului original
- Folosește JPG în loc de PNG pentru imagini mari
- Verifică conexiunea la internet

### "QuotaExceededError" în localStorage
**Cauză:** Încercare de salvare imagini în localStorage (fixed)

**Soluție:** Imaginile sunt acum uploadate pe server, nu salvate local

### Imagini nu apar în cart
**Cauză:** URL-urile nu sunt salvate corect în cart item

**Soluție:** Verifică că `item.images` array conține URL-uri valide

## Best Practices pentru Utilizatori

### Recomandări:
1. **Folosește JPG** pentru fotografii (mai mic decât PNG)
2. **Optimizează înainte** dacă ai imagini > 5MB
3. **Rezoluție recomandată**: 1500-3000px per latură
4. **Evită**: Screenshots de rezoluție foarte mare, PNG-uri necomprimate

### Tools pentru optimizare:
- **Online**: TinyPNG, Squoosh.app
- **Desktop**: ImageOptim (Mac), FileOptimizer (Windows)
- **Photoshop**: "Save for Web" cu quality 80-90%

## Monitorizare

### Logs în Console:
```javascript
// La upload:
"Processing file: photo.jpg, size: 2.45MB"

// La compresie:
"Image 1 is large (6.23MB), compressing..."

// La eroare:
"Error uploading image 1: Failed to upload..."
```

### Verificare în Supabase:
1. Dashboard → Storage → magnet-images
2. Verifică că fișierele apar
3. Click pe fișier → Copy URL → testează în browser

## Limite Tehnice

| Limită | Valoare | Unde |
|--------|---------|------|
| Fișier original | 10MB | Browser validation |
| După crop | 5MB (target) | Auto-compress dacă mai mare |
| Supabase Storage | 50MB | Per fișier (default) |
| Next.js API body | 4MB | Default (bypass cu FormData) |
| localStorage | N/A | Nu mai folosim pentru imagini |
| Browser memory | ~2GB | Limită teoretică per tab |

## Îmbunătățiri Viitoare

1. **Progressive upload**: Upload în background în timpul crop-ului
2. **Retry logic**: Reîncearcă automat la erori de rețea
3. **Image optimization**: WebP conversion pentru dimensiuni mai mici
4. **CDN**: Cloudflare/CloudFront pentru serving mai rapid
5. **Thumbnail generation**: Server-side pentru performanță
