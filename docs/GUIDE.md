# PKeStore — Complete Guide (Dashboard, Deployment, Security)

Ye guide PKeStore.com ki website chalane ke liye hai: website live kaise karni hai, dashboard se har cheez kaise add / update / remove karni hai, aur website ko mehfooz kaise rakhna hai. Har step tarteeb se likha hai — pehli dafa upar se neeche follow karein.

---

## 1. Website mein kya kya hai

**Store (customers ke liye)**

- Homepage — hero slider, trust badges, category circles, product rows, banners, reviews, guides, newsletter (sab dashboard se change hota hai)
- Desktop pe **mega menu** — 10 main categories, un ki sub-categories (images ke sath) aur har category ke popular products
- Mobile pe slide-out menu, search aur sticky header
- 10 categories, 30 sub-categories, 40 starter products (har category mein 3–5)
- Product page — image gallery, price/discount, features, specifications, "Buy now", WhatsApp order button, related products
- Live search (type karte hi suggestions)
- Cart, checkout — **Cash on Delivery, JazzCash, Easypaisa, Bank transfer** (TID / screenshot upload)
- Coupon codes, free delivery limit
- Order confirmation page aur **Track order** page (order number + mobile number)
- Pillar guides aur cluster articles (SEO content), About, Contact (form), FAQ, policies
- SEO: har page ka title/description, Google ke liye product schema, breadcrumbs, `sitemap.xml`, `robots.txt`
- WhatsApp floating button, Google Analytics aur Meta Pixel support

**Dashboard (`/admin`)**

| Section | Kaam |
|---|---|
| Dashboard | Aaj ke orders, pending orders, mahine ki sale, low stock, best sellers |
| Orders | Orders dekhna, status badalna, payment verify karna, courier/tracking, CSV export |
| Products | Add / edit / hide / duplicate / delete, images, features, specs, SEO, supplier info |
| Categories | Main aur sub-categories, images, mega menu, order, SEO text |
| Homepage | Homepage ke sections add / edit / hide / order / remove |
| Pages & guides | Pages, Pillar guides, Cluster articles |
| Menus | Header aur footer links |
| Media library | Images upload (khud WebP ≤200KB), copy link, delete |
| Coupons | Discount codes |
| Messages | Contact form messages, newsletter subscribers |
| Users & roles | Team members aur un ke roles (sirf Master Admin) |
| Activity log | Kis ne kab kya kiya, failed logins |
| Settings | Store info, delivery charges, payment methods, SEO, social links, tracking |
| My account | Naam, password change, sab devices se logout |

**Technology:** Next.js 16 (React), Tailwind CSS, MySQL (Hostinger), Drizzle ORM. Images WebP mein, fonts website ke andar (koi bahar ki request nahi), har page server pe render hota hai aur data cache hota hai — is liye website tez hai.

---

## 2. Project folder ka naqsha

```
pkestore/
├─ src/app/(store)/        ← customers wali website ke pages
├─ src/app/admin/          ← dashboard
├─ src/components/         ← design ke hisse (header, footer, product card…)
├─ src/db/schema.ts        ← database tables
├─ src/lib/                ← security, login, image upload, settings
├─ public/seed/            ← starter images (products, categories, banners) — sab WebP
├─ database/pkestore.sql  ← poora database (tables + starter data) — phpMyAdmin mein import
├─ drizzle/                ← database migrations
├─ scripts/                ← seed, admin create, images convert
├─ docs/GUIDE.md           ← ye guide
└─ .env.example            ← environment variables ka namoona
```

---

## 3. Deployment ka tareeqa chunein

Do raaste hain. **Dono mein database Hostinger MySQL hi hai.**

| | **Option A: Sab kuch Hostinger pe** (recommended) | **Option B: Vercel + Hostinger database** |
|---|---|---|
| Plan | Hostinger **Business** web hosting ya **Cloud** plan (Node.js apps support karte hain) | Vercel **Pro** ($20/mahina) + koi bhi Hostinger plan (sirf database ke liye) |
| Speed | Database aur website ek hi server pe — bohat tez | Vercel CDN tez hai, lekin har database query internet pe jati hai |
| Images | Server ke folder mein | Vercel Blob storage |
| Note | Hostinger Business/Cloud pe SSH se npm commands nahi chalti — is liye database **SQL file import** se banta hai (Step 4) | Vercel ka free **Hobby** plan sirf non-commercial / personal use ke liye hai, store ke liye Pro chahiye |

