import "server-only";
import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, inArray, like, or, sql, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  products,
  pages,
  sections,
  settings,
  menuItems,
  type Category,
  type Product,
  type Page,
  type MenuItem,
} from "@/db/schema";
import { DEFAULT_SETTINGS, type SiteSettings } from "./settings-defaults";
import { TAGS } from "./cache-tags";

const HOUR = 3600;

/* ───────────── Settings ───────────── */

export const getSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const [row] = await db.select().from(settings).where(eq(settings.key, "site")).limit(1);
      const saved = (row?.value || {}) as Partial<SiteSettings>;
      return { ...DEFAULT_SETTINGS, ...saved, social: { ...DEFAULT_SETTINGS.social, ...(saved.social || {}) } };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  ["site-settings"],
  { tags: [TAGS.settings], revalidate: HOUR },
);

/* ───────────── Categories ───────────── */

export type CategoryNode = Category & { children: Category[]; productCount: number };

export const getCategoryTree = unstable_cache(
  async (): Promise<CategoryNode[]> => {
    const all = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
    const counts = await db
      .select({ categoryId: products.categoryId, c: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.isActive, true))
      .groupBy(products.categoryId);
    const countMap = new Map(counts.map((r) => [r.categoryId, Number(r.c)]));
    const roots = all.filter((c) => !c.parentId);
    return roots.map((r) => {
      const children = all.filter((c) => c.parentId === r.id);
      const productCount = [r.id, ...children.map((c) => c.id)].reduce((s, id) => s + (countMap.get(id) || 0), 0);
      return { ...r, children, productCount };
    });
  },
  ["category-tree"],
  { tags: [TAGS.catalog], revalidate: HOUR },
);

export type MegaMenuCategory = CategoryNode & { topProducts: Pick<Product, "id" | "name" | "slug" | "images" | "price">[] };

export const getMegaMenu = unstable_cache(
  async (): Promise<MegaMenuCategory[]> => {
    const tree = (await getCategoryTree()).filter((c) => c.showInMenu);
    const out: MegaMenuCategory[] = [];
    for (const c of tree) {
      const ids = [c.id, ...c.children.map((x) => x.id)];
      const top = await db
        .select({ id: products.id, name: products.name, slug: products.slug, images: products.images, price: products.price })
        .from(products)
        .where(and(eq(products.isActive, true), inArray(products.categoryId, ids)))
        .orderBy(desc(products.isFeatured), desc(products.soldCount))
        .limit(2);
      out.push({ ...c, topProducts: top });
    }
    return out;
  },
  ["mega-menu"],
  { tags: [TAGS.catalog], revalidate: HOUR },
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    const [cat] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, slug), eq(categories.isActive, true)))
      .limit(1);
    if (!cat) return null;
    const children = await db
      .select()
      .from(categories)
      .where(and(eq(categories.parentId, cat.id), eq(categories.isActive, true)))
      .orderBy(asc(categories.sortOrder));
    const parent = cat.parentId
      ? (await db.select().from(categories).where(eq(categories.id, cat.parentId)).limit(1))[0] || null
      : null;
    const siblings = parent
      ? await db
          .select()
          .from(categories)
          .where(and(eq(categories.parentId, parent.id), eq(categories.isActive, true)))
          .orderBy(asc(categories.sortOrder))
      : [];
    return { category: cat, children, parent, siblings };
  },
  ["category-by-slug"],
  { tags: [TAGS.catalog], revalidate: HOUR },
);

/* ───────────── Products ───────────── */

export type ProductCard = Pick<
  Product,
  "id" | "name" | "slug" | "images" | "price" | "comparePrice" | "rating" | "reviewCount" | "badge" | "stock" | "categoryId"
>;

const cardFields = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  images: products.images,
  price: products.price,
  comparePrice: products.comparePrice,
  rating: products.rating,
  reviewCount: products.reviewCount,
  badge: products.badge,
  stock: products.stock,
  categoryId: products.categoryId,
};

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc" | "popular";

function sortOrder(sort: ProductSort) {
  switch (sort) {
    case "newest":
      return [desc(products.createdAt)];
    case "price-asc":
      return [asc(products.price)];
    case "price-desc":
      return [desc(products.price)];
    case "popular":
      return [desc(products.soldCount)];
    default:
      return [desc(products.isFeatured), asc(products.sortOrder), desc(products.soldCount)];
  }
}

export const getProductsInCategories = unstable_cache(
  async (categoryIds: number[], sort: ProductSort = "featured"): Promise<ProductCard[]> => {
    if (!categoryIds.length) return [];
    return db
      .select(cardFields)
      .from(products)
      .where(and(eq(products.isActive, true), inArray(products.categoryId, categoryIds)))
      .orderBy(...sortOrder(sort));
  },
  ["products-in-categories"],
  { tags: [TAGS.catalog], revalidate: HOUR },
);

