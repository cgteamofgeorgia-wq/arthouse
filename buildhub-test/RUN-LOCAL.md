# BuildHub — ლოკალურად გაშვება

## 1. გაშვება

```bash
npm ci
cp .env.example .env.local     # Supabase-ის სამი გასაღები
npm run dev
```

ბრაუზერში: **http://localhost:3000**

## 2. ბაზა (სავალდებულო)

ინტერფეისი ცარიელი იქნება, სანამ ბაზა და seed არ აწყობილია.

```bash
npx supabase link --project-ref <ref>
npx supabase db push                          # სქემა + RLS
psql "$DATABASE_URL" -f supabase/seed.sql     # ენები, პაკეტები, კატეგორიები
```

`seed.sql` მიგრაციების საქაღალდის გარეთაა — `db push` მას არ რთავს.
`DATABASE_URL` აიღეთ Supabase → Settings → Database.

## 3. Meilisearch (კატალოგისთვის)

```bash
docker run -d -p 7700:7700 getmeili/meilisearch:latest
npm run search:init
```

ალტერნატივა: Meilisearch Cloud, ან შეცვალეთ `MEILISEARCH_HOST` `.env.local`-ში.
Meilisearch-ის გარეშე კატალოგის გვერდი შეცდომას დააბრუნებს, დანარჩენი იმუშავებს.

## 4. პირველი მომხმარებელი — ინტერფეისიდან

1. გახსენით `/register`, აირჩიეთ „კერძო პირი", შეავსეთ ფორმა, დაეთანხმეთ GDPR.
2. დადასტურების კოდი ბაზაში ჰეშითაა — ტექსტად ვერ წაიკითხავთ.
   ლოკალურად ანგარიში პირდაპირ გაააქტიურეთ:

```sql
update users set status = 'active', email_verified_at = now()
 where email = 'your@email.ge';

-- ადმინის უფლებებისთვის ერთდროულად:
update users set is_admin = true, is_company = true
 where email = 'your@email.ge';
```

3. შედით `/login`-იდან. ადმინს 2FA მოეთხოვება — ლოკალურად
   `/api/auth/login`-ის `totp` ველი ცარიელი დატოვეთ, ან დროებით
   გამორთეთ შემოწმება `src/app/api/auth/login/route.ts`-ში.

## 5. დემო განცხადებები

რომ კატალოგი ცარიელი არ იყოს:

```bash
npm run seed:demo     # 13 განცხადება + ინდექსი
```

## 6. სრული ნაკადის ტესტი

| ნაბიჯი | სად | რას ნახავთ |
| --- | --- | --- |
| 1 | `/` | კატეგორიები და განცხადებები |
| 2 | `/catalog` | ფილტრები, ძებნა, გვერდები |
| 3 | `/listings/new` | ფორმა → გადახდის მოდალი |
| 4 | მოდალი | „webhook-ის დადასტურება" — გასაღები `.env.local`-იდან |
| 5 | `/dashboard` | სტატუსი `draft` → `active` |
| 6 | `/listings/[id]` | „მიმოწერის დაწყება" |
| 7 | `/chat` | შეტყობინება, სიახლე 3 წამში |
| 8 | `/dashboard/certificates` | სერთიფიკატის წარდგენა |
| 9 | `/admin/certificates` | დადასტურება ან უარყოფა |
| 10 | `/admin` | სტატისტიკა და გადახდები |

## 7. დომენი

`APP_URL` გადამწყვეტია — სწორედ აქ ბრუნდება webhook. `localhost` არ გამოდგება.

```bash
cloudflared tunnel --url http://localhost:3000
# ან
ngrok http 3000
```

მიღებული მისამართი ჩაწერეთ `APP_URL`-ში **და** Supabase-ის
Authentication → URL Configuration-ში (Site URL + Redirect URLs).
`APP_URL` ერთხელ იკითხება — dev სერვერი გადატვირთეთ.

## 8. ხშირი ხარვეზები

| სიმპტომი | მიზეზი |
| --- | --- |
| კატალოგი ცარიელია | Meilisearch გამორთულია, ან `npm run search:init` არ გაშვებულა |
| `SUPABASE_SERVICE_ROLE_KEY არ არის განსაზღვრული` | `.env.local` ცარიელია, ან dev სერვერი არ გადატვირთულა |
| განცხადება `draft`-ად რჩება | webhook არ გაიგზავნა, ან ხელმოწერა არ დაემთხვა (`401`) |
| `422 invalid_category` | სცადეთ seed.sql-ის კატეგორიის ID |
| 401 ყველგან | სესია არ არის — Supabase-ის cookie-ები გამორთულია |
| ჩატში „ჩემი" შეტყობინებები მარცხნივ | SSE არ მუშაობს; განაახლეთ გვერდი |

## 9. რაც ლოკალურად ვერ შემოწმდება

- **რეალური გადახდა** — სჭირდება პროვაიდერის sandbox ანგარიში.
  მოდალის „webhook-ის დადასტურება" იმავე კოდს გაივლის, გარდა სესიის შექმნისა.
- **ელფოსტა და SMS** — გასაღების გარეშე კოდი გაფრთხილებას ბეჭდავს და გამოტოვებს.
- **Supabase Realtime** — ლოკალურად SSE-ით ჩანაცვლებულია; პროდაქშენში
  `messages` ცხრილი პუბლიკაციაშია (`0002_rls.sql`).
- **ქართული მორფოლოგია ძებნაში** — სჭირდება synonym-ფაილი (TD 4.5).

## 10. პროდაქშენში წასაშლელი

- `public/test.html` — საჯაროა და webhook-ის გასაღებს ითხოვს პრომპტით.
- `scripts/seed-demo.ts` — დემო მონაცემები.
