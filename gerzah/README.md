# GerZah — Гэр Зах 🏠

**Монголын үл хөдлөх хөрөнгийн зах зээлийн платформ**  
*A modern Mongolian real estate marketplace — Airbnb/Booking.com style*

---

## Төслийн тухай / About

GerZah (Гэр Зах) нь Монгол Улсын үл хөдлөх хөрөнгийн онлайн зах зээл юм.  
Улаанбаатарын бүх дүүргийн орон сууц, байшин, газар, оффис худалдах болон түрээслэхэд зориулагдсан.

**Built with:** Next.js 14 · Supabase · Leaflet.js + OpenStreetMap · Tailwind CSS · Railway

---

## Орон нутгийн тохиргоо / Local Setup

### Шаардлага / Prerequisites
- Node.js 18+
- npm / yarn / pnpm
- Supabase account (free tier works)

### 1. Репо клонлох / Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/gerzah.git
cd gerzah
```

### 2. Тохиргооны файл үүсгэх / Create env file

```bash
cp .env.example app/.env.local
```

`app/.env.local` файлд Supabase мэдээллээ оруулна уу.

### 3. Dependency суулгах / Install dependencies

```bash
cd app
npm install
```

### 4. Хөгжүүлэлтийн сервер ажиллуулах / Run dev server

```bash
npm run dev
```

http://localhost:3000 дээр нээгдэнэ.

---

## Supabase тохиргоо / Supabase Setup

### 1. Суpabase төсөл үүсгэх

1. [supabase.com](https://supabase.com) дээр бүртгэл үүсгэнэ үү
2. "New project" дарж шинэ төсөл үүсгэнэ үү
3. **Settings → API** хэсгээс дараах утгуудыг авна уу:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Схем үүсгэх / Run migrations

Supabase Dashboard → **SQL Editor** дээр `supabase/migrations/001_initial_schema.sql` файлын агуулгыг буулгаж ажиллуулна уу.

### 3. Storage bucket үүсгэх

1. Supabase Dashboard → **Storage** → **New bucket**
2. Bucket name: `listing-images`
3. **Public bucket** гэж тохируулна уу

Storage policy нэмэх (SQL Editor-т):
```sql
-- Allow public read
CREATE POLICY "Public can view listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own listing images"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Seed data оруулах (заавал биш)

1. Supabase Dashboard → **Authentication → Users → Add user** дарж туршилтын хэрэглэгч үүсгэнэ үү
2. Тухайн хэрэглэгчийн UUID-г `supabase/seed.sql` файлд `seed_user_id` оронд оруулна уу
3. SQL Editor-т seed.sql файлын агуулгыг ажиллуулна уу

---

## Railway Deployment

### 1. GitHub repo тохиргоо

```bash
cd /path/to/gerzah
git init
git add .
git commit -m "feat: initial GerZah platform"
git remote add origin https://github.com/YOUR_USERNAME/gerzah.git
git push -u origin main
```

### 2. Railway дээр deploy

1. [railway.app](https://railway.app) дээр бүртгэнэ үү
2. **New Project → Deploy from GitHub repo** сонгоно уу
3. `gerzah` репог сонгоно уу
4. **Environment Variables** хэсэгт `.env.example`-д байгаа бүх хувьсагчдыг нэмнэ үү
5. Railway автоматаар `railway.json`-г унших ба build хийнэ

### 3. Custom domain (заавал биш)

Railway-н тохиргоод **Custom Domain** нэмж `NEXT_PUBLIC_SITE_URL`-г шинэчилнэ үү.

---

## Төслийн бүтэц / Project Structure

```
gerzah/
├── app/                    # Next.js application
│   ├── app/                # App Router pages
│   │   ├── page.tsx        # Homepage
│   │   ├── listings/       # Browse + detail pages
│   │   ├── post/           # Create listing
│   │   ├── login/          # Authentication
│   │   ├── register/       # Registration
│   │   └── dashboard/      # User dashboard
│   ├── components/         # Reusable components
│   ├── lib/                # Utilities & Supabase clients
│   └── middleware.ts       # Auth middleware
├── supabase/
│   ├── migrations/         # SQL schema
│   └── seed.sql            # Sample data
├── railway.json            # Railway deployment config
├── .env.example            # Environment variable template
└── README.md               # This file
```

---

## Технологийн стек / Tech Stack

| Технологи | Зориулалт |
|-----------|-----------|
| Next.js 14 (App Router) | Frontend framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Supabase | Database, Auth, Storage |
| Leaflet.js + OpenStreetMap | Maps (no API key needed) |
| Railway | Hosting |

---

## Онцлог / Features

- 🗺 **Интерактив газрын зураг** — Leaflet + OpenStreetMap (API key шаардахгүй)
- 🔍 **Дэвшилтэт хайлт** — дүүрэг, үнэ, өрөөний тоогоор шүүх
- 📱 **Responsive дизайн** — гар утас болон компьютерт зориулагдсан
- 🔐 **Supabase Auth** — имэйл/нууц үг бүртгэл
- 📸 **Зураг байршуулах** — Supabase Storage ашиглан
- 🏠 **Олон төрлийн зар** — орон сууц, байшин, газар, оффис
- 🌐 **Монгол хэлтэй UI** — бүх текст монголоор

---

## Лиценз / License

MIT License — Чөлөөтэй ашиглаж, өөрчилж болно.

---

*Монгол Улсад зориулж хийсэн платформ 🇲🇳*
