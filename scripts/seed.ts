import "dotenv/config";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { DEFAULT_SETTINGS } from "../src/lib/settings-defaults";
import { CATEGORIES, PRODUCTS } from "./seed-data";
import { STATIC_PAGES, GUIDES, HOME_SECTIONS, MENU, COUPONS } from "./seed-content";

const { categories, products, pages, sections, menuItems, settings, coupons } = schema;

async function main() {
  const force = process.argv.includes("--force");
  const conn = await mysql.createConnection({
    uri: process.env.DATABASE_URL!,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  const db = drizzle(conn, { schema, mode: "default" });

  const [{ n }] = (await db.select({ n: sql<number>`count(*)` }).from(products)) as { n: number }[];
  if (Number(n) > 0 && !force) {
    console.log("ℹ️  Database mein pehle se products hain — seed skip. (Dobara karne ke liye: npm run db:seed -- --force)");
    await conn.end();
    return;
  }
  if (force) {
    for (const t of ["order_items", "orders", "products", "categories", "pages", "sections", "menu_items", "coupons", "settings"]) {
      await conn.query(`DELETE FROM \`${t}\``);
    }
  }

  // Categories
  const catIds = new Map<string, number>();
  let order = 0;
  for (const c of CATEGORIES) {
    const [res] = await db.insert(categories).values({
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      image: `/seed/categories/${c.slug}.webp`,
      sortOrder: order++,
      seoTitle: `${c.name} Online in Pakistan – Best Prices | PKeStore`,
      seoDescription: `${c.description} Cash on Delivery all over Pakistan.`.slice(0, 300),
      content: `## ${c.name} online in Pakistan\n\n${c.description} PKeStore pe har product dispatch se pehle check hota hai, aur aap Cash on Delivery ke sath parcel khol kar dekh sakte hain.\n\n### Is category mein\n${c.children.map((ch) => `- [${ch.name}](/category/${ch.slug}) — ${ch.description}`).join("\n")}\n\n### Delivery\nKarachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar aur poore Pakistan mein 3–5 din mein delivery.`,
    });
    const id = res.insertId;
    catIds.set(c.slug, id);
    let co = 0;
    for (const ch of c.children) {
      const [r2] = await db.insert(categories).values({
        parentId: id,
        name: ch.name,
        slug: ch.slug,
        description: ch.description,
        image: `/seed/categories/${ch.slug}.webp`,
        sortOrder: co++,
        seoTitle: `${ch.name} Price in Pakistan | PKeStore`,
        seoDescription: `${ch.description} Best prices, Cash on Delivery.`,
      });
      catIds.set(ch.slug, r2.insertId);
    }
  }
  console.log(`✅ ${catIds.size} categories`);

  // Products
  let po = 0;
  for (const p of PRODUCTS) {
    const catId = catIds.get(p.category);
    if (!catId) throw new Error("Unknown category " + p.category);
    await db.insert(products).values({
      categoryId: catId,
      name: p.name,
      slug: p.slug,
      sku: "PK-" + String(1001 + po),
      shortDescription: p.short,
      description: p.description,
      price: p.price,
      comparePrice: p.comparePrice,
      costPrice: p.costPrice,
      stock: 50 + ((po * 7) % 60),
      images: [`/seed/products/${p.slug}-1.webp`, `/seed/products/${p.slug}-2.webp`],
      features: p.features,
      specs: p.specs.map(([label, value]) => ({ label, value })),
      badge: p.badge || null,
      supplierName: p.supplier,
      supplierUrl: null,
      deliveryDays: "3–5 working days",
      rating: p.rating,
      reviewCount: p.reviews,
      soldCount: p.sold,
      isFeatured: !!p.featured,
      sortOrder: po++,
      seoTitle: `${p.name} Price in Pakistan`.slice(0, 180),
      seoDescription: p.short.slice(0, 300),
      createdAt: new Date(Date.now() - (PRODUCTS.length - po) * 36e5 * 7),
    });
  }
  console.log(`✅ ${PRODUCTS.length} products`);

  // Pages
  const now = new Date();
  for (const p of STATIC_PAGES) {
    await db.insert(pages).values({ type: "PAGE", title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, status: "PUBLISHED", showInFooter: p.footer, publishedAt: now });
  }
  let gi = 0;
  for (const g of GUIDES) {
    const pub = new Date(now.getTime() - (10 - gi++) * 864e5);
    const [r] = await db.insert(pages).values({
      type: "PILLAR",
      title: g.title,
      slug: g.slug,
      excerpt: g.excerpt,
      content: g.content,
      coverImage: g.cover,
      categoryId: g.category ? catIds.get(g.category) : null,
      status: "PUBLISHED",
      authorName: "PKeStore Team",
      publishedAt: pub,
      seoTitle: g.title.slice(0, 180),
      seoDescription: g.excerpt,
    });
    let ci = 1;
    for (const c of g.clusters) {
      await db.insert(pages).values({
        type: "CLUSTER",
        parentId: r.insertId,
        title: c.title,
        slug: c.slug,
        excerpt: c.excerpt,
        content: c.content,
        coverImage: c.cover,
        categoryId: g.category ? catIds.get(g.category) : null,
        status: "PUBLISHED",
        authorName: "PKeStore Team",
        publishedAt: new Date(pub.getTime() + ci++ * 36e5),
        seoTitle: c.title.slice(0, 180),
        seoDescription: c.excerpt,
      });
    }
  }
  console.log(`✅ pages, pillar & cluster guides`);

  // Homepage sections
  const secs = HOME_SECTIONS((slug) => catIds.get(slug) || 0);
  let so = 0;
  for (const s of secs) await db.insert(sections).values({ type: s.type as schema.SectionType, title: s.title, subtitle: s.subtitle, config: s.config, sortOrder: so++ });
  console.log(`✅ ${secs.length} homepage sections`);

  let mo = 0;
  for (const m of MENU) await db.insert(menuItems).values({ location: m.location, label: m.label, url: m.url, sortOrder: mo++ });
  for (const c of COUPONS) await db.insert(coupons).values({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder });
  await db.insert(settings).values({ key: "site", value: DEFAULT_SETTINGS }).onDuplicateKeyUpdate({ set: { value: DEFAULT_SETTINGS } });
  console.log("✅ menus, coupons, settings");
  console.log("\n🎉 Seed complete. Ab /admin/setup pe ja kar Master Admin account banayein.");
  await conn.end();
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
