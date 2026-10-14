"use server";

import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, ORDER_STATUSES, type OrderStatus } from "@/db/schema";
import { logActivity, requirePermission } from "@/lib/auth";
import { done, fail, fdStr, type ActionState } from "@/lib/action-state";
import { refresh } from "@/lib/revalidate";

const PAY = ["UNPAID", "PENDING_VERIFICATION", "PAID", "REFUNDED"] as const;

export async function updateOrder(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("orders.manage");
  const id = Number(fd.get("id"));
  const [o] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!o) return fail("Order nahi mila.");
  const status = fdStr(fd, "status") as OrderStatus;
  const paymentStatus = fdStr(fd, "paymentStatus") as (typeof PAY)[number];
  if (!ORDER_STATUSES.includes(status) || !PAY.includes(paymentStatus)) return fail("Status ghalat hai.");

  // cancel / return pe stock wapis
  const wasActive = !["CANCELLED", "RETURNED"].includes(o.status);
  const nowInactive = ["CANCELLED", "RETURNED"].includes(status);
  if (wasActive !== !nowInactive) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    for (const it of items) {
      if (!it.productId) continue;
      const delta = nowInactive ? it.quantity : -it.quantity;
      await db.update(products).set({ stock: sql`GREATEST(${products.stock} + ${delta}, 0)`, soldCount: sql`GREATEST(${products.soldCount} - ${delta}, 0)` }).where(eq(products.id, it.productId));
    }
    refresh("catalog");
  }

  await db
    .update(orders)
    .set({
      status,
      paymentStatus,
      courier: fdStr(fd, "courier").slice(0, 60) || null,
      trackingNumber: fdStr(fd, "trackingNumber").slice(0, 80) || null,
      adminNotes: fdStr(fd, "adminNotes").slice(0, 5000) || null,
    })
    .where(eq(orders.id, id));
  await logActivity(user, "update", "order", id, `${o.orderNumber}: ${o.status} → ${status}`);
  return done("Order update ho gaya.");
}

export async function deleteOrder(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("orders.manage");
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") return fail("Sirf Admin order delete kar sakta hai.");
  const id = Number(fd.get("id"));
  const [o] = await db.select({ n: orders.orderNumber }).from(orders).where(eq(orders.id, id)).limit(1);
  if (!o) return fail("Order nahi mila.");
  await db.delete(orderItems).where(eq(orderItems.orderId, id));
  await db.delete(orders).where(eq(orders.id, id));
  await logActivity(user, "delete", "order", id, o.n);
  redirect("/admin/orders");
}
