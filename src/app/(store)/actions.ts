"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { coupons, messages, orderItems, orders, products, subscribers } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { getSettings } from "@/lib/data";
import { evaluateCoupon, shippingFor } from "@/lib/pricing";
import { optimizeToWebp, storeImage, MAX_UPLOAD_BYTES } from "@/lib/image-storage";
import { orderToken } from "@/lib/order-token";
import { normalizePhone } from "@/lib/utils";

type Res = { ok: boolean; message: string } | null;

const phoneRe = /^(\+?92|0)?3\d{2}[- ]?\d{7}$/;

export async function subscribeAction(_: Res, fd: FormData): Promise<Res> {
  if (fd.get("website")) return { ok: true, message: "Shukriya!" }; // honeypot
  const email = z.string().trim().toLowerCase().email().max(191).safeParse(fd.get("email"));
  if (!email.success) return { ok: false, message: "Sahi email address likhein." };
  if (!(await rateLimit(`sub:${await getClientIp()}`, 5, 3600))) return { ok: false, message: "Thori dair baad try karein." };
  await db.insert(subscribers).values({ email: email.data }).onDuplicateKeyUpdate({ set: { email: email.data } });
  return { ok: true, message: "Shukriya! Aap subscribe ho gaye hain." };
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Naam likhein").max(120),
  email: z.string().trim().email("Sahi email likhein").max(191).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().max(191).optional(),
  message: z.string().trim().min(10, "Message thora detail mein likhein").max(3000),
});

export async function contactAction(_: Res, fd: FormData): Promise<Res> {
  if (fd.get("website")) return { ok: true, message: "Message mil gaya." };
  const parsed = contactSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  if (!(await rateLimit(`contact:${await getClientIp()}`, 4, 3600))) return { ok: false, message: "Bohat zyada messages. Thori dair baad try karein." };
  const d = parsed.data;
  await db.insert(messages).values({ name: d.name, email: d.email || null, phone: d.phone || null, subject: d.subject || null, message: d.message });
  return { ok: true, message: "Shukriya! Hamari team jald aap se rabta karegi." };
}

export async function checkCouponAction(code: string, subtotal: number) {
  const c = z.string().trim().toUpperCase().min(2).max(40).safeParse(code);
  if (!c.success) return { ok: false as const, error: "Coupon code likhein." };
  if (!(await rateLimit(`coupon:${await getClientIp()}`, 20, 600))) return { ok: false as const, error: "Thori dair baad try karein." };
  const [row] = await db.select().from(coupons).where(eq(coupons.code, c.data)).limit(1);
  return evaluateCoupon(row, subtotal);
}

const orderSchema = z.object({
  name: z.string().trim().min(3, "Poora naam likhein").max(120),
  phone: z.string().trim().regex(phoneRe, "Sahi mobile number likhein (03XX-XXXXXXX)"),
  email: z.string().trim().email("Sahi email likhein").max(191).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City likhein").max(80),
  address: z.string().trim().min(10, "Mukammal address likhein (ghar #, gali, area)").max(500),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["COD", "BANK", "JAZZCASH", "EASYPAISA"]),
  transactionId: z.string().trim().max(80).optional(),
  coupon: z.string().trim().toUpperCase().max(40).optional(),
  items: z
    .string()
    .transform((s, ctx) => {
      try {
        return JSON.parse(s);
      } catch {
        ctx.addIssue({ code: "custom", message: "Cart data invalid" });
        return z.NEVER;
      }
    })
    .pipe(z.array(z.object({ id: z.number().int().positive(), qty: z.number().int().min(1).max(20) })).min(1, "Cart khali hai").max(30)),
});

export type OrderResult = { ok: false; message: string; field?: string } | { ok: true; orderNumber: string; token: string } | null;

