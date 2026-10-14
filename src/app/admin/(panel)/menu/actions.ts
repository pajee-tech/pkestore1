"use server";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { menuItems, MENU_LOCATIONS } from "@/db/schema";
import { logActivity, requirePermission } from "@/lib/auth";
import { done, fail, fdBool, fdNum, fdStr, type ActionState } from "@/lib/action-state";
import { refresh } from "@/lib/revalidate";
import { isSafeUrl } from "@/lib/utils";

export async function saveMenuItem(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("menu.manage");
  const id = fdNum(fd, "id");
  const location = fdStr(fd, "location") as (typeof MENU_LOCATIONS)[number];
  if (!MENU_LOCATIONS.includes(location)) return fail("Location select karein.");
  const label = fdStr(fd, "label").slice(0, 80);
  const url = fdStr(fd, "url").slice(0, 300);
  if (!label) return fail("Label likhein.");
  if (!url || !isSafeUrl(url)) return fail("Link / se ya https:// se shuru ho.");
  const values = { location, label, url, isActive: fdBool(fd, "isActive"), openInNewTab: fdBool(fd, "openInNewTab") };
  if (id) await db.update(menuItems).set(values).where(eq(menuItems.id, id));
  else {
    const last = await db.select({ s: menuItems.sortOrder }).from(menuItems).where(eq(menuItems.location, location)).orderBy(asc(menuItems.sortOrder));
    await db.insert(menuItems).values({ ...values, sortOrder: (last.at(-1)?.s ?? 0) + 1 });
  }
  await logActivity(user, id ? "update" : "create", "menu", id, label);
  refresh("menu");
  return done("Menu update ho gaya.");
}

export async function deleteMenuItem(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("menu.manage");
  await db.delete(menuItems).where(eq(menuItems.id, Number(fd.get("id"))));
  await logActivity(user, "delete", "menu", Number(fd.get("id")));
  refresh("menu");
  return done("Link hata diya gaya.");
}

export async function moveMenuItem(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission("menu.manage");
  const id = Number(fd.get("id"));
  const [m] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!m) return null;
  const all = (await db.select({ id: menuItems.id }).from(menuItems).where(and(eq(menuItems.location, m.location))).orderBy(asc(menuItems.sortOrder), asc(menuItems.id))).map((x) => x.id);
  const i = all.indexOf(id);
  const j = i + (fd.get("dir") === "up" ? -1 : 1);
  if (j < 0 || j >= all.length) return null;
  [all[i], all[j]] = [all[j], all[i]];
  for (let k = 0; k < all.length; k++) await db.update(menuItems).set({ sortOrder: k }).where(eq(menuItems.id, all[k]));
  refresh("menu");
  return done("Order update ho gaya.");
}
