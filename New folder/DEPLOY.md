# BuildHub — განთავსება დომენზე

ნაბიჯ-ნაბიჯ ინსტრუქცია: ლოკალური შემოწმებიდან დომენამდე.
დრო: დაახლოებით 1 საათი, თუ Supabase და Vercel ანგარიშები ჯერ არ გაქვთ.

---

## არსებული ტესტ-სუბდომენის გამოყენება

ჰოსტინგზე შექმენით **Node.js აპლიკაცია** და მიაბით ტესტ-სუბდომენს. აპლიკაციის
საქაღალდედ მიუთითეთ ZIP-იდან ამოღებული `buildhub`, სადაც `package.json` დევს.
საქაღალდე განათავსეთ საჯარო ვებ-ფესვის გარეთ. FTP ფაილების ატვირთვის შემდეგ
ჰოსტინგმა აპლიკაციის პროცესი უნდა გაუშვას და ტესტ-სუბდომენზე მოთხოვნები მას გადააწოდოს.

1. აირჩიეთ Node.js 22 ან 24 და დააყენეთ ნაბიჯ 4-ში მოცემული გარემოს ცვლადები.
   `APP_URL`-ში ჩაწერეთ ტესტ-სუბდომენის სრული HTTPS მისამართი.
   იგივე მისამართი ჩაწერეთ Supabase-ის **Authentication → URL Configuration**-ში.
2. ახალ Supabase პროექტში გაუშვით ნაბიჯ 2.3-ში მითითებული მიგრაციები და seed.
   არსებულ ბაზაში გაუშვით მხოლოდ ჯერ გამოუყენებელი მიგრაციები.
3. აპლიკაციის საქაღალდეში გაუშვით `npm ci --include=dev`, შემდეგ `npm run build`.
   ჰოსტინგზე გაშვების ბრძანებაა `npm start`. მიაბით პროცესი ტესტ-სუბდომენს.
4. გახსენით ტესტ-სუბდომენი HTTPS-ით. კატალოგის ძებნისთვის მიუთითეთ Meilisearch-ის
   მისამართი და გასაღები და გაუშვით `npm run search:init`.

თუ ჰოსტინგის პაკეტს Node.js აპლიკაციების გაშვება არ აქვს, გამოიყენეთ ნაბიჯი 4
(Vercel) და ტესტ-სუბდომენი გადაამისამართეთ ახალი ჰოსტინგის DNS მითითებებით.

---

## ნაბიჯი 0 — რა დაგჭირდებათ

