import crypto from "node:crypto";

export function orderToken(orderNumber: string) {
  return crypto.createHmac("sha256", process.env.AUTH_SECRET || "x").update("order:" + orderNumber).digest("hex").slice(0, 24);
}
export function verifyOrderToken(orderNumber: string, token: string | undefined) {
  if (!token) return false;
  const a = Buffer.from(orderToken(orderNumber));
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