export const getProductList = unstable_cache(
  async (opts: { source: "featured" | "latest" | "popular" | "sale" | "category"; categoryId?: number; limit?: number }) => {
    const limit = Math.min(opts.limit || 8, 24);
    const where = [eq(products.isActive, true)];
    if (opts.source === "featured") where.push(eq(products.isFeatured, true));
    if (opts.source === "sale") where.push(sql`${products.comparePrice} > ${products.price}`);
    if (opts.source === "category" && opts.categoryId) {
      const childIds = (await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, opts.categoryId))).map((r) => r.id);
      where.push(inArray(products.categoryId, [opts.categoryId, ...childIds]));
    }
    const order =
      opts.source === "latest"
        ? [desc(products.createdAt)]
        : opts.source === "popular"
          ? [desc(products.soldCount)]
          : opts.source === "sale"
            ? [desc(sql`(${products.comparePrice} - ${products.price}) / ${products.comparePrice}`)]
            : sortOrder("featured");
    return db.select(cardFields).from(products).where(and(...where)).orderBy(...order).limit(limit);
  },
  ["product-list"],
  { tags: [TAGS.catalog], revalidate: HOUR },
);

export const getAllActiveProducts = unstable_cache(
  async (sort: ProductSort = "featured"): Promise<ProductCard[]> =>
    db.select(cardFields).from(products).where(eq(products.isActive, true)).orderBy(...sortOrder(sort)),
  ["all-products"],
  { tags: [TAGS.catalog], revalidate: HOUR },
);

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const [p] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1);
    if (!p) return null;
    const [cat] = await db.select().from(categories).where(eq(categories.id, p.categoryId)).limit(1);
    const parent = cat?.parentId ? (await db.select().from(categories).where(eq(categories.id, cat.parentId)).limit(1))[0] : null;
    const related = await db
      .select(cardFields)
      .from(products)
      .where(and(eq(products.isActive, true), ne(products.id, p.id), eq(products.categoryId, p.categoryId)))
      .orderBy(desc(products.soldCount))
      .limit(8);
    let more = related;
    if (related.length < 4 && parent) {
      const sib = (await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, parent.id))).map((x) => x.id);
      more = await db
        .select(cardFields)
        .from(products)
        .where(and(eq(products.isActive, true), ne(products.id, p.id), inArray(products.categoryId, [parent.id, ...sib])))
        .orderBy(desc(products.soldCount))
        .limit(8);
    }
    // supplier/cost info storefront pe kabhi nahi jati
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { costPrice, supplierName, supplierUrl, supplierSku, ...publicProduct } = p;
    return { product: publicProduct, category: cat || null, parent: parent || null, related: more };
  },
  ["product-by-slug"],
  { tags: [TAGS.catalog], revalidate: HOUR },
);

export async function searchProducts(q: string, limit = 40): Promise<ProductCard[]> {
  const term = q.trim().slice(0, 80);
  if (term.length < 2) return [];
  const pattern = `%${term.replace(/[%_\\]/g, "\\$&")}%`;
  return db
    .select(cardFields)
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        or(like(products.name, pattern), like(products.shortDescription, pattern), like(products.sku, pattern)),
      ),
    )
    .orderBy(desc(products.soldCount))
    .limit(limit);
}

export async function getProductsByIds(ids: number[]) {
  if (!ids.length) return [];
  return db
    .select(cardFields)
    .from(products)
    .where(and(eq(products.isActive, true), inArray(products.id, ids)));
}

/* ───────────── Content ───────────── */

export const getPage = unstable_cache(
  async (type: Page["type"], slug: string) => {
    const [p] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.type, type), eq(pages.slug, slug), eq(pages.status, "PUBLISHED")))
      .limit(1);
    return p || null;
  },
  ["page"],
  { tags: [TAGS.content], revalidate: HOUR },
);

export const getPillarWithClusters = unstable_cache(
  async (slug: string) => {
    const pillar = await getPage("PILLAR", slug);
    if (!pillar) return null;
    const clusters = await db
      .select({ id: pages.id, title: pages.title, slug: pages.slug, excerpt: pages.excerpt, coverImage: pages.coverImage, publishedAt: pages.publishedAt })
      .from(pages)
      .where(and(eq(pages.type, "CLUSTER"), eq(pages.parentId, pillar.id), eq(pages.status, "PUBLISHED")))
      .orderBy(asc(pages.publishedAt));
    return { pillar, clusters };
  },
  ["pillar-with-clusters"],
  { tags: [TAGS.content], revalidate: HOUR },
);

