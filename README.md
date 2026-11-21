# Op_Team — sayt (Node.js backend + Supabase)

Oldingi statik + Firebase versiya o'rniga: **Express backend** va **Supabase** (Postgres, Auth, Storage).

```
Brauzer ──► Express server ──► Supabase (baza, login, rasmlar)
                 └──────────► Discord (ixtiyoriy xabarnoma)
```

Muhim: `SUPABASE_SERVICE_ROLE_KEY` va Discord webhook faqat serverdagi `.env` faylida turadi,
brauzerga umuman chiqmaydi. Bazaga to'g'ridan-to'g'ri kirib bo'lmaydi (RLS yoqilgan, policy yo'q),
hamma narsa backend orqali o'tadi.

## 1. Supabase'ni sozlash (~5 daqiqa)

1. https://supabase.com → **New project**.
2. **SQL Editor → New query** → `supabase/schema.sql` ichidagini to'liq joylashtirib **Run** bosing
   (jadvallar, xavfsizlik va `images` bucket yaratiladi).
3. **Authentication → Users → Add user** → o'zingizning email va parolingiz (**Auto Confirm User** ni yoqing).
4. **Authentication → Sign In / Providers → Email**: **"Allow new users to sign up"** ni **o'chiring**.
5. **Project Settings → API** dan oling: `Project URL`, `anon` kalit, `service_role` kalit.

## 2. Lokal ishga tushirish

Node.js 18 yoki yangiroq kerak.

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
# .env ni to'ldiring (Supabase kalitlari, ADMIN_EMAILS; DISCORD_WEBHOOK_URL ixtiyoriy)
npm run seed              # (ixtiyoriy) boshlang'ich jamoa/hamkor/reyting ma'lumotlarini yozadi
npm start
```

Sayt: http://localhost:3000 — admin panel: http://localhost:3000/admin

`npm run seed` o'rniga admin paneldagi **"Zaxira ma'lumotlarni yuklash"** tugmasi ham bor.
Ikkalasi ham faqat jadval **bo'sh** bo'lsa ishlaydi (takrorlanib qo'shilmaydi).

## 3. Joylashtirish (deploy)

Backend Node.js server bo'lgani uchun Netlify/GitHub Pages ishlamaydi. Mos joylar: **Render**, **Railway**,
**Fly.io** yoki oddiy VPS.

- Build: `npm install`, Start: `npm start`
- Environment variables: `.env.example` dagi hammasi + `NODE_ENV=production` va `TRUST_PROXY=1`
- Saytni HTTPS orqali oching (production'da cookie faqat HTTPS'da ishlaydi)

## Xavfsizlik

- ⚠️ **Eski Discord webhook ochiq (public) kodda qolib ketgan edi.** Discord → Server Settings →
  Integrations → Webhooks da uni **o'chirib, yangisini yarating** va faqat `.env` ga qo'ying.
- Admin: Supabase Auth login + `ADMIN_EMAILS` ro'yxati (ro'yxatda bo'lmagan hisob kira olmaydi).
  Sessiya `httpOnly` + `SameSite=Strict` cookie'da, brauzer JS'i tokenni ko'rmaydi.
- Login: 15 daqiqada 10 urinish; Apply: soatiga 5 ta ariza (IP bo'yicha).
- Admin yozadigan hamma maydon serverda tekshiriladi (uzunlik, tur, rasm manzili formati).
- Apply arizasidagi `@everyone` kabi eslatmalar Discord'da ishlamaydi.
- `.env` ni hech qachon GitHub'ga yuklamang (`.gitignore` da bor).

## Tuzilma

```
server.js              Express ilovasi (helmet, statik fayllar, API)
src/config.js          .env o'qish va tekshirish
src/supabase.js        Supabase klientlari
src/auth.js            login, cookie sessiya, requireAdmin
src/tables.js          jadval tavsifi va validatsiya
src/routes-public.js   GET /api/team | partners | leaderboard
src/routes-admin.js    /api/admin/* (login, CRUD, rasm yuklash, seed)
src/routes-apply.js    POST /api/apply -> Discord
src/seed-data.js       boshlang'ich ma'lumotlar
supabase/schema.sql    bazani yaratish SQL'i
public/                sayt (HTML/CSS/JS, rasmlar)
```

## Arizalar (Apply)

Apply formasidan yuborilgan hamma narsa **saytning o'zida** saqlanadi: matnlar `applications` jadvalida,
rasm esa **private** Storage bucket'da (ommaga ochiq emas). `/admin` → **Arizalar** bo'limida ko'rasiz:
to'liq matn, rasm, **Qabul / Rad** holati va o'chirish (rasm ham birga o'chadi).
Yangi arizalar soni tab nomida ko'rinadi. Discord webhook ixtiyoriy: faqat xabarnoma uchun.

> Schema'ni avval ishga tushirgan bo'lsangiz, `supabase/schema.sql` ni qayta ishga tushiring —
> u xavfsiz (mavjud jadvallarga tegmaydi), faqat yangi `applications` jadvalini qo'shadi.

## Admin panel

`/admin` → **Team**, **Partners**, **Leaderboard**: qo'shish, tahrirlash, o'chirish.
Rasm uchun URL yozishingiz yoki fayl tanlashingiz mumkin (Supabase Storage'ga yuklanadi, 5 MB gacha).
Tartib raqami: kichigi birinchi chiqadi (Owner uchun `0`).