> Agar aap ke paas Hostinger Business ya Cloud plan hai to **Option A** lein — sasta, simple aur tez.

---

## 4. Step-by-step: Database banana (dono options ke liye)

1. **hPanel** → **Websites** → apni website → **Databases** → **MySQL Databases**.
2. Naya database banayein:
   - Database name: `pkestore` (Hostinger aage `u123456789_` laga dega)
   - Username: `pkee`
   - Password: strong password (likh kar mehfooz rakhein)
3. Banne ke baad list mein **database name, username aur host** nazar aayenge. Host aam tor pe `localhost` (Option A) ya `srvXXXX.hstgr.io` / IP (Option B) hota hai.
4. Usi list mein database ke saamne **Enter phpMyAdmin** pe click karein.
5. phpMyAdmin mein left side pe apna database select karein → upar **Import** tab → **Choose file** → project ki `database/pkestore.sql` file → neeche **Import / Go**.
6. "Import has been successfully finished" aa jaye to left side pe tables nazar aayengi (`products`, `categories`, `orders`…). Database tayyar hai — 40 products, 10 categories, pages aur guides ke sath.

### DATABASE_URL banana

```
mysql://USERNAME:PASSWORD@HOST:3306/DATABASE
```

Misal:

```
mysql://u123456789_pkee:MyStr0ngPass@localhost:3306/u123456789_pkestore
```

> Agar password mein `@ : / # ? &` jaise characters hon to unhein encode karein (`@` = `%40`, `#` = `%23`) — ya password sirf letters aur numbers ka rakhein (16+ characters).

---

## 5. Code GitHub pe dalna

