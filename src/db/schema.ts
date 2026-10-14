import {
  mysqlTable,
  int,
  varchar,
  text,
  mediumtext,
  boolean,
  datetime,
  decimal,
  mysqlEnum,
  customType,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/** JSON column jo MySQL aur MariaDB (Hostinger) dono pe sahi parse hota hai. */
const json = <T>(name: string) =>
  customType<{ data: T; driverData: string }>({
    dataType() {
      return "json";
    },
    toDriver(value: T) {
      return JSON.stringify(value);
    },
    fromDriver(value: unknown) {
      if (typeof value === "string") {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      }
      return value as T;
    },
  })(name);

const timestamps = {
  createdAt: datetime("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
};

const seo = {
  seoTitle: varchar("seo_title", { length: 191 }),
  seoDescription: varchar("seo_description", { length: 320 }),
};

export const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "MARKETER", "ORDER_MANAGER"] as const;
export type Role = (typeof ROLES)[number];

/* ───────────────────────── Users & security ───────────────────────── */

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 191 }).notNull(),
    passwordHash: varchar("password_hash", { length: 191 }).notNull(),
    role: mysqlEnum("role", ROLES).notNull().default("EDITOR"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: datetime("last_login_at", { mode: "date" }),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("user_id").notNull(),
    expiresAt: datetime("expires_at", { mode: "date" }).notNull(),
    ip: varchar("ip", { length: 64 }),
    userAgent: varchar("user_agent", { length: 255 }),
    createdAt: datetime("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const rateLimits = mysqlTable("rate_limits", {
  key: varchar("key", { length: 191 }).primaryKey(),
  count: int("count").notNull().default(0),
  resetAt: datetime("reset_at", { mode: "date" }).notNull(),
});

export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id"),
    userName: varchar("user_name", { length: 120 }),
    action: varchar("action", { length: 60 }).notNull(),
    entity: varchar("entity", { length: 60 }).notNull(),
    entityId: varchar("entity_id", { length: 60 }),
    details: varchar("details", { length: 500 }),
    ip: varchar("ip", { length: 64 }),
    createdAt: datetime("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("activity_created_idx").on(t.createdAt)],
);

/* ───────────────────────── Catalog ───────────────────────── */

export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    parentId: int("parent_id"),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    description: text("description"),
    content: mediumtext("content"),
    image: varchar("image", { length: 500 }),
    bannerImage: varchar("banner_image", { length: 500 }),
    icon: varchar("icon", { length: 60 }),
    sortOrder: int("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    showInMenu: boolean("show_in_menu").notNull().default(true),
    ...seo,
    ...timestamps,
  },
  (t) => [uniqueIndex("categories_slug_uq").on(t.slug), index("categories_parent_idx").on(t.parentId)],
);

export type ProductSpec = { label: string; value: string };

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("category_id").notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull(),
    sku: varchar("sku", { length: 80 }),
    shortDescription: varchar("short_description", { length: 500 }),
    description: mediumtext("description"),
    price: decimal("price", { precision: 10, scale: 0, mode: "number" }).notNull(),
    comparePrice: decimal("compare_price", { precision: 10, scale: 0, mode: "number" }),
    costPrice: decimal("cost_price", { precision: 10, scale: 0, mode: "number" }),
    stock: int("stock").notNull().default(100),
    images: json<string[]>("images").notNull(),
    features: json<string[]>("features"),
    specs: json<ProductSpec[]>("specs"),
    badge: varchar("badge", { length: 40 }),
    supplierName: varchar("supplier_name", { length: 120 }),
    supplierUrl: varchar("supplier_url", { length: 500 }),
    supplierSku: varchar("supplier_sku", { length: 120 }),
    deliveryDays: varchar("delivery_days", { length: 40 }),
    rating: decimal("rating", { precision: 2, scale: 1, mode: "number" }).notNull().default(4.5),
    reviewCount: int("review_count").notNull().default(0),
    soldCount: int("sold_count").notNull().default(0),
    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: int("sort_order").notNull().default(0),
    ...seo,
    ...timestamps,
  },
  (t) => [
    uniqueIndex("products_slug_uq").on(t.slug),
    index("products_category_idx").on(t.categoryId),
    index("products_active_idx").on(t.isActive, t.isFeatured),
  ],
);

/* ───────────────────────── Content (pages, pillar, cluster) ───────────────────────── */

export const PAGE_TYPES = ["PAGE", "PILLAR", "CLUSTER"] as const;
export type PageType = (typeof PAGE_TYPES)[number];

