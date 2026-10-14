import Link from "next/link";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { Download } from "lucide-react";
import { db } from "@/db";
import { orders, ORDER_STATUSES, type OrderStatus } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/utils";
import { PAYMENT_LABEL, PAYMENT_STATUS_LABEL, STATUS_ADMIN_LABEL, STATUS_COLOR } from "@/lib/order-status";
import { Badge, Empty, PageHeader, Pagination, Table } from "@/components/admin/ui";

export const metadata = { title: "Orders" };
const PER = 40;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; payment?: string; page?: string }> }) {
  await requirePagePermission("orders.manage");
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const where = [];
  if (sp.status && ORDER_STATUSES.includes(sp.status as OrderStatus)) where.push(eq(orders.status, sp.status as OrderStatus));
  if (sp.payment) where.push(eq(orders.paymentStatus, sp.payment as "PAID"));
  if (sp.q) {
    const t = `%${sp.q.replace(/[%_\\]/g, "\\$&")}%`;
    where.push(or(like(orders.orderNumber, t), like(orders.phone, t), like(orders.customerName, t), like(orders.city, t)));
  }
  const cond = where.length ? and(...where) : undefined;
  const [rows, [{ n }], counts] = await Promise.all([
    db.select().from(orders).where(cond).orderBy(desc(orders.createdAt)).limit(PER).offset((page - 1) * PER),
    db.select({ n: sql<number>`count(*)` }).from(orders).where(cond),
    db.select({ s: orders.status, n: sql<number>`count(*)` }).from(orders).groupBy(orders.status),
  ]);
  const cnt = new Map(counts.map((c) => [c.s, Number(c.n)]));
  const qs = new URLSearchParams(Object.entries({ q: sp.q || "", status: sp.status || "", payment: sp.payment || "" }).filter(([, v]) => v)).toString();

  return (
    <>
      <PageHeader
        title="Orders"
        description="Naye orders 'Pending' mein aate hain. Customer ko call/WhatsApp kar ke Confirm karein, supplier se mangwayein, phir Shipped aur Delivered."
        actions={<a href={`/api/admin/orders-export${qs ? `?${qs}` : ""}`} className="btn-outline"><Download className="size-4" /> Export CSV</a>}
      />
      <div className="mb-3 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${!sp.status ? "bg-brand-700 text-white" : "bg-white ring-1 ring-line"}`}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${sp.status === s ? "bg-brand-700 text-white" : "bg-white ring-1 ring-line"}`}>
            {STATUS_ADMIN_LABEL[s]} <span className="opacity-60">{cnt.get(s) || 0}</span>
          </Link>
        ))}
      </div>
      <form className="mb-4 flex gap-2">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <input name="q" defaultValue={sp.q} placeholder="Order #, phone, name or city" className="input max-w-md" />
        <button className="btn-outline">Search</button>
      </form>
      {rows.length === 0 ? (
        <Empty title="Koi order nahi" text="Jab customer order karega to yahan nazar aayega." />
      ) : (
        <Table head={["Order", "Customer", "Total", "Payment", "Status", "Date"]}>
          {rows.map((o) => (
            <tr key={o.id} className="hover:bg-paper/60">
              <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-700 hover:underline">{o.orderNumber}</Link></td>
              <td className="px-4 py-3">{o.customerName}<span className="block text-xs text-muted">{o.phone}, {o.city}</span></td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
              <td className="px-4 py-3">
                {PAYMENT_LABEL[o.paymentMethod]}
                <span className={`block text-xs ${o.paymentStatus === "PENDING_VERIFICATION" ? "font-semibold text-amber-700" : "text-muted"}`}>{PAYMENT_STATUS_LABEL[o.paymentStatus]}</span>
              </td>
              <td className="px-4 py-3"><Badge className={STATUS_COLOR[o.status]}>{STATUS_ADMIN_LABEL[o.status]}</Badge></td>
              <td className="px-4 py-3 text-muted">{formatDate(o.createdAt, true)}</td>
            </tr>
          ))}
        </Table>
      )}
      <Pagination page={page} pages={Math.ceil(Number(n) / PER)} base={`/admin/orders${qs ? `?${qs}` : ""}`} />
    </>
  );
}
