"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, hashPassword, logActivity, validatePasswordStrength, verifyPassword } from "@/lib/auth";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

type State = { ok: boolean; message: string } | null;

// constant-time-ish dummy hash so login timing doesn't reveal valid emails
const DUMMY_HASH = "$2b$12$O2QXVX/zdi4Y43LUAd2MXefmHe3HTKt80Q7ybvs4fk1oTGGptHslC";

export async function loginAction(_: State, fd: FormData): Promise<State> {
  const email = String(fd.get("email") || "").trim().toLowerCase().slice(0, 191);
  const password = String(fd.get("password") || "").slice(0, 200);
  const next = String(fd.get("next") || "/admin");
  if (!email || !password) return { ok: false, message: "Email aur password dono likhein." };

  const ip = await getClientIp();
  const allowedIp = await rateLimit(`login-ip:${ip}`, 20, 900);
  const allowedEmail = await rateLimit(`login-email:${email}`, 6, 900);
  if (!allowedIp || !allowedEmail) return { ok: false, message: "Bohat zyada ghalat koshishen. 15 minute baad dobara try karein." };

  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const valid = await verifyPassword(password, u?.passwordHash || DUMMY_HASH);
  if (!u || !valid || !u.isActive) {
    await logActivity(null, "login_failed", "auth", null, email);
    return { ok: false, message: "Email ya password ghalat hai." };
  }
  await resetRateLimit(`login-email:${email}`);
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, u.id));
  await createSession(u.id, u.role);
  await logActivity(u, "login", "auth", u.id);
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

const setupSchema = z
  .object({
    setupKey: z.string().min(1, "Setup key likhein"),
    name: z.string().trim().min(2, "Naam likhein").max(120),
    email: z.string().trim().toLowerCase().email("Sahi email likhein").max(191),
    password: z.string().max(200),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Dono passwords match nahi karte", path: ["confirm"] });

export async function setupAction(_: State, fd: FormData): Promise<State> {
  const ip = await getClientIp();
  if (!(await rateLimit(`setup:${ip}`, 8, 900))) return { ok: false, message: "Bohat zyada koshishen. Thori dair baad try karein." };
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(users);
  if (Number(n) > 0) return { ok: false, message: "Master Admin pehle se bana hua hai. Login karein." };

  const parsed = setupSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  const expected = process.env.SETUP_KEY;
  if (!expected || expected.length < 6 || expected.startsWith("change-me")) return { ok: false, message: "Server pe SETUP_KEY set nahi hai. Pehle environment variable set karein." };
  if (d.setupKey !== expected) return { ok: false, message: "Setup key ghalat hai." };
  const weak = validatePasswordStrength(d.password);
  if (weak) return { ok: false, message: weak };

  const [res] = await db.insert(users).values({ name: d.name, email: d.email, passwordHash: await hashPassword(d.password), role: "SUPER_ADMIN" });
  await createSession(res.insertId, "SUPER_ADMIN");
  await logActivity({ id: res.insertId, name: d.name }, "setup", "user", res.insertId, "Master Admin created");
  redirect("/admin?welcome=1");
}