1. [github.com](https://github.com) pe account banayein → **New repository** → naam `pkestore` → **Private** → Create.
2. Apne computer pe Node.js 22 install karein ([nodejs.org](https://nodejs.org)) aur Git ([git-scm.com](https://git-scm.com)).
3. Project zip extract karein (is mein pehle se ek git commit hai), folder mein terminal kholein aur:

```bash
git remote add origin https://github.com/YOUR-USERNAME/pkestore.git
git branch -M main
git push -u origin main
```

> `.env` file kabhi GitHub pe nahi jati (`.gitignore` mein hai). Passwords sirf hosting ke "Environment variables" mein dalein.

---

## 6A. Option A — Hostinger pe live karna (Node.js Web App)

1. hPanel → **Websites** → **Create Website** (ya Add website) → **Web App** (Node.js).
2. **Import Git Repository** → GitHub connect karein → `pkestore` repository chunein.
   (Bina GitHub ke: **Upload your website files** se project ki zip upload kar sakte hain — `node_modules` aur `.next` folder zip mein na dalein.)
3. Build settings:
   - Framework: **Next.js**
   - Node version: **22.x**
   - Build command: `npm run build`
   - Start: `npm start` (aam tor pe khud detect hota hai)
4. **Environment variables** mein ye dalein (tafseel section 8 mein):

| Name | Value |
|---|---|
| `DATABASE_URL` | Step 4 wala URL (host `localhost`) |
| `DATABASE_SSL` | `false` |
| `AUTH_SECRET` | 48+ characters ka random string |
| `SETUP_KEY` | Apni banai hui secret key (misal: `Pkee-Setup-7731-Lahore`) |
| `NEXT_PUBLIC_SITE_URL` | `https://pkestore.com` |
| `UPLOAD_DIR` | `/home/u123456789/domains/pkestore.com/uploads` (aap ka username; deploy folder se bahar taake redeploy pe images na mitein) |

5. **Deploy** pe click karein. 3–6 minute mein build complete ho jayega.
6. Domain `pkestore.com` isi website se connected ho (hPanel → Domains). SSL (https) Hostinger khud lagata hai — **Security → SSL** mein "Active" check karein.

**Update kaise karein:** GitHub pe naya code push karein → Hostinger dashboard mein **Redeploy** (ya auto-deploy on hai to khud).

---

## 6B. Option B — Vercel pe live karna

### Hostinger database ko bahar se access dena

1. hPanel → website → **Databases → Remote MySQL**.
2. **Any Host** tick karein (Vercel ke IP badalte rehte hain) → database select → **Create**.
3. Upar likha **MySQL hostname** note karein (misal `srv1234.hstgr.io`). `DATABASE_URL` mein yahi host aayega.

### Vercel project

1. [vercel.com](https://vercel.com) → GitHub se login → **Add New → Project** → `pkestore` import.
2. Framework: Next.js (khud detect). Build command default rehne dein.
3. **Environment Variables** (section 8) dalein — `DATABASE_URL` mein Hostinger remote hostname.
4. **Deploy**.
5. **Images ke liye Blob:** Project → **Storage** → **Create** → **Blob** → project se connect. `BLOB_READ_WRITE_TOKEN` khud add ho jata hai → **Deployments → Redeploy**.
6. **Region:** Project → **Settings → Functions → Function Region** — wo region chunein jo Hostinger database ke data center ke qareeb ho (hPanel mein server location dekhein, misal Asia ke liye Singapore/Mumbai). Is se pages tez khulte hain.
7. **Domain:** Project → **Settings → Domains** → `pkestore.com` aur `www.pkestore.com` add → jo DNS records Vercel bataye (A record `76.76.21.21` waghera) wo Hostinger **Domains → DNS / Nameservers** mein dalein. 10 min – 24 ghante mein live.

---

## 7. Master Admin banana (sirf ek dafa)

1. Browser mein kholein: `https://pkestore.com/admin/setup`
2. Ye fields bharein:
   - **Setup key** — wohi `SETUP_KEY` jo environment variables mein dali
   - Naam, email, password (10+ characters, bare + chhote letters + number)
3. **Create Master Admin** → aap seedha dashboard mein pohanch jayenge.
4. Iske baad `/admin/setup` page hamesha ke liye band ho jata hai — doosra koi wahan se admin nahi bana sakta.
5. Ab login hamesha `https://pkestore.com/admin/login` se.

> Password bhool jayein to: **Master Admin** doosre users ka password reset kar sakta hai. Master Admin khud ka password bhoole to developer computer pe `.env` mein live `DATABASE_URL` daal kar chalaye: `npm run create-admin -- "Shahzaib" email@x.com "NewPass12345"`

---

## 8. Environment variables (sab ka matlab)

| Variable | Zaroori? | Matlab |
|---|---|---|
| `DATABASE_URL` | Haan | Hostinger MySQL ka connection |
| `DATABASE_SSL` | Nahi | `true` sirf agar remote connection SSL maange |
| `AUTH_SECRET` | Haan | Login cookies sign karne ki secret. Kam az kam 32 characters. Badalne se sab log logout ho jate hain |
| `SETUP_KEY` | Haan | `/admin/setup` pe pehla Master Admin banane ke liye |
| `NEXT_PUBLIC_SITE_URL` | Haan | `https://pkestore.com` — sitemap, Google, share links ke liye |
| `BLOB_READ_WRITE_TOKEN` | Vercel pe haan | Vercel Blob (images) |
| `UPLOAD_DIR` | Hostinger pe recommended | Uploads ka folder (deploy folder se bahar) |
| `DATABASE_POOL_SIZE` | Nahi | Default 5 database connections |

**Random AUTH_SECRET banana:** terminal mein `openssl rand -base64 48`, ya kisi password manager se 48 characters ka random password.

---

## 9. Dashboard — har section ka istemal

Login: `/admin/login`. Left side pe menu hai (mobile pe ☰ button). Har save ke baad neeche right pe green message aata hai aur **website foran update** ho jati hai.

### 9.1 Dashboard (home)

- Aaj ke orders, pending orders, is mahine ki sale (cancelled/returned ke baghair), total products.
- Yellow/blue chips: "payments verify karni hain", "naye messages", "stock kam hai" — click kar ke seedha us list pe.
- **Add product** aur **New page / guide** shortcuts.

### 9.2 Orders — dropshipping workflow

Har naya order **Pending** status mein aata hai. Recommended tarteeb:

| Status | Kab lagayein |
|---|---|
| Pending | Order aaya (khud) |
| Confirmed | Customer ko call / WhatsApp kar ke confirm kar liya |
| Ordered from supplier | Supplier se product mangwa liya (dropship) |
| Shipped | Courier ko de diya — **Courier** aur **Tracking #** zaroor likhein |
| Delivered | Customer ko mil gaya |
| Cancelled / Returned | Order cancel ya wapis — **stock khud wapis add** ho jata hai |

Order detail page pe:

- **Items** — har item ke neeche **Supplier link** (product mein supplier URL dala ho to) — wahan se dropship order karein.
- **Customer** — Call aur **WhatsApp** button (confirmation message pehle se likha hota hai).
- **Payment** — JazzCash/Easypaisa/Bank orders mein Transaction ID aur screenshot. Apne account mein payment check karein, phir **Payment status = Paid**.
- **Internal notes** — sirf team ko nazar aate hain.
- Customer `/track-order` pe status aur tracking number khud dekh sakta hai.
- **Export CSV** — orders ki Excel file (courier booking ya hisaab ke liye).
- Delete sirf Master Admin / Admin kar sakte hain.

### 9.3 Products

**Naya product:** Products → **Add product**.

1. **Product name** — URL slug khud ban jata hai (`/product/naam`). Slug baad mein na badlein, warna purane links aur Google ranking toot jati hai.
2. **Short description** — 1–2 lines, price ke neeche aur Google mein.
3. **Images** — **Upload** (computer se) ya **Library** (pehle se uploaded). Kai images ek sath. Pehli image **Main** hai (cards, Google, WhatsApp share). Arrows se order badlein, ✕ se hatayein.
4. **Full description** — toolbar se heading, bold, list, link, table, image. **Preview** se check karein.
5. **Key features** — bullet points (har line alag). **Specifications** — naam / value rows.
6. **Category** — sub-category chunein (misal Smart Watches), product main category mein bhi khud nazar aayega.
7. **Sale price** aur **Compare-at** (kata hua price) — discount % khud calculate hota hai.
8. **Stock** — 10 se kam ho to "Sirf X baqi" dikhta hai; 0 pe "Out of stock". Har order pe stock khud kam hota hai.
9. **Badge** — "Hot", "New", "Best Seller" jaisa chhota label.
10. **Dropshipping (private)** — cost price, supplier naam, supplier URL, supplier SKU, delivery time. Ye sirf admin ko dikhta hai; edit page pe **profit per piece** nazar aata hai.
11. **Display** — rating, reviews count, sort order (chhota number pehle).
12. **SEO** — khali chhorein to naam aur short description istemal hoti hai.
13. **Live on website** on/off, **Featured** (homepage featured sections).

**List page pe:** search, category/status filter, aur har product ke saath: ✎ edit, ↗ website pe dekhein, 👁 hide/show, ⧉ duplicate (milta-julta product jaldi banane ke liye — copy hidden banti hai), 🗑 delete.

> Jis product ke orders ho chuke hain wo delete nahi hota — hide ho jata hai, taake purane orders ka record kharab na ho.

### 9.4 Categories (aur mega menu)

- Do levels: **Main category** → **Sub-category**.
- **Parent category** khali = main category (mega menu ki left list mein). Parent chunein = sub-category (mega menu ke andar image ke sath).
- **Image** — category circle, mega menu aur category page pe. Square image best (800×800).
- **Menu icon** — mega menu aur mobile menu mein naam ke saath icon.
- **Show in mega menu** off = category website pe hai lekin menu mein nahi.
- **SEO content** — category page ke neeche text (150–300 words) — Google ranking ke liye.
- **↑ ↓ arrows** — order (mega menu aur homepage circles mein yahi tarteeb).
- Delete sirf tab jab category khali ho (na products, na sub-categories) — pehle products ko doosri category mein move karein.
- Desktop header mein pehli 4–7 main categories seedhi nazar aati hain (screen size ke hisaab se); baqi **All categories** button mein.

### 9.5 Homepage (sections)

Homepage upar se neeche in sections se banta hai. Har row pe: ↑ ↓ order, 👁 hide/show, ✎ edit, 🗑 remove. Right side **Add a section** se naya section aakhir mein add hota hai.

| Section | Kya settings hain |
|---|---|
| Hero slider | 6 tak slides: image (1600×800, products right side pe), heading, text, button text, button link |
| Trust badges | 4 badges: icon, title, text |
| Category circles | Title, subtitle — categories khud aati hain |
| Product row / grid | Source: Featured / Best selling / Newest / Biggest discounts / ek category; kitne products; Grid ya scrolling row; "View all" link |
| Wide banner | Image (1600×600), title, text, button, link, dark image option |
| Two banners | 2 banners (1200×600) saath saath |
| Customer reviews | Naam, city, stars, review |
| Latest guides | Kitne articles |
| Newsletter | Title, subtitle |
| Text block | Apna text (SEO paragraph, announcement) |

**Links kaise likhein:** website ke andar ke links `/` se: `/category/smart-gadgets`, `/product/profit-ultra-smart-watch`, `/shop?sort=newest`, `/guides`. Bahar ke links `https://` se.

### 9.6 Pages & guides (Page, Pillar, Cluster)

| Type | Kya hai | URL |
|---|---|---|
| **Page** | About, Contact, policies, FAQ | `/about` |
| **Pillar guide** | Kisi bare topic ki mukammal guide (1500+ words) | `/guides/smart-watch-buying-guide-pakistan` |
| **Cluster article** | Pillar ke andar ek specific sawal ka jawab (600–1200 words) | `/guides/pillar-slug/article-slug` |

**SEO topic cluster strategy:** ek pillar (misal "Smart Watch Buying Guide") + 4–8 cluster articles ("battery tips", "smart watch vs band", "best under 5000"). Pillar mein har cluster ka link, har cluster mein pillar ka link. Isi se Google samajhta hai ke aap is topic ke expert hain.

Banane ka tareeqa:

1. Pages & guides → **+ Pillar** (ya + Cluster / + Page).
2. Title (slug khud), excerpt, body (toolbar wala editor — `## Heading` se sections; **On this page** table of contents khud banta hai).
3. Cluster ke liye **Parent pillar guide** chunein.
4. **Related category** (optional) — article ke neeche us category ke 4 products nazar aate hain (content se sale).
5. **Cover image** (1200×675), author, SEO title/description.
6. **Status: Draft** (chhupa) ya **Published** (live). Draft mein likhte rahein, tayyar ho to Published.
7. Page type mein **Footer mein link dikhayein** tick karein to footer "Help & info" mein aa jata hai.
8. Contact page (slug `contact`) pe contact form aur aap ki contact details khud lagti hain.

### 9.7 Menus

- **Header links** — mega menu bar ke right side (Deals, New arrivals, Guides).
- **Footer: Shop column** — khali ho to categories khud aati hain.
- **Footer: Help column** — yahan ke links + "Footer mein dikhayein" wale pages.
- Har link: label, URL, Live, New tab. ↑ ↓ se order, 🗑 se hatayein, neeche **Add link**.

### 9.8 Media library

- **Upload** pe click kar ke kai images ek sath (JPG, PNG, WebP, AVIF). Har image khud:
  - **WebP** mein convert
  - zyada se zyada 1600px chaurai
  - **200KB se kam** (quality/size khud adjust)
- Har image pe size (KB) aur dimensions, **Copy URL**, **Delete**.
- Delete karne se pehle dekh lein ke image kisi product/banner mein lagi to nahi.
- Starter images `public/seed/` mein hain (website ke saath) — wo library mein nahi dikhtin, lekin aap unhein badal kar nayi upload kar sakte hain.

### 9.9 Coupons

- Types: **Percent off** (1–90%), **Fixed amount off** (Rs), **Free delivery**.
- **Minimum order**, **Max uses** (khali = unlimited), **Expires on**, Active on/off.
- Har channel ke liye alag code (misal `INSTA10`, `FB15`, `TIKTOK500`) — orders mein coupon code se pata chalta hai sale kahan se aayi.
- Starter codes: `WELCOME10` (10%, Rs 2,000+), `FREESHIP` (Rs 1,500+), `SAVE500` (Rs 5,000+). Na chahiye to delete ya inactive karein.

### 9.10 Messages

- **Contact messages** — naye messages highlight; WhatsApp / Email reply buttons; read/unread; delete.
- **Subscribers** — newsletter emails; **Export CSV** (email marketing tool mein import ke liye).

### 9.11 Users & roles (sirf Master Admin)

**Add team member:** naam, email, role, password → **Create user** → unhein email + password de dein → wo `/admin/login` se login karein (pehli login ke baad **My account** se password badal lein).

| Role | Kya kar sakta hai |
|---|---|
| **Master Admin** | Sab kuch + users/roles. Sirf ek, delete nahi ho sakta |
| **Admin** | Sab kuch siwaye users ke (settings, orders, products, content, activity log) |
| **Editor** | Products, categories, pages/pillar/cluster, media |
| **Marketer** | Homepage sections, banners, menus, coupons, pages/guides, media, messages |
| **Order Manager** | Orders, payment verification, tracking, messages |

- User row khol kar: naam/email/role badlein, **New password** se password reset, **Account active** off = login band.
- Role badalne, password reset ya disable karne se us user ke sab devices se **khud logout** ho jata hai.
- ⇥ button = user ko tamam devices se logout.
- Neeche **Role permissions** table mein har role ki permissions.

### 9.12 Activity log

Har create / update / delete, login, failed login aur upload — user ka naam, waqt aur IP ke saath. Koi ghalat change ho jaye to yahan se pata chalta hai kis ne kiya.

### 9.13 Settings

- **Store** — naam, tagline, logo (khali = text logo), favicon, footer text.
- **Contact** — phone, **WhatsApp number** (`923001234567` format — WhatsApp button isi pe jata hai), email, address, timings.
- **Announcement bar** — sab se upar ki patti, on/off.
- **Delivery** — delivery fee, kitne rupay se upar free, delivery time (product page aur checkout pe).
- **Payment methods** — COD, JazzCash, Easypaisa, Bank on/off aur account details (checkout pe customer ko nazar aati hain). Kam az kam ek on rehna zaroori.
- **SEO** — homepage title, description, share image (WhatsApp/Facebook pe link share ho to ye image).
- **Social** — Facebook, Instagram, TikTok, YouTube (footer icons).
- **Tracking** — Google Analytics 4 ID (`G-…`), Meta Pixel ID (sirf numbers). Save karte hi website pe lag jate hain.

### 9.14 My account

Naam badlein, password change (phir dobara login), **Log out from all devices**.

---

## 10. Images ke liye rules

Dashboard har upload ko khud WebP ≤200KB bana deta hai. Behtar result ke liye:

| Jagah | Size (px) | Shape |
|---|---|---|
| Product images | 1000×1000 – 1600×1600 | Square, saaf background |
| Category image | 800×800 | Square |
| Hero slide | 1600×800 | Product right side pe, left side khali (text ke liye) |
| Wide banner | 1600×600 | |
| Two banners | 1200×600 | Text left side pe aata hai |
| Guide cover | 1200×675 | 16:9 |
| Share (OG) image | 1200×630 | |

- Starter product images illustrations hain — asli product photos upload kar ke badal dein (Products → edit → purani image ✕ → Upload).
- Computer pe pehle se convert karna ho: `npm run images -- "C:\path\to\folder"` → `webp` folder mein WebP files.
- Supplier ki images istemal karne se pehle unki ijazat lein; doosre brands ki images/logos copy na karein.

---

## 11. Security — kya kya laga hai

- **Passwords** bcrypt (cost 12) se hash — database mein asli password kabhi save nahi hota.
- **Login sessions** — signed, httpOnly, secure cookies + database session (7 din). Logout ya password change pe session khatam.
- **Brute-force protection** — ek email pe 15 minute mein 6, ek IP se 20 ghalat logins ke baad block; failed logins activity log mein.
- **Role-based access** — har page aur har action server pe permission check karta hai (sirf menu chhupana nahi).
- **Setup lock** — `/admin/setup` sirf tab chalta hai jab koi user na ho aur sahi `SETUP_KEY` ho.
- **Admin protection** — `/admin` aur `/api/admin` login ke baghair band; Google index nahi karta (`noindex`).
- **Checkout security** — prices hamesha database se calculate (browser se nahi), stock check, coupon check, rate limit (spam orders), honeypot (bots).
- **Uploads** — sirf images; har file dobara process (WebP) hoti hai to chhupa hua code khatam; 4MB limit; random file names.
- **Content** — articles ka HTML sanitize (scripts/iframes block, sirf YouTube/Google embeds).
- **SQL injection** se bachao — tamam queries parameterized (Drizzle ORM).
- **Security headers** — HTTPS (HSTS), Content-Security-Policy, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy.
- **CSRF** — Next.js server actions origin check; upload API origin check.
- **CSV export** — formula injection se bachao.
- **Activity log** — har admin change ka record.

### Aap ki zimmedari (checklist)

- [ ] `AUTH_SECRET` aur `SETUP_KEY` lambe, random — kisi ko na batayein, GitHub pe na dalein
- [ ] Master Admin ka password 14+ characters, kahin aur istemal na ho
- [ ] Har team member ka alag account (password share na karein); jo chhor jaye uska account disable/delete
- [ ] Hostinger account pe **2-factor authentication** on
- [ ] GitHub repository **Private**
- [ ] Hostinger **backups** on (hPanel → Backups); har hafte orders ka CSV export
- [ ] Option B mein Remote MySQL "Any host" hai — is liye database password bohat strong rakhein
- [ ] Activity log kabhi kabhi check karein

---

## 12. Rozana kaam — chhoti checklist

1. Dashboard kholein → **Pending orders** → har order confirm (call/WhatsApp) → **Confirmed**.
2. Supplier se mangwayein → **Ordered from supplier**.
3. Courier booking → courier + tracking # → **Shipped**.
4. Delivery pe → **Delivered** (COD payment mil gayi to Payment status **Paid**).
5. JazzCash/Easypaisa/Bank wale orders: payment check → **Paid**.
6. Messages ka jawab.
7. Low stock products update.

---

## 13. Developer ke liye (computer pe chalana)

```bash
npm install
cp .env.example .env     # .env mein DATABASE_URL waghera dalein
npm run db:setup         # tables + starter data (khali database pe)
npm run dev              # http://localhost:3000
```

| Command | Kaam |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / start |
| `npm run db:migrate` | Database tables banana / update |
| `npm run db:seed` | Starter data (sirf khali database pe; dobara: `-- --force` — products/orders mita deta hai) |
| `npm run db:export` | Database ki `.sql` file banana |
| `npm run create-admin -- "Name" email "Password"` | Master Admin banana / password reset |
| `npm run images -- "folder"` | Images ko WebP ≤200KB mein convert |
| `npm run lint` | TypeScript check |

**Database mein naya column/table:** `src/db/schema.ts` badlein → `npm run db:generate` → `npm run db:migrate`.

---

## 14. Masail aur hal (troubleshooting)

| Masla | Hal |
|---|---|
| Website pe "Application error" / 500 | `DATABASE_URL` check karein (username, password, host, database naam). Vercel pe Remote MySQL "Any host" on hai? |
| `/admin/setup` pe "SETUP_KEY set nahi" | Environment variables mein `SETUP_KEY` dal kar redeploy karein |
| Setup key ghalat | Exact wohi key likhein (capital/small letters) |
| Login nahi ho raha, "bohat zyada koshishen" | 15 minute intezar karein |
| Upload pe error | Image 4MB se chhoti ho; Vercel pe Blob store connect ho; Hostinger pe `UPLOAD_DIR` folder sahi ho |
| Upload ho gayi lekin image nazar nahi aati | Hostinger: `UPLOAD_DIR` deploy folder se bahar ho aur us path pe likhne ki ijazat ho |
| Change website pe nazar nahi aaya | Browser refresh (Ctrl+F5). Product hidden/draft to nahi? Category active hai? |
| Checkout pe payment method nahi | Settings → Payment methods on karein |
| Order pe "itna stock nahi" | Product ka stock barhayein |
| Category delete nahi hoti | Pehle us ke products move karein aur sub-categories hatayein |
| Database import error | Database khali ho (pehle se tables na hon); file `database/pkestore.sql` hi chunein |
| Vercel pe website slow | Function Region database ke qareeb set karein (section 6B) |

---

## 15. Launch se pehle checklist

- [ ] Settings: asli phone, WhatsApp, email, address, bank/JazzCash/Easypaisa details
- [ ] Starter products ki images, prices, stock aur supplier links apne hisaab se
- [ ] About, Contact, policies apni maloomat ke mutabiq edit
- [ ] Coupons review
- [ ] Ek test order (COD) place kar ke poora workflow check, phir test order delete
- [ ] Google Search Console mein website add → `https://pkestore.com/sitemap.xml` submit
- [ ] Google Analytics / Meta Pixel IDs Settings mein
- [ ] Team members ke accounts
- [ ] Hostinger backups on