export const pages = mysqlTable(
  "pages",
  {
    id: int("id").autoincrement().primaryKey(),
    type: mysqlEnum("type", PAGE_TYPES).notNull().default("PAGE"),
    parentId: int("parent_id"), // cluster -> pillar
    categoryId: int("category_id"), // optional related category (shows products)
    title: varchar("title", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull(),
    excerpt: varchar("excerpt", { length: 500 }),
    content: mediumtext("content"),
    coverImage: varchar("cover_image", { length: 500 }),
    status: mysqlEnum("status", ["DRAFT", "PUBLISHED"]).notNull().default("DRAFT"),
    showInFooter: boolean("show_in_footer").notNull().default(false),
    authorName: varchar("author_name", { length: 120 }),
    publishedAt: datetime("published_at", { mode: "date" }),
    ...seo,
    ...timestamps,
  },
  (t) => [uniqueIndex("pages_type_slug_uq").on(t.type, t.slug), index("pages_parent_idx").on(t.parentId)],
);

/* ───────────────────────── Homepage sections, menus, settings ───────────────────────── */

export const SECTION_TYPES = [
  "hero",
  "usp",
  "categories",
  "products",
  "banner",
  "dual_banner",
  "testimonials",
  "guides",
  "newsletter",
  "richtext",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const sections = mysqlTable("sections", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 40 }).$type<SectionType>().notNull(),
  title: varchar("title", { length: 191 }),
  subtitle: varchar("subtitle", { length: 320 }),
  config: json<Record<string, unknown>>("config").notNull(),
  sortOrder: int("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const MENU_LOCATIONS = ["HEADER", "FOOTER_SHOP", "FOOTER_HELP", "TOPBAR"] as const;

export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  location: mysqlEnum("location", MENU_LOCATIONS).notNull(),
  label: varchar("label", { length: 80 }).notNull(),
  url: varchar("url", { length: 300 }).notNull(),
  sortOrder: int("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  openInNewTab: boolean("open_new_tab").notNull().default(false),
});

export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: json<unknown>("value").notNull(),
  updatedAt: datetime("updated_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export const media = mysqlTable("media", {
  id: int("id").autoincrement().primaryKey(),
  url: varchar("url", { length: 500 }).notNull(),
  filename: varchar("filename", { length: 191 }).notNull(),
  alt: varchar("alt", { length: 191 }),
  size: int("size").notNull(),
  width: int("width"),
  height: int("height"),
  uploadedBy: int("uploaded_by"),
  createdAt: datetime("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

/* ───────────────────────── Orders & marketing ───────────────────────── */

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "ORDERED_FROM_SUPPLIER",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["COD", "BANK", "JAZZCASH", "EASYPAISA"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    orderNumber: varchar("order_number", { length: 30 }).notNull(),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    email: varchar("email", { length: 191 }),
    city: varchar("city", { length: 80 }).notNull(),
    address: varchar("address", { length: 500 }).notNull(),
    notes: varchar("notes", { length: 500 }),
    subtotal: decimal("subtotal", { precision: 10, scale: 0, mode: "number" }).notNull(),
    shippingFee: decimal("shipping_fee", { precision: 10, scale: 0, mode: "number" }).notNull(),
    discount: decimal("discount", { precision: 10, scale: 0, mode: "number" }).notNull().default(0),
    total: decimal("total", { precision: 10, scale: 0, mode: "number" }).notNull(),
    couponCode: varchar("coupon_code", { length: 40 }),
    paymentMethod: mysqlEnum("payment_method", PAYMENT_METHODS).notNull().default("COD"),
    paymentStatus: mysqlEnum("payment_status", ["UNPAID", "PENDING_VERIFICATION", "PAID", "REFUNDED"])
      .notNull()
      .default("UNPAID"),
    transactionId: varchar("transaction_id", { length: 80 }),
    paymentProof: varchar("payment_proof", { length: 500 }),
    status: mysqlEnum("status", ORDER_STATUSES).notNull().default("PENDING"),
    courier: varchar("courier", { length: 60 }),
    trackingNumber: varchar("tracking_number", { length: 80 }),
    adminNotes: text("admin_notes"),
    ip: varchar("ip", { length: 64 }),
    ...timestamps,
  },
  (t) => [uniqueIndex("orders_number_uq").on(t.orderNumber), index("orders_status_idx").on(t.status), index("orders_phone_idx").on(t.phone)],
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("order_id").notNull(),
    productId: int("product_id"),
    name: varchar("name", { length: 191 }).notNull(),
    image: varchar("image", { length: 500 }),
    price: decimal("price", { precision: 10, scale: 0, mode: "number" }).notNull(),
    quantity: int("quantity").notNull(),
    supplierUrl: varchar("supplier_url", { length: 500 }),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const coupons = mysqlTable(
  "coupons",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 40 }).notNull(),
    type: mysqlEnum("type", ["PERCENT", "FIXED", "FREE_SHIPPING"]).notNull().default("PERCENT"),
    value: decimal("value", { precision: 10, scale: 0, mode: "number" }).notNull().default(0),
    minOrder: decimal("min_order", { precision: 10, scale: 0, mode: "number" }).notNull().default(0),
    maxUses: int("max_uses"),
    usedCount: int("used_count").notNull().default(0),
    expiresAt: datetime("expires_at", { mode: "date" }),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [uniqueIndex("coupons_code_uq").on(t.code)],
);

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 191 }),
  phone: varchar("phone", { length: 30 }),
  subject: varchar("subject", { length: 191 }),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: datetime("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const subscribers = mysqlTable(
  "subscribers",
  {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 191 }).notNull(),
    createdAt: datetime("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [uniqueIndex("subscribers_email_uq").on(t.email)],
);

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
