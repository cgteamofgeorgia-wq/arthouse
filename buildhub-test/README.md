# BuildHub — სრული პროექტი (ფრონტენდი + ბექენდი)

სამშენებლო მასალებისა და მომსახურების მრავალენოვანი მარკეტპლეისი.
აწყობილია ტექნიკური დავალების მიხედვით (`buildhub-tech-spec.docx`, v1.0).

## გაშვება

```bash
npm ci
cp .env.example .env.local     # შეავსეთ Supabase-ის სამი გასაღები
npm run dev
```

ან ერთი ბრძანებით: `bash start.sh` (Windows: `start.bat`).

ბრაუზერში: **http://localhost:3000**

## ბაზის აწყობა

```bash
npx supabase link --project-ref <ref>
npx supabase db push                          # სქემა + RLS
psql "$DATABASE_URL" -f supabase/seed.sql     # ენები, პაკეტები, კატეგორიები
npm run search:init                           # Meilisearch-ის ინდექსი
```

`seed.sql` მიგრაციების საქაღალდის გარეთაა, ამიტომ ცალკე უნდა გაუშვათ.

## ადმინის ანგარიში

```sql
update users set is_admin = true, status = 'active', email_verified_at = now()
 where email = 'your@email.ge';
```

## გვერდები

| მისამართი | რას აკეთებს |
| --- | --- |
| `/` | მთავარი — კატეგორიები, ახალი და მაღალი რეიტინგის განცხადებები |
| `/catalog` | კატალოგი ფილტრებით: ძებნა, ტიპი, ფასი, ქალაქი, რეიტინგი, დახარისხება |
| `/listings/new` | განცხადების შექმნა → გადახდა → გამოქვეყნება |
| `/listings/[id]` | განცხადების გვერდი, გალერეა, შეფასებები, ჩატის დაწყება |
| `/login`, `/register` | ავტორიზაცია, 2FA ადმინისთვის |
| `/dashboard` | ჩემი განცხადებები: სტატუსი, ვადა, აწევა, წაშლა |
| `/dashboard/certificates` | სერთიფიკატების წარდგენა და სტატუსი |
| `/chat` | მიმოწერები, რეალურ დროში განახლება |
| `/admin` | სტატისტიკა, გადახდების ჟურნალი, დაბრუნება |
| `/admin/certificates` | ვერიფიკაციის რიგი — დადასტურება ან უარყოფა |
| `/test.html` | ცალკე API ტესტერი (მხოლოდ ლოკალურად) |

## ნაკადი თავიდან ბოლომდე

1. **რეგისტრაცია** — `/register`, მიიღებთ ანგარიშს `pending` სტატუსში.
2. **დადასტურება** — კოდი ბაზაში ჰეშითაა; ლოკალურად SQL-ით გაააქტიურეთ.
3. **შესვლა** — `/login`. ადმინს 2FA სჭირდება.
4. **განცხადება** — `/listings/new`. ინახება `draft`-ად.
5. **გადახდა** — checkout ქმნის სესიას; განცხადება გადადის `awaiting_payment`-ში.
6. **გამოქვეყნება** — მოდალი გთავაზობთ ხელმოწერილი webhook-ის გაგზავნას.
   გასაღები აიღეთ `.env.local`-იდან (`PAYMENT_SECRET_PAYZE`). წარმატებისას
   განცხადება ხდება `active` და იწყება ვადა პაკეტის მიხედვით.
7. **ჩატი** — განცხადების გვერდიდან „მიმოწერის დაწყება".
8. **სერთიფიკატი** — `/dashboard/certificates`, შემდეგ ადმინი ადასტურებს
   `/admin/certificates`-ზე.

## სტრუქტურა

```
src/
├── app/
│   ├── page.tsx, catalog/, listings/, login/, register/
│   ├── dashboard/, chat/, admin/          # ინტერფეისი
│   └── api/                                # 20 REST ენდპოინტი
├── components/                             # Header, ListingCard, PaymentModal, ui
└── lib/
    ├── frontend/                           # API კლიენტი, ტიპები, ფორმატირება
    ├── auth/, i18n/, payments/, search/    # ბექენდის მოდულები
    └── supabase/, validation/, notifications/, audit/, chat/
supabase/migrations/                        # სქემა + RLS
```

## უსაფრთხოების ხაზინა

| წესი (TD) | სად ცხოვრობს |
| --- | --- |
| განცხადება მხოლოდ webhook-ით ქვეყნდება | `api/payments/webhook/` + ტრიგერი `payments_activate` |
| webhook-ის HMAC შემოწმება | `lib/payments/registry.ts` |
| სერთიფიკატს მხოლოდ ადმინი ადასტურებს | RLS `certs_admin_update` + `requireAdmin()` |
| ვერიფიკაციის აუდიტი | `lib/audit/log.ts` |
| ბარათის მონაცემები არ ინახება | მხოლოდ `tx_id` |
| rate limiting | `rateLimit()` — რეგისტრაცია, შესვლა, ჩატი |
| 2FA ადმინისთვის | `api/auth/login` |

## დომენით ტესტვა

```bash
cloudflared tunnel --url http://localhost:3000
# ან
ngrok http 3000
```

მიღებული მისამართი ჩაწერეთ `APP_URL`-ში და Supabase-ის
Authentication → URL Configuration-ში. დეტალები — `RUN-LOCAL.md`.
