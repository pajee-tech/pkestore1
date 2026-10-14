"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { destroySession, hashPassword, logActivity, requireUser, validatePasswordStrength, verifyPassword } from "@/lib/auth";
import { done, fail, fdStr, type ActionState } from "@/lib/action-state";
import { rateLimit } from "@/lib/rate-limit";

export async function updateProfile(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const name = fdStr(fd, "name").slice(0, 120);
  if (name.length < 2) return fail("Naam likhein.");
  await db.update(users).set({ name }).where(eq(users.id, me.id));
  return done("Profile update ho gaya.");
}

export async function changePassword(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  if (!(await rateLimit(`pwchange:${me.id}`, 5, 900))) return fail("Bohat zyada koshishen. Thori dair baad try karein.");
  const current = String(fd.get("current") || "");
  const next = String(fd.get("next") || "");
  if (next !== String(fd.get("confirm") || "")) return fail("Naye passwords match nahi karte.");
  const weak = validatePasswordStrength(next);
  if (weak) return fail(weak);
  const [u] = await db.select().from(users).where(eq(users.id, me.id)).limit(1);
  if (!u || !(await verifyPassword(current, u.passwordHash))) return fail("Current password ghalat hai.");
  await db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, me.id));
  await db.delete(sessions).where(eq(sessions.userId, me.id));
  await logActivity(me, "password_change", "user", me.id);
  await destroySession();
  redirect("/admin/login");
}

export async function logoutEverywhere() {
  const me = await requireUser();
  await db.delete(sessions).where(eq(sessions.userId, me.id));
  await destroySession();
  redirect("/admin/login");
}