export const getClusterPage = unstable_cache(
  async (pillarSlug: string, slug: string) => {
    const data = await getPillarWithClusters(pillarSlug);
    if (!data) return null;
    const [cluster] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.type, "CLUSTER"), eq(pages.slug, slug), eq(pages.parentId, data.pillar.id), eq(pages.status, "PUBLISHED")))
      .limit(1);
    if (!cluster) return null;
    return { cluster, pillar: data.pillar, siblings: data.clusters.filter((c) => c.id !== cluster.id) };
  },
  ["cluster-page"],
  { tags: [TAGS.content], revalidate: HOUR },
);

export const getGuides = unstable_cache(
  async () => {
    const pillars = await db
      .select()
      .from(pages)
      .where(and(eq(pages.type, "PILLAR"), eq(pages.status, "PUBLISHED")))
      .orderBy(desc(pages.publishedAt));
    const clusters = await db
      .select({ id: pages.id, parentId: pages.parentId, title: pages.title, slug: pages.slug, excerpt: pages.excerpt, coverImage: pages.coverImage, publishedAt: pages.publishedAt })
      .from(pages)
      .where(and(eq(pages.type, "CLUSTER"), eq(pages.status, "PUBLISHED")))
      .orderBy(desc(pages.publishedAt));
    return pillars.map((p) => ({ ...p, clusters: clusters.filter((c) => c.parentId === p.id) }));
  },
  ["guides"],
  { tags: [TAGS.content], revalidate: HOUR },
);

export const getLatestGuides = unstable_cache(
  async (limit = 3) => {
    const all = await db
      .select({ id: pages.id, type: pages.type, parentId: pages.parentId, title: pages.title, slug: pages.slug, excerpt: pages.excerpt, coverImage: pages.coverImage, publishedAt: pages.publishedAt })
      .from(pages)
      .where(and(inArray(pages.type, ["PILLAR", "CLUSTER"]), eq(pages.status, "PUBLISHED")))
      .orderBy(desc(pages.publishedAt))
      .limit(limit);
    const parentIds = all.filter((x) => x.parentId).map((x) => x.parentId!) as number[];
    const parents = parentIds.length
      ? await db.select({ id: pages.id, slug: pages.slug }).from(pages).where(inArray(pages.id, parentIds))
      : [];
    return all.map((g) => ({
      ...g,
      href: g.type === "PILLAR" ? `/guides/${g.slug}` : `/guides/${parents.find((p) => p.id === g.parentId)?.slug || "all"}/${g.slug}`,
    }));
  },
  ["latest-guides"],
  { tags: [TAGS.content], revalidate: HOUR },
);

export const getFooterPages = unstable_cache(
  async () =>
    db
      .select({ title: pages.title, slug: pages.slug })
      .from(pages)
      .where(and(eq(pages.type, "PAGE"), eq(pages.status, "PUBLISHED"), eq(pages.showInFooter, true)))
      .orderBy(asc(pages.title)),
  ["footer-pages"],
  { tags: [TAGS.content], revalidate: HOUR },
);

/* ───────────── Homepage & menu ───────────── */

export const getHomeSections = unstable_cache(
  async () => db.select().from(sections).where(eq(sections.isActive, true)).orderBy(asc(sections.sortOrder)),
  ["home-sections"],
  { tags: [TAGS.sections], revalidate: HOUR },
);

export const getMenuItems = unstable_cache(
  async (): Promise<Record<MenuItem["location"], MenuItem[]>> => {
    const rows = await db.select().from(menuItems).where(eq(menuItems.isActive, true)).orderBy(asc(menuItems.sortOrder));
    return {
      HEADER: rows.filter((r) => r.location === "HEADER"),
      FOOTER_SHOP: rows.filter((r) => r.location === "FOOTER_SHOP"),
      FOOTER_HELP: rows.filter((r) => r.location === "FOOTER_HELP"),
      TOPBAR: rows.filter((r) => r.location === "TOPBAR"),
    };
  },
  ["menu-items"],
  { tags: [TAGS.menu], revalidate: HOUR },
);

/* ───────────── Sitemap ───────────── */

export async function getSitemapData() {
  const [cats, prods, pgs] = await Promise.all([
    db.select({ slug: categories.slug, updatedAt: categories.updatedAt }).from(categories).where(eq(categories.isActive, true)),
    db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.isActive, true)),
    db
      .select({ id: pages.id, type: pages.type, slug: pages.slug, parentId: pages.parentId, updatedAt: pages.updatedAt })
      .from(pages)
      .where(eq(pages.status, "PUBLISHED")),
  ]);
  return { cats, prods, pgs };
}


