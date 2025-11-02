# Rezolvarea Problemei cu Comenzile Stripe

## Problema
Plățile merg prin Stripe dar comenzile nu apar în Supabase pentru că webhook-ul Stripe nu este configurat.

## Soluția

### Pasul 1: Configurează Webhook-ul în Stripe Dashboard

1. Mergi la [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click pe "Add endpoint"
3. Adaugă URL-ul webhook-ului tău:
   ```
   https://your-domain.com/api/stripe/webhook
   ```
   (Înlocuiește `your-domain.com` cu domeniul tău real)

4. Selectează evenimentele:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

5. Click "Add endpoint"

6. **IMPORTANT**: După ce creezi endpoint-ul, vei vedea "Signing secret" (începe cu `whsec_...`)
   - Click pe "Reveal" pentru a vedea secret-ul complet
   - Copiază acest secret

### Pasul 2: Adaugă Secret-ul în .env.local

Am adăugat deja linia în `.env.local`, trebuie doar să completezi valoarea:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### Pasul 3: Restart Server

După ce adaugi secret-ul, restart-ează serverul Next.js:

```bash
npm run dev
# sau
npm run build && npm start
```

## Verificare

### Testează webhook-ul:

1. În Stripe Dashboard, mergi la webhook-ul tău
2. Click pe "Send test webhook"
3. Selectează `payment_intent.succeeded`
4. Click "Send test webhook"

### Verifică logs:

Uită-te în console-ul serverului tău pentru:
```
Received webhook event: payment_intent.succeeded
Payment succeeded: pi_xxxxx
```

## Fluxul Corect

### Cum funcționează acum:

1. **Clientul** completează checkout-ul
2. **Stripe** procesează plata
3. **Frontend-ul** creează comanda în `/api/orders/create` cu `payment_intent_id`
4. **Webhook-ul** (backup) actualizează statusul comenzii când primește confirmarea de la Stripe

### De ce nu funcționa:

- Webhook-ul încerca să verifice semnătura cu `STRIPE_WEBHOOK_SECRET` care lipsea
- Toate request-urile webhook eșuau cu eroare 400
- Comenzile se creează doar din frontend, dar dacă utilizatorul închide pagina înainte să se finalizeze, comanda se pierde

## Notă Importantă

Pentru **development local**, poți folosi Stripe CLI pentru a testa webhook-urile:

```bash
# Instalează Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhook events la localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Stripe CLI va afișa webhook secret-ul (începe cu whsec_)
# Adaugă-l în .env.local pentru development
```

## Verifică Comenzile în Supabase

După configurare, verifică că comenzile apar în tabelele:
- `orders` - comenzile principale
- `order_items` - produsele din fiecare comandă

```sql
-- Verifică ultimele comenzi
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Verifică items-urile
SELECT oi.*, o.payment_intent_id 
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
ORDER BY oi.created_at DESC LIMIT 20;
```
