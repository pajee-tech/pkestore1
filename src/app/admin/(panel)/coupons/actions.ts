"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { logActivity, requirePermission } from "@/lib/auth";
import { done, fail, fdBool, fdNum, fdStr, type ActionState } from "@/lib/action-state";

export async function saveCoupon(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("coupons.manage");
  const id = fdNum(fd, "id");
  const code = fdStr(fd, "code").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 40);
  if (code.length < 3) return fail("Code kam az kam 3 characters (A-Z, 0-9).");
  const type = fdStr(fd, "type") as "PERCENT" | "FIXED" | "FREE_SHIPPING";
  if (!["PERCENT", "FIXED", "FREE_SHIPPING"].includes(type)) return fail("Type select karein.");
  const value = fdNum(fd, "value") ?? 0;
  if (type === "PERCENT" && (value <= 0 || value > 90)) return fail("Percent 1 se 90 ke darmiyan ho.");
  if (type === "FIXED" && value <= 0) return fail("Discount amount likhein.");
  const exp = fdStr(fd, "expiresAt");
  const values = { code, type, value, minOrder: fdNum(fd, "minOrder") ?? 0, maxUses: fdNum(fd, "maxUses"), expiresAt: exp ? new Date(exp + "T23:59:59+05:00") : null, isActive: fdBool(fd, "isActive") };
  try {
    if (id) await db.update(coupons).set(values).where(eq(coupons.id, id));
    else await db.insert(coupons).values(values);
  } catch {
    return fail("Ye code pehle se maujood hai.");
  }
  await logActivity(user, id ? "update" : "create", "coupon", id, code);
  return done(`Coupon ${code} save ho gaya.`);
}

export async function deleteCoupon(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("coupons.manage");
  const id = Number(fd.get("id"));
  await db.delete(coupons).where(eq(coupons.id, id));
  await logActivity(user, "delete", "coupon", id);
  return done("Coupon delete ho gaya.");
}
