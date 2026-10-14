# PKeStore

Pakistan ke liye dropshipping e-commerce store — Next.js 16, Tailwind CSS, MySQL (Hostinger), mukammal admin dashboard ke saath.

- Storefront: mega menu, 10 categories / 30 sub-categories / 40 products, cart, checkout (COD, JazzCash, Easypaisa, Bank), order tracking, pillar & cluster guides, SEO
- Dashboard (`/admin`): products, categories, homepage sections, pages/guides, menus, media (auto WebP ≤200KB), orders, coupons, messages, users & roles, activity log, settings
- Security: bcrypt, signed sessions, role permissions, rate limiting, CSP headers, sanitized content

**Poori guide (deployment + dashboard + security): [docs/GUIDE.md](docs/GUIDE.md)**

## Quick start

```bash
npm install
cp .env.example .env    # DATABASE_URL, AUTH_SECRET, SETUP_KEY bharein
npm run db:setup        # ya database/pkestore.sql phpMyAdmin mein import karein
npm run dev
```

Phir `http://localhost:3000/admin/setup` pe Master Admin banayein.
