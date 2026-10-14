"use server";

import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { hashPassword, logActivity, requirePermission, validatePasswordStrength } from "@/lib/auth";
import { done, fail, fdBool, fdNum, fdStr, type ActionState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";

const ASSIGNABLE = ["ADMIN", "EDITOR", "MARKETER", "ORDER_MANAGER"] as const;

export async function saveUser(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requirePermission("users.manage");
  const id = fdNum(fd, "id");
  const name = fdStr(fd, "name").slice(0, 120);
  const email = fdStr(fd, "email").toLowerCase().slice(0, 191);
  const password = String(fd.get("password") || "");
  if (name.length < 2) return fail("Naam likhein.");
  if (!z.string().email().safeParse(email).success) return fail("Sahi email likhein.");
  const dup = await db.select({ id: users.id }).from(users).where(id ? and(eq(users.email, email), ne(users.id, id)) : eq(users.email, email)).limit(1);
  if (dup.length) return fail("Is email ka user pehle se maujood hai.");

  if (id) {
    const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!target) return fail("User nahi mila.");
    const isSuper = target.role === "SUPER_ADMIN";
    const role = isSuper ? "SUPER_ADMIN" : (fdStr(fd, "role") as (typeof ASSIGNABLE)[number]);
    if (!isSuper && !ASSIGNABLE.includes(role as (typeof ASSIGNABLE)[number])) return fail("Role select karein.");
    const isActive = isSuper ? true : fdBool(fd, "isActive");
    const update: Partial<typeof users.$inferInsert> = { name, email, role, isActive };
    if (password) {
      const weak = validatePasswordStrength(password);
      if (weak) return fail(weak);
      update.passwordHash = await hashPassword(password);
    }
    await db.update(users).set(update).where(eq(users.id, id));
    if (password || !isActive || role !== target.role) await db.delete(sessions).where(eq(sessions.userId, id)); // dobara login karna hoga
    await logActivity(me, "update", "user", id, `${email} (${role})${password ? ", password reset" : ""}`);
    revalidatePath("/admin/users");
    return done("User update ho gaya.");
  }
  const role = fdStr(fd, "role") as (typeof ASSIGNABLE)[number];
  if (!ASSIGNABLE.includes(role)) return fail("Role select karein.");
  const weak = validatePasswordStrength(password);
  if (weak) return fail(weak);
  const [r] = await db.insert(users).values({ name, email, role, passwordHash: await hashPassword(password) });
  await logActivity(me, "create", "user", r.insertId, `${email} (${role})`);
  revalidatePath("/admin/users");
  return done(`${name} ka account ban gaya. Unhein email aur password de dein — wo /admin/login se login karenge.`);
}

export async function deleteUser(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requirePermission("users.manage");
  const id = Number(fd.get("id"));
  if (id === me.id) return fail("Aap apna account delete nahi kar sakte.");
  const [t] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!t) return fail("User nahi mila.");
  if (t.role === "SUPER_ADMIN") return fail("Master Admin delete nahi ho sakta.");
  await db.delete(sessions).where(eq(sessions.userId, id));
  await db.delete(users).where(eq(users.id, id));
  await logActivity(me, "delete", "user", id, t.email);
  revalidatePath("/admin/users");
  return done("User delete ho gaya.");
}

export async function logoutUser(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requirePermission("users.manage");
  const id = Number(fd.get("id"));
  await db.delete(sessions).where(eq(sessions.userId, id));
  await logActivity(me, "force_logout", "user", id);
  return done("Is user ke tamam devices se logout kar diya.");
}