export async function placeOrderAction(_: OrderResult, fd: FormData): Promise<OrderResult> {
  if (fd.get("website")) return { ok: false, message: "Order place nahi ho saka." };
  const parsed = orderSchema.safeParse(Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")));
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, message: i.message, field: String(i.path[0] || "") };
  }
  const d = parsed.data;
  const ip = await getClientIp();
  if (!(await rateLimit(`order:${ip}`, 6, 900))) return { ok: false, message: "Bohat zyada orders. 15 minute baad try karein ya WhatsApp karein." };

  const s = await getSettings();
  const enabled = { COD: s.codEnabled, BANK: s.bankEnabled, JAZZCASH: s.jazzcashEnabled, EASYPAISA: s.easypaisaEnabled };
  if (!enabled[d.paymentMethod]) return { ok: false, message: "Ye payment method abhi available nahi." };

  // prices hamesha database se — browser ki prices pe bharosa nahi
  const merged = new Map<number, number>();
  for (const it of d.items) merged.set(it.id, Math.min((merged.get(it.id) || 0) + it.qty, 20));
  const rows = await db
    .select({ id: products.id, name: products.name, price: products.price, stock: products.stock, images: products.images, supplierUrl: products.supplierUrl })
    .from(products)
    .where(and(inArray(products.id, [...merged.keys()]), eq(products.isActive, true)));
  if (rows.length !== merged.size) return { ok: false, message: "Cart mein kuch products ab available nahi. Cart update karein." };
  for (const r of rows) if (r.stock < (merged.get(r.id) || 0)) return { ok: false, message: `"${r.name}" ka itna stock nahi hai (${r.stock} available).` };

  const subtotal = rows.reduce((sum, r) => sum + Number(r.price) * (merged.get(r.id) || 0), 0);
  let discount = 0;
  let freeShip = false;
  let couponCode: string | null = null;
  if (d.coupon) {
    const [c] = await db.select().from(coupons).where(eq(coupons.code, d.coupon)).limit(1);
    const res = evaluateCoupon(c, subtotal);
    if (!res.ok) return { ok: false, message: res.error, field: "coupon" };
    discount = res.discount;
    freeShip = res.freeShipping;
    couponCode = res.code;
  }
  const shippingFee = shippingFor(subtotal, s.shippingFee, s.freeShippingOver, freeShip);
  const total = Math.max(subtotal - discount + shippingFee, 0);

  let proofUrl: string | null = null;
  const proof = fd.get("proof");
  if (d.paymentMethod !== "COD") {
    if (proof instanceof File && proof.size > 0) {
      if (proof.size > MAX_UPLOAD_BYTES) return { ok: false, message: "Screenshot 4MB se chhota ho.", field: "proof" };
      try {
        const img = await optimizeToWebp(Buffer.from(await proof.arrayBuffer()), 1200);
        proofUrl = await storeImage(img.buffer, "payment-proof", "payments");
      } catch {
        return { ok: false, message: "Screenshot upload nahi ho saka. JPG/PNG image dein.", field: "proof" };
      }
    }
    if (!proofUrl && !d.transactionId) return { ok: false, message: "Payment ka Transaction ID likhein ya screenshot upload karein.", field: "transactionId" };
  }

  const orderNumber = `PK${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${Math.floor(1000 + Math.random() * 9000)}`;
  await db.transaction(async (tx) => {
    const [res] = await tx.insert(orders).values({
      orderNumber,
      customerName: d.name,
      phone: normalizePhone(d.phone),
      email: d.email || null,
      city: d.city,
      address: d.address,
      notes: d.notes || null,
      subtotal,
      shippingFee,
      discount,
      total,
      couponCode,
      paymentMethod: d.paymentMethod,
      paymentStatus: d.paymentMethod === "COD" ? "UNPAID" : "PENDING_VERIFICATION",
      transactionId: d.transactionId || null,
      paymentProof: proofUrl,
      ip,
    });
    const orderId = res.insertId;
    await tx.insert(orderItems).values(
      rows.map((r) => ({
        orderId,
        productId: r.id,
        name: r.name,
        image: r.images?.[0] || null,
        price: Number(r.price),
        quantity: merged.get(r.id) || 1,
        supplierUrl: r.supplierUrl,
      })),
    );
    for (const r of rows) {
      const q = merged.get(r.id) || 0;
      await tx
        .update(products)
        .set({ stock: sql`GREATEST(${products.stock} - ${q}, 0)`, soldCount: sql`${products.soldCount} + ${q}` })
        .where(eq(products.id, r.id));
    }
    if (couponCode) await tx.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.code, couponCode));
  });

  revalidateTag("catalog", "max");
  return { ok: true, orderNumber, token: orderToken(orderNumber) };
}
