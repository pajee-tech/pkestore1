"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { products, orderItems, type ProductSpec } from "@/db/schema";
import { logActivity, requirePermission } from "@/lib/auth";
import { done, fail, fdBool, fdJson, fdNum, fdStr, redirectTarget, type ActionState } from "@/lib/action-state";
import { refresh } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(3, "Product name kam az kam 3 characters").max(191),
  slug: z.string().min(2).max(191),
  categoryId: z.number({ message: "Category select karein" }).int().positive("Category select karein"),
  price: z.number({ message: "Price likhein" }).min(1, "Price likhein"),
  comparePrice: z.number().min(0).nullable(),
  costPrice: z.number().min(0).nullable(),
  stock: z.number().int().min(0),
  images: z.array(z.string().max(500)).min(1, "Kam az kam ek image lagayein").max(12),
});

export async function saveProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("products.manage");
  const id = fdNum(fd, "id");
  const raw = {
    name: fdStr(fd, "name"),
    slug: slugify(fdStr(fd, "slug") || fdStr(fd, "name")),
    categoryId: fdNum(fd, "categoryId") ?? 0,
    price: fdNum(fd, "price") ?? 0,
    comparePrice: fdNum(fd, "comparePrice"),
    costPrice: fdNum(fd, "costPrice"),
    stock: fdNum(fd, "stock") ?? 0,
    images: fdJson<string[]>(fd, "images", []),
  };
  const p = schema.safeParse(raw);
  if (!p.success) return fail(p.error.issues[0].message);
  const d = p.data;
  if (d.comparePrice && d.comparePrice <= d.price) d.comparePrice = null;

  const dup = await db.select({ id: products.id }).from(products).where(id ? and(eq(products.slug, d.slug), ne(products.id, id)) : eq(products.slug, d.slug)).limit(1);
  if (dup.length) return fail("Ye URL slug pehle se kisi aur product ka hai. Thora badal dein.");

  const values = {
    ...d,
    sku: fdStr(fd, "sku") || null,
    shortDescription: fdStr(fd, "shortDescription").slice(0, 500) || null,
    description: fdStr(fd, "description") || null,
    features: fdJson<string[]>(fd, "features", []).slice(0, 20),
    specs: fdJson<ProductSpec[]>(fd, "specs", []).slice(0, 40),
    badge: fdStr(fd, "badge").slice(0, 40) || null,
    supplierName: fdStr(fd, "supplierName") || null,
    supplierUrl: fdStr(fd, "supplierUrl") || null,
    supplierSku: fdStr(fd, "supplierSku") || null,
    deliveryDays: fdStr(fd, "deliveryDays") || null,
    rating: Math.min(Math.max(fdNum(fd, "rating") ?? 4.5, 0), 5),
    reviewCount: Math.max(fdNum(fd, "reviewCount") ?? 0, 0),
    isFeatured: fdBool(fd, "isFeatured"),
    isActive: fdBool(fd, "isActive"),
    sortOrder: fdNum(fd, "sortOrder") ?? 0,
    seoTitle: fdStr(fd, "seoTitle").slice(0, 191) || null,
    seoDescription: fdStr(fd, "seoDescription").slice(0, 320) || null,
  };
  if (values.supplierUrl && !/^https?:\/\//.test(values.supplierUrl)) return fail("Supplier URL https:// se shuru ho.");

  let newId = id;
  if (id) {
    await db.update(products).set(values).where(eq(products.id, id));
    await logActivity(user, "update", "product", id, d.name);
  } else {
    const [r] = await db.insert(products).values(values);
    newId = r.insertId;
    await logActivity(user, "create", "product", newId, d.name);
  }
  refresh("catalog");
  if (!id) redirect(`/admin/products/${newId}?created=1`);
  return done("Product save ho gaya.");
}

export async function deleteProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("products.manage");
  const id = Number(fd.get("id"));
  const [p] = await db.select({ name: products.name }).from(products).where(eq(products.id, id)).limit(1);
  if (!p) return fail("Product nahi mila.");
  const used = await db.select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.productId, id)).limit(1);
  if (used.length) {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
    refresh("catalog");
    await logActivity(user, "hide", "product", id, p.name);
    return done("Is product ke orders hain, is liye delete ke bajaye hide (inactive) kar diya gaya.");
  }
  await db.delete(products).where(eq(products.id, id));
  await logActivity(user, "delete", "product", id, p.name);
  refresh("catalog");
  const to = redirectTarget(fd);
  if (to) redirect(to);
  return done("Product delete ho gaya.");
}

export async function toggleProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("products.manage");
  const id = Number(fd.get("id"));
  const [p] = await db.select({ isActive: products.isActive, name: products.name }).from(products).where(eq(products.id, id)).limit(1);
  if (!p) return fail("Product nahi mila.");
  await db.update(products).set({ isActive: !p.isActive }).where(eq(products.id, id));
  await logActivity(user, p.isActive ? "hide" : "show", "product", id, p.name);
  refresh("catalog");
  return done(p.isActive ? "Product website se hide ho gaya." : "Product website pe live ho gaya.");
}

export async function duplicateProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("products.manage");
  const id = Number(fd.get("id"));
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!p) return fail("Product nahi mila.");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, createdAt, updatedAt, ...rest } = p;
  const slug = `${p.slug}-copy-${Date.now().toString(36).slice(-4)}`;
  const [r] = await db.insert(products).values({ ...rest, name: `${p.name} (copy)`, slug, isActive: false, soldCount: 0 });
  await logActivity(user, "duplicate", "product", r.insertId, p.name);
  refresh("catalog");
  redirect(`/admin/products/${r.insertId}`);
}
