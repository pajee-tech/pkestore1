import type { Coupon } from "@/db/schema";

export type CouponResult = { ok: true; discount: number; freeShipping: boolean; code: string } | { ok: false; error: string };

export function evaluateCoupon(c: Coupon | undefined | null, subtotal: number): CouponResult {
  if (!c || !c.isActive) return { ok: false, error: "Ye coupon code valid nahi hai." };
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { ok: false, error: "Ye coupon expire ho chuka hai." };
  if (c.maxUses != null && c.usedCount >= c.maxUses) return { ok: false, error: "Is coupon ki limit poori ho chuki hai." };
  if (subtotal < Number(c.minOrder)) return { ok: false, error: `Ye coupon Rs ${Number(c.minOrder).toLocaleString()} se zyada ke order pe lagta hai.` };
  const v = Number(c.value);
  if (c.type === "FREE_SHIPPING") return { ok: true, discount: 0, freeShipping: true, code: c.code };
  const discount = c.type === "PERCENT" ? Math.round((subtotal * Math.min(v, 90)) / 100) : Math.min(v, subtotal);
  return { ok: true, discount, freeShipping: false, code: c.code };
}

export function shippingFor(subtotal: number, fee: number, freeOver: number, freeShipping = false) {
  if (freeShipping) return 0;
  if (freeOver > 0 && subtotal >= freeOver) return 0;
  return fee;
}
