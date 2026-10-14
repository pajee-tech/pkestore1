import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { OrderSummary } from "@/components/store/order-summary";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { normalizePhone } from "@/lib/utils";

export const metadata: Metadata = { title: "Track your order", description: "Order number aur mobile number se apna order track karein." };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string; phone?: string }> }) {
  const sp = await searchParams;
  const num = (sp.order || "").trim().toUpperCase().slice(0, 30);
  const phone = normalizePhone(sp.phone || "");
  let result: { order: typeof orders.$inferSelect; items: (typeof orderItems.$inferSelect)[] } | null = null;
  let error = "";
  if (num && phone) {
    if (!(await rateLimit(`track:${await getClientIp()}`, 15, 600))) error = "Bohat zyada koshishen. 10 minute baad try karein.";
    else {
      const [o] = await db.select().from(orders).where(and(eq(orders.orderNumber, num), eq(orders.phone, phone))).limit(1);
      if (o) result = { order: o, items: await db.select().from(orderItems).where(eq(orderItems.orderId, o.id)) };
      else error = "Is order number aur mobile number ka koi order nahi mila. Dobara check karein.";
    }
  }
  return (
    <div className="container-x max-w-3xl">
      <Breadcrumbs items={[{ label: "Track order" }]} />
      <h1 className="text-3xl font-extrabold sm:text-4xl">Track your order</h1>
      <p className="mt-2 text-muted">Order confirmation pe mila order number aur apna mobile number likhein.</p>
      <form className="mt-6 grid gap-3 rounded-[24px] border border-line bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:p-6">
        <div>
          <label htmlFor="order" className="label">Order number</label>
          <input id="order" name="order" defaultValue={num} required className="input uppercase" placeholder="PK2610141234" />
        </div>
        <div>
          <label htmlFor="phone" className="label">Mobile number</label>
          <input id="phone" name="phone" defaultValue={sp.phone || ""} required inputMode="tel" className="input" placeholder="03XXXXXXXXX" />
        </div>
        <button className="btn-primary h-[42px] self-end px-6">Track</button>
      </form>
      {error && <p role="alert" className="mt-4 rounded-xl bg-sale/10 px-4 py-3 text-sm font-medium text-sale">{error}</p>}
      {result && <div className="mt-8"><OrderSummary order={result.order} items={result.items} /></div>}
    </div>
  );
}
