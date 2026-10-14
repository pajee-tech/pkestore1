import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, activityLogs, type User } from "@/db/schema";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "./session-token";
import { can, type Permission } from "./permissions";
import { getClientIp, getUserAgent } from "./request";

export type SafeUser = Omit<User, "passwordHash">;

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function validatePasswordStrength(pw: string): string | null {
  if (pw.length < 10) return "Password kam az kam 10 characters ka ho.";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw)) return "Password mein chhote aur bare dono letters hon.";
  if (!/[0-9]/.test(pw)) return "Password mein kam az kam ek number ho.";
  return null;
}

export async function createSession(userId: number, role: string) {
  const sid = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db.insert(sessions).values({ id: sid, userId, expiresAt, ip: await getClientIp(), userAgent: await getUserAgent() });
  // purge expired sessions
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  const token = await signSession({ sid, uid: userId, role });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const payload = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (payload) await db.delete(sessions).where(eq(sessions.id, payload.sid));
  jar.delete(SESSION_COOKIE);
}

/** Current logged-in admin user (ya null). Har request pe ek dafa DB check hota hai. */
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const jar = await cookies();
  const payload = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, payload.sid), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const u = rows[0]?.user;
  if (!u || !u.isActive) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = u;
  return safe;
});

export async function requireUser(): Promise<SafeUser> {
  const u = await getCurrentUser();
  if (!u) redirect("/admin/login");
  return u;
}

/** Page / action ke shuru mein call karen. Permission na ho to error. */
export async function requirePermission(p: Permission): Promise<SafeUser> {
  const u = await requireUser();
  if (!can(u.role, p)) throw new Error("Aap ke paas is kaam ki permission nahi hai.");
  return u;
}

export async function requirePagePermission(p: Permission): Promise<SafeUser> {
  const u = await requireUser();
  if (!can(u.role, p)) redirect("/admin?denied=1");
  return u;
}

export async function logActivity(
  user: Pick<SafeUser, "id" | "name"> | null,
  action: string,
  entity: string,
  entityId?: string | number | null,
  details?: string,
) {
  try {
    await db.insert(activityLogs).values({
      userId: user?.id ?? null,
      userName: user?.name ?? null,
      action,
      entity,
      entityId: entityId != null ? String(entityId) : null,
      details: details?.slice(0, 500),
      ip: await getClientIp(),
    });
  } catch {
    /* logging kabhi main kaam ko fail na kare */
  }
}
