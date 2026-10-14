import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CircleCheckBig } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { verifyOrderToken } from "@/lib/order-token";
import { OrderSummary } from "@/components/store/order-summary";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> }) {
  const [{ number }, { t }] = await Promise.all([params, searchParams]);
  if (!/^[A-Z0-9]{6,30}$/.test(number) || !verifyOrderToken(number, t)) notFound();
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, number)).limit(1);
  if (!order) notFound();
  const [items, s] = await Promise.all([db.select().from(orderItems).where(eq(orderItems.orderId, order.id)), getSettings()]);
  return (
    <div className="container-x max-w-3xl py-10">
      <div className="text-center">
        <CircleCheckBig className="mx-auto size-14 text-brand-600" />
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Shukriya, {order.customerName.split(" ")[0]}!</h1>
        <p className="mx-auto mt-2 max-w-lg text-muted">
          Aap ka order <b className="text-ink">{order.orderNumber}</b> mil gaya hai. Hamari team jald call ya WhatsApp pe confirm karegi.
          Order number sambhal kar rakhein — isi se aap order track kar sakte hain.
        </p>
      </div>
      <div className="mt-8"><OrderSummary order={order} items={items} /></div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn-primary h-12 px-6">Continue shopping</Link>
        <a href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(`Mera order number ${order.orderNumber} hai.`)}`} target="_blank" rel="noopener noreferrer" className="btn-outline h-12 px-6">Message us on WhatsApp</a>
      </div>
    </div>
  );
}