| რა | სად | ფასი |
| --- | --- | --- |
| Node.js 22+ | [nodejs.org](https://nodejs.org) | უფასო |
| GitHub ანგარიში | [github.com](https://github.com) | უფასო |
| Supabase ანგარიში | [supabase.com](https://supabase.com) | უფასო გეგმა საკმარისია |
| Vercel ანგარიში | [vercel.com](https://vercel.com) | უფასო გეგმა საკმარისია |
| დომენი | ნებისმიერი რეგისტრატორი | ~30–60 ₾/წელი |

დომენი ბოლოს იყიდეთ — ჯერ Vercel-ის უფასო მისამართზე გაუშვით.

---

## ნაბიჯი 1 — ლოკალურად შემოწმება

```bash
unzip buildhub-full.zip
cd buildhub
npm ci
```

შექმენით `.env.local` ფაილი:

```bash
cp .env.example .env.local
```

ჩაწერეთ მინიმუმ სამი მნიშვნელობა (იხილეთ ნაბიჯი 2):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_URL=http://localhost:3000
```

გაუშვით:

```bash
npm run dev
```

გახსენით `http://localhost:3000` — საიტი უნდა გამოჩნდეს. თუ შეცდომა ამოგიგდგათ,
**ჯერ ეს გაასწორეთ, სანამ Vercel-ზე ატვირთავთ** — იქ გამართვა რთულია.

---

## ნაბიჯი 2 — Supabase-ის ბაზა

### 2.1 პროექტის შექმნა

1. [supabase.com](https://supabase.com) → Sign in → **New project**
2. Name: `buildhub`
3. Database Password: დაგენერირეთ და **შეინახეთ** — დაგჭირდებათ
4. Region: აირჩიეთ **Frankfurt** ან **eu-central** — ყველაზე ახლოს საქართველოსთან
5. დაელოდეთ ~2 წუთი, სანამ პროექტი აშენდება

### 2.2 გასაღებების აღება

**Settings → API** გვერდზე:

| რას ეძებთ | სახელი პანელში | სად იხმარება |
| --- | --- | --- |
| Project URL | `Project URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role | `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

⚠️ **`service_role` გასაღები საიდუმლოა.** ის მხოლოდ Vercel-ის Environment Variables-ში
წერიეთ. არასოდეს არ ჩასვათ GitHub-ზე, არასოდეს არ გაუგზავნოთ სხვას.
თუ შემთხვევით გამჟღავნდა — Supabase-ის პანელიდან დაუყოვნებლივ შეცვალეთ (Reset).

### 2.3 სქემის ატვირთვა

**გზა А — Supabase-ის SQL Editor-იდან (მარტივია):**

1. Supabase → **SQL Editor** → New query
2. გახსენით `supabase/migrations/0001_init.sql`, დააკოპირეთ მთელი შიგთავსი, ჩასვით, **Run**
3. იგივე გაიმეორეთ რიგითობით:
   - `0002_rls.sql`
   - `0003_ads.sql`
   - `0004_ads_rls.sql`
   - `0005_account_permissions.sql`
   - `0006_allow_unlimited_bumps.sql`
   - `seed.sql`

**გზა Б — ტერმინალიდან:**

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
npm run db:seed
```

`project-ref` არის URL-ის პირველი ნაწილი: `https://xxxxx.supabase.co` → `xxxxx`.

`DATABASE_URL` — Settings → Database → Connection string → URI.

### 2.4 წვდომის მისამართების დაყენება

**Authentication → URL Configuration:**

- **Site URL**: `https://buildhub.vercel.app` (მოგვიანებით შეცვლით დომენზე)
- **Redirect URLs** → Add URL: იგივე მისამართი

თუ ეს არ ჩაწერთ, ელფოსტის დადასტურების ბმული არასწორ მისამართზე გადაგიყვანთ.

---

## ნაბიჯი 3 — კოდის GitHub-ზე ატვირთვა

```bash
cd buildhub
git init
git add .
git commit -m "BuildHub — initial"
```

**შეამოწმეთ, რომ `.env.local` არ არის სიაში.** გაუშვით `git status` — ფაილი
არ უნდა ჩანდეს. თუ ჩანს, შექმენით `.gitignore` ფაილი:

```
node_modules/
.next/
.env.local
.env*.local
```

შემდეგ:

```bash
git rm --cached .env.local
git commit -m "Remove env file"
```

GitHub-ზე შექმენით ახალი რეპოზიტორი (Private რეკომენდებულია), შემდეგ:

```bash
git remote add origin https://github.com/<username>/buildhub.git
git branch -M main
git push -u origin main
```

---

## ნაბიჯი 4 — Vercel-ზე განთავსება

1. [vercel.com](https://vercel.com) → Sign in **GitHub-ით**
2. **Add New → Project**
3. აირჩიეთ `buildhub` რეპოზიტორი → **Import**
4. Framework Preset: **Next.js** (თავად ამოიცნობს)
5. **Environment Variables** → დაამატეთ ერთი-ერთი:

| Name | Value | საიდუმლო? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase-ის Project URL | არა |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public | არა |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret | **დიახ** |
| `APP_URL` | `https://buildhub.vercel.app` | არა |
| `CRON_SECRET` | იგონებთ: გრძელი შემთხვევითი სტრიქონი | **დიახ** |
| `CODE_PEPPER` | იგონებთ: გრძელი შემთხვევითი სტრიქონი | **დიახ** |

`CRON_SECRET` და `CODE_PEPPER` — გახსენით [random.org](https://www.random.org/strings/)
ან ტერმინალში: `openssl rand -hex 32`

6. **Deploy** → დაელოდეთ 2–3 წუთი

Vercel მოგცემთ მისამართს, მაგალითად `https://buildhub-xyz.vercel.app`.
**ზუსტი მისამართი ჩააკოპირეთ** — შემდეგ ეს ჩაწერეთ `APP_URL`-ში და Supabase-ში.

### თუ Deploy ჩავარდა

Build Log-ში ნახავთ შეცდომას. ყველაზე ხშირი:

| შეცდომა | მიზეზი | გამოსავალი |
| --- | --- | --- |
| `Type error: ...` | ტიპის შეცდომა კოდში | შეცდომის ტექსტი შემომწერეთ — გავასწორებ |
| `Module not found` | აკლია დამოკიდებულება | `npm install <package>` ლოკალურად, შემდეგ push |
| `Environment variable not found` | ცვლადი არ ჩაიწერა | Vercel → Settings → Environment Variables |

**მნიშვნელოვანი:** Vercel-ის build მკაცრია და ტიპის შეცდომაზე ჩერდება.
თუ ლოკალურად `npm run dev` მუშაობდა, ეს არ ნიშნავს, რომ build გაივლის —
`npm run build` ლოკალურადაც გაუშვით.

---

## ნაბიჯი 5 — დომენის მიბმა

### 5.1 დომენის შეძენა

რეგისტრატორი აირჩიეთ: [namecheap.com](https://namecheap.com),
[cloudflare.com/products/registrar](https://www.cloudflare.com/products/registrar/),
ან ქართული რეგისტრატორი `.ge` დომენისთვის.

### 5.2 Vercel-ზე დამატება

1. Vercel → თქვენი პროექტი → **Settings → Domains**
2. ჩაწერეთ დომენი: `buildhub.ge` → **Add**
3. Vercel მოგცემთ DNS ჩანაწერებს — ჩააკოპირეთ:

| ტიპი | სახელი | მნიშვნელობა |
| --- | --- | --- |
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

**ზუსტი მნიშვნელობები Vercel-ის პანელში ჩანს** — ზემოთ მოცემულია ტიპური,
მაგრამ დროთა განმავლობაში იცვლება. ყოველთვის Vercel-ის პანელიდან აიღეთ.

### 5.3 ჩაწერა რეგისტრატორთან

რეგისტრატორის პანელში → DNS Management → დაამატეთ ზემოთ მოცემული ორი
ჩანაწერი. შენახვიდან 5 წუთი–2 საათი სჭირდება გავრცელებას.

შემოწმება: [dnschecker.org](https://dnschecker.org) — ჩაწერეთ დომენი და ნახეთ,
მწვანეა თუ არა ყველგან.

### 5.4 მისამართის განახლება — სამი ადგილი

როცა დომენი მუშაობს, მისამართი სამ ადგილას უნდა შეიცვალოს:

**1. Vercel → Settings → Environment Variables:**
```
APP_URL=https://buildhub.ge
```
შემდეგ **Deployments → ⋯ → Redeploy** (ცვლადის შეცვლა თავისით არ მოქმედებს).

**2. Supabase → Authentication → URL Configuration:**
- Site URL: `https://buildhub.ge`
- Redirect URLs: `https://buildhub.ge` და `https://buildhub.ge/**`

**3. გადახდის პროვაიდერი** (როცა მიაბამთ) — webhook-ის მისამართი:
```
https://buildhub.ge/api/payments/webhook/payze
```

---

## ნაბიჯი 6 — პირველი ადმინი

1. გახსენით `https://buildhub.ge/register`, დარეგისტრირდით
2. Supabase → SQL Editor → გაუშვით:

```sql
update users
   set status = 'active',
       email_verified_at = now(),
       is_admin = true,
       is_company = true
 where email = 'თქვენი@email.ge';
```

3. შედით `https://buildhub.ge/login`-იდან

ტესტისთვის კატალოგი ცარიელი იქნება. ან დაამატეთ განცხადება ინტერფეისიდან,
ან გაუშვით `npm run seed:demo` ლოკალურად (იმავე ბაზის მისამართით).

---

## სასარგებლო ბრძანებები

| რა გინდათ | ბრძანება |
| --- | --- |
| ლოკალური გაშვება | `npm run dev` |
| Build-ის შემოწმება (Vercel-ის წინ!) | `npm run build` |
| ტიპების შემოწმება | `npm run typecheck` |
| ბაზის სქემის განახლება | `npx supabase db push` |
| დემო განცხადებები | `npm run seed:demo` |
| ძებნის ინდექსის აწყობა | `npm run search:init` |

---

## დარჩენილი სამუშაო (საიტის გაშვებისთვის სავალდებულო არ არის)

| რა | რისთვის | სად |
| --- | --- | --- |
| Meilisearch | კატალოგის ძებნა. მის გარეშე კატალოგი ცარიელია | [meilisearch.com/cloud](https://www.meilisearch.com/cloud) |
| Resend ან SendGrid | ელფოსტის დადასტურება და შეტყობინებები | [resend.com](https://resend.com) |
| SMS პროვაიდერი | ტელეფონის დადასტურება | ქართული პროვაიდერი |
| Payze / TBC / BoG / Stripe | რეალური გადახდები | პროვაიდერის პანელი |
| Vercel Cron | ვადებისა და შეხსენებების ავტომატიზაცია | Vercel → Settings → Cron Jobs |

ყველა მათგანი `.env.example`-შია ჩამოწერილი სახელებით. Vercel-ში ჩასვით
მხოლოდ ის, რასაც რეალურად იყენებთ — დანარჩენი ცარიელი დატოვეთ, კოდი
მათ გარეშე მუშაობს და გაფრთხილებას ბეჭდავს.

---

## ხშირი ხარვეზები

| სიმპტომი | მიზეზი |
| --- | --- |
| საიტი იტვირთება, მაგრამ მონაცემები არ ჩანს | Supabase-ის ცვლადები არასწორია |
| `500` ყველა API მოთხოვნაზე | `SUPABASE_SERVICE_ROLE_KEY` აკლია ან არასწორია |
| რეგისტრაცია მუშაობს, შესვლა — არა | Supabase → Auth → URL Configuration არ არის შევსებული |
| კატალოგი ცარიელია | Meilisearch გამორთულია (სხვა გვერდები მუშაობს) |
| Deploy ჩავარდა ტიპის შეცდომაზე | `npm run build` ლოკალურად არ გაშვებულა |
| დომენი არ იხსნება | DNS ჩანაწერები არასწორია ან ჯერ არ გავრცელებულა |
| ელფოსტის ბმული `localhost`-ზე გადადის | Site URL ძველია Supabase-ში |
