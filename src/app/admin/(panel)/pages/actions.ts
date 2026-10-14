"use server";

import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { pages, PAGE_TYPES, type PageType } from "@/db/schema";
import { logActivity, requirePermission } from "@/lib/auth";
import { done, fail, fdBool, fdNum, fdStr, redirectTarget, type ActionState } from "@/lib/action-state";
import { refresh } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";

const RESERVED = new Set(["admin", "api", "shop", "category", "product", "cart", "checkout", "order", "search", "track-order", "guides", "sitemap.xml", "robots.txt", "uploads", "seed"]);

export async function savePage(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("content.manage");
  const id = fdNum(fd, "id");
  const type = fdStr(fd, "type") as PageType;
  if (!PAGE_TYPES.includes(type)) return fail("Page type select karein.");
  const title = fdStr(fd, "title").slice(0, 191);
  const slug = slugify(fdStr(fd, "slug") || title);
  if (title.length < 3) return fail("Title likhein.");
  if (!slug) return fail("URL slug likhein.");
  if (type === "PAGE" && RESERVED.has(slug)) return fail(`"${slug}" slug website ke liye reserved hai. Koi aur slug rakhein.`);
  const parentId = type === "CLUSTER" ? fdNum(fd, "parentId") : null;
  if (type === "CLUSTER" && !parentId) return fail("Cluster article ke liye parent pillar guide select karein.");
  if (parentId) {
    const [par] = await db.select({ type: pages.type }).from(pages).where(eq(pages.id, parentId)).limit(1);
    if (par?.type !== "PILLAR") return fail("Parent sirf pillar guide ho sakti hai.");
  }
  const dup = await db
    .select({ id: pages.id })
    .from(pages)
    .where(id ? and(eq(pages.type, type), eq(pages.slug, slug), ne(pages.id, id)) : and(eq(pages.type, type), eq(pages.slug, slug)))
    .limit(1);
  if (dup.length) return fail("Is type mein ye slug pehle se maujood hai.");

  const status = fdStr(fd, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  let publishedAt: Date | null = null;
  if (id) {
    const [old] = await db.select({ publishedAt: pages.publishedAt }).from(pages).where(eq(pages.id, id)).limit(1);
    publishedAt = old?.publishedAt || null;
  }
  if (status === "PUBLISHED" && !publishedAt) publishedAt = new Date();

  const values = {
    type,
    title,
    slug,
    parentId,
    categoryId: type === "PAGE" ? null : fdNum(fd, "categoryId"),
    excerpt: fdStr(fd, "excerpt").slice(0, 500) || null,
    content: fdStr(fd, "content") || null,
    coverImage: fdStr(fd, "coverImage") || null,
    status: status as "PUBLISHED" | "DRAFT",
    showInFooter: type === "PAGE" && fdBool(fd, "showInFooter"),
    authorName: fdStr(fd, "authorName").slice(0, 120) || null,
    publishedAt,
    seoTitle: fdStr(fd, "seoTitle").slice(0, 191) || null,
    seoDescription: fdStr(fd, "seoDescription").slice(0, 320) || null,
  };
  let newId = id;
  if (id) {
    await db.update(pages).set(values).where(eq(pages.id, id));
    await logActivity(user, "update", "page", id, title);
  } else {
    const [r] = await db.insert(pages).values(values);
    newId = r.insertId;
    await logActivity(user, "create", "page", newId, title);
  }
  refresh("content");
  if (!id) redirect(`/admin/pages/${newId}?created=1`);
  return done(status === "PUBLISHED" ? "Save aur publish ho gaya." : "Draft save ho gaya.");
}

export async function deletePage(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("content.manage");
  const id = Number(fd.get("id"));
  const [p] = await db.select({ title: pages.title, type: pages.type }).from(pages).where(eq(pages.id, id)).limit(1);
  if (!p) return fail("Page nahi mila.");
  if (p.type === "PILLAR") {
    const [k] = await db.select({ n: sql<number>`count(*)` }).from(pages).where(eq(pages.parentId, id));
    if (Number(k.n) > 0) return fail(`Is pillar ke ${k.n} cluster articles hain. Pehle unhein delete ya doosre pillar mein move karein.`);
  }
  await db.delete(pages).where(eq(pages.id, id));
  await logActivity(user, "delete", "page", id, p.title);
  refresh("content");
  const to = redirectTarget(fd);
  if (to) redirect(to);
  return done("Delete ho gaya.");
}
