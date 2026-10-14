import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, type OrderStatus } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

const esc = (v: unknown) => {
  const s = String(v ?? "");
  const safe = /^[=+\-@]/.test(s) ? "'" + s : s; // CSV injection se bachao
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "orders.manage")) return new Response("Forbidden", { status: 403 });
  const sp = new URL(req.url).searchParams;
  const where = [];
  if (sp.get("status")) where.push(eq(orders.status, sp.get("status") as OrderStatus));
  const rows = await db.select().from(orders).where(where.length ? and(...where) : undefined).orderBy(desc(orders.createdAt)).limit(5000);
  const items = rows.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((r) => r.id))) : [];
  const head = ["Order #", "Date", "Customer", "Phone", "City", "Address", "Items", "Subtotal", "Delivery", "Discount", "Total", "Payment", "Payment status", "Status", "Courier", "Tracking"];
  const lines = rows.map((o) =>
    [
      o.orderNumber,
      new Date(o.createdAt).toISOString().slice(0, 16).replace("T", " "),
      o.customerName,
      o.phone,
      o.city,
      o.address,
      items.filter((i) => i.orderId === o.id).map((i) => `${i.name} x${i.quantity}`).join("; "),
      o.subtotal,
      o.shippingFee,
      o.discount,
      o.total,
      o.paymentMethod,
      o.paymentStatus,
      o.status,
      o.courier,
      o.trackingNumber,
    ].map(esc).join(","),
  );
  const csv = "﻿" + [head.map(esc).join(","), ...lines].join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
