"use server";

import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { logActivity, requirePermission } from "@/lib/auth";
import { done, fail, fdBool, fdNum, fdStr, redirectTarget, type ActionState } from "@/lib/action-state";
import { refresh } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";

export async function saveCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("categories.manage");
  const id = fdNum(fd, "id");
  const name = fdStr(fd, "name").slice(0, 120);
  const slug = slugify(fdStr(fd, "slug") || name);
  if (name.length < 2) return fail("Category ka naam likhein.");
  if (!slug) return fail("URL slug likhein.");
  let parentId = fdNum(fd, "parentId");
  if (parentId && parentId === id) return fail("Category khud apni parent nahi ho sakti.");
  if (parentId) {
    const [par] = await db.select({ parentId: categories.parentId }).from(categories).where(eq(categories.id, parentId)).limit(1);
    if (!par) parentId = null;
    else if (par.parentId) return fail("Sirf 2 levels allowed hain: main category → sub-category.");
  }
  if (id && parentId) {
    const [kids] = await db.select({ n: sql<number>`count(*)` }).from(categories).where(eq(categories.parentId, id));
    if (Number(kids.n) > 0) return fail("Is category ki apni sub-categories hain, is liye ye kisi aur ke andar nahi ja sakti.");
  }
  const dup = await db.select({ id: categories.id }).from(categories).where(id ? and(eq(categories.slug, slug), ne(categories.id, id)) : eq(categories.slug, slug)).limit(1);
  if (dup.length) return fail("Ye slug pehle se istemal ho raha hai.");

  const values = {
    name,
    slug,
    parentId: parentId || null,
    description: fdStr(fd, "description").slice(0, 1000) || null,
    content: fdStr(fd, "content") || null,
    image: fdStr(fd, "image") || null,
    icon: fdStr(fd, "icon") || null,
    sortOrder: fdNum(fd, "sortOrder") ?? 0,
    isActive: fdBool(fd, "isActive"),
    showInMenu: fdBool(fd, "showInMenu"),
    seoTitle: fdStr(fd, "seoTitle").slice(0, 191) || null,
    seoDescription: fdStr(fd, "seoDescription").slice(0, 320) || null,
  };
  let newId = id;
  if (id) {
    await db.update(categories).set(values).where(eq(categories.id, id));
    await logActivity(user, "update", "category", id, name);
  } else {
    const [r] = await db.insert(categories).values(values);
    newId = r.insertId;
    await logActivity(user, "create", "category", newId, name);
  }
  refresh("catalog", "sections");
  if (!id) redirect(`/admin/categories/${newId}?created=1`);
  return done("Category save ho gayi.");
}

export async function deleteCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("categories.manage");
  const id = Number(fd.get("id"));
  const [c] = await db.select({ name: categories.name }).from(categories).where(eq(categories.id, id)).limit(1);
  if (!c) return fail("Category nahi mili.");
  const [kids] = await db.select({ n: sql<number>`count(*)` }).from(categories).where(eq(categories.parentId, id));
  if (Number(kids.n) > 0) return fail("Pehle is ki sub-categories delete ya move karein.");
  const [prods] = await db.select({ n: sql<number>`count(*)` }).from(products).where(eq(products.categoryId, id));
  if (Number(prods.n) > 0) return fail(`Is category mein ${prods.n} products hain. Pehle unhein doosri category mein move karein.`);
  await db.delete(categories).where(eq(categories.id, id));
  await logActivity(user, "delete", "category", id, c.name);
  refresh("catalog", "sections");
  const to = redirectTarget(fd);
  if (to) redirect(to);
  return done("Category delete ho gayi.");
}

export async function moveCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission("categories.manage");
  const id = Number(fd.get("id"));
  const dir = fd.get("dir") === "up" ? -1 : 1;
  const [c] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!c) return fail("Category nahi mili.");
  const siblings = await db
    .select({ id: categories.id, sortOrder: categories.sortOrder })
    .from(categories)
    .where(c.parentId ? eq(categories.parentId, c.parentId) : sql`${categories.parentId} is null`)
    .orderBy(categories.sortOrder, categories.id);
  const i = siblings.findIndex((s) => s.id === id);
  const j = i + dir;
  if (j < 0 || j >= siblings.length) return null;
  const order = siblings.map((s) => s.id);
  [order[i], order[j]] = [order[j], order[i]];
  for (let k = 0; k < order.length; k++) await db.update(categories).set({ sortOrder: k }).where(eq(categories.id, order[k]));
  refresh("catalog", "sections");
  return done("Order update ho gaya.");
}
