"use server";

import { redirect } from "next/navigation";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { sections, SECTION_TYPES, type SectionType } from "@/db/schema";
import { logActivity, requirePermission } from "@/lib/auth";
import { done, fail, fdBool, fdJson, fdStr, redirectTarget, type ActionState } from "@/lib/action-state";
import { refresh } from "@/lib/revalidate";
import { SECTION_DEFS } from "@/lib/section-defs";
import { isSafeUrl } from "@/lib/utils";

function cleanLinks(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(cleanLinks);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) out[k] = /link$/i.test(k) && typeof val === "string" && val && !isSafeUrl(val) ? "" : cleanLinks(val);
    return out;
  }
  return v;
}

export async function saveSection(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("sections.manage");
  const id = Number(fd.get("id")) || null;
  const type = fdStr(fd, "type") as SectionType;
  if (!SECTION_TYPES.includes(type)) return fail("Section type ghalat hai.");
  const config = cleanLinks(fdJson<Record<string, unknown>>(fd, "config", {})) as Record<string, unknown>;
  if (JSON.stringify(config).length > 60000) return fail("Section bohat bara hai.");
  const values = { type, title: fdStr(fd, "title").slice(0, 191) || null, subtitle: fdStr(fd, "subtitle").slice(0, 320) || null, config, isActive: fdBool(fd, "isActive") };
  if (id) {
    await db.update(sections).set(values).where(eq(sections.id, id));
    await logActivity(user, "update", "section", id, SECTION_DEFS[type].label);
  } else {
    const [{ m }] = await db.select({ m: sql<number>`coalesce(max(${sections.sortOrder}), 0)` }).from(sections);
    const [r] = await db.insert(sections).values({ ...values, sortOrder: Number(m) + 1 });
    await logActivity(user, "create", "section", r.insertId, SECTION_DEFS[type].label);
    refresh("sections");
    redirect(`/admin/sections/${r.insertId}?created=1`);
  }
  refresh("sections");
  return done("Section save ho gaya. Homepage update ho gaya.");
}

export async function deleteSection(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("sections.manage");
  const id = Number(fd.get("id"));
  await db.delete(sections).where(eq(sections.id, id));
  await logActivity(user, "delete", "section", id);
  refresh("sections");
  const to = redirectTarget(fd);
  if (to) redirect(to);
  return done("Section hata diya gaya.");
}

export async function toggleSection(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission("sections.manage");
  const id = Number(fd.get("id"));
  const [s] = await db.select({ a: sections.isActive }).from(sections).where(eq(sections.id, id)).limit(1);
  if (!s) return fail("Section nahi mila.");
  await db.update(sections).set({ isActive: !s.a }).where(eq(sections.id, id));
  refresh("sections");
  return done(s.a ? "Section hide ho gaya." : "Section live ho gaya.");
}

export async function moveSection(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission("sections.manage");
  const id = Number(fd.get("id"));
  const dir = fd.get("dir") === "up" ? -1 : 1;
  const all = await db.select({ id: sections.id }).from(sections).orderBy(asc(sections.sortOrder), asc(sections.id));
  const order = all.map((a) => a.id);
  const i = order.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= order.length) return null;
  [order[i], order[j]] = [order[j], order[i]];
  for (let k = 0; k < order.length; k++) await db.update(sections).set({ sortOrder: k }).where(eq(sections.id, order[k]));
  refresh("sections");
  return done("Order update ho gaya.");
}
