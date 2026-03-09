# promykwspomnien.pl starter

Starter projektu pod wdrożenie serwisu **promykwspomnien.pl** w oparciu o:
- Next.js App Router
- TypeScript
- Prisma + PostgreSQL
- Stripe / Przelewy24 / BLIK (BLIK tutaj jako tryb demo przez wspólny checkout)

## Co jest w środku
- landing strony głównej
- publiczny widok profilu pamięci
- ekran płatności
- panel właściciela
- panel admina
- route handlery do tworzenia płatności
- webhook Stripe i prosty webhook Przelewy24
- logika `applyExtension`, która dopisuje lata tylko dla płatności `paid`

## Uruchomienie lokalne
1. Rozpakuj paczkę.
2. Skopiuj `.env.example` do `.env`.
3. Uzupełnij zmienne środowiskowe.
4. Zainstaluj zależności:
   ```bash
   npm install
   ```
5. Wygeneruj klienta Prisma i wypchnij schemat:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```
6. Dodaj dane demo:
   ```bash
   npm run seed
   ```
7. Uruchom projekt:
   ```bash
   npm run dev
   ```

## Wdrożenie
Najprościej wdrożyć na **Vercel** z bazą **PostgreSQL**.

Potrzebne rzeczy:
- repo na GitHubie
- baza PostgreSQL
- ustawione zmienne środowiskowe w panelu hostingu
- webhook Stripe wskazujący na:
  - `/api/webhooks/stripe`
- webhook / callback Przelewy24 wskazujący na:
  - `/api/webhooks/przelewy24`

## Ważne
Ten starter jest gotowym szkieletem wdrożeniowym, ale przed produkcją trzeba jeszcze dopracować:
- autoryzację użytkowników
- prawdziwą integrację Przelewy24 i BLIK
- obsługę błędów i logowanie zdarzeń
- politykę prywatności, regulamin i dane firmy
- ochronę panelu admina


## Neon profile read
- Added `lib/db.ts` using `pg` and `DATABASE_URL`.
- Added `GET /api/profiles/[slug]`.
- Added public route `/profile/[slug]`.
