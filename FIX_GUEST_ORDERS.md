# Fix pentru Comenzile Guest

## Problema
Comenzile guest nu se salvează în baza de date.

## Cauza
API-ul folosea `createClient()` care respectă politicile RLS (Row Level Security). Politica actuală pentru tabelul `orders` permite doar utilizatorilor autentificați să creeze comenzi:

```sql
CREATE POLICY "Users can manage their own orders" ON public.orders
  FOR ALL USING (auth.uid() = user_id);
```

Pentru comenzile guest, `user_id` este `NULL`, iar `auth.uid()` este `NULL`, dar verificarea `auth.uid() = user_id` eșuează pentru inserări.

## Soluția Aplicată

Am modificat API-ul să folosească **service role client** care bypass-ează RLS:

### Fișiere modificate:
1. **src/utils/supabase/service-role.js** (NOU) - Client Supabase cu service role
2. **src/app/api/orders/create/route.js** - Modificat să folosească service role client

### Ce face service role:
- Bypass-ează toate politicile RLS
- Permite inserarea comenzilor guest (user_id = NULL)
- Este sigur deoarece API-ul verifică payment intent-ul cu Stripe înainte de a crea comanda

## Soluție Alternativă (RLS)

Dacă preferi să păstrezi RLS și să nu folosești service role, poți rula SQL-ul din `fix_guest_orders_rls.sql` care:
- Creează politici separate pentru fiecare operație
- Adaugă o politică specială pentru comenzile guest: `CREATE POLICY "Allow guest order creation"`

## Testare

Pentru a testa:
1. Deschide site-ul în modul incognito
2. Adaugă magneti în coș
3. Mergi la checkout
4. Completează formularul guest
5. Plătește cu Stripe
6. Verifică în Supabase dacă comanda a fost salvată

## Note Importante

- Service role key-ul este deja configurat în `.env.local`
- API-ul verifică întotdeauna payment intent-ul cu Stripe înainte de a crea comanda
- Comenzile guest au `user_id = NULL` și toate datele de shipping în coloanele `guest_*`
