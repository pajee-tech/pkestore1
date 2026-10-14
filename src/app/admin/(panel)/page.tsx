import Link from "next/link";
import Image from "next/image";
import { desc, lt, sql, eq } from "drizzle-orm";
import { ShoppingCart, Clock, Banknote, Package, AlertTriangle, Plus } from "lucide-react";
import { db } from "@/db";
import { orders, products, messages } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { formatDate, formatPrice } from "@/lib/utils";
import { STATUS_ADMIN_LABEL, STATUS_COLOR } from "@/lib/order-status";
import { Badge, Card, PageHeader } from "@/components/admin/ui";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string; welcome?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const showOrders = can(user.role, "orders.manage");
  const showProducts = can(user.role, "products.manage");
  const startToday = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" }) + "T00:00:00+05:00");
  const startMonth = new Date(startToday.getFullYear(), startToday.getMonth(), 1);

  const [stats] = showOrders
    ? await db
        .select({
          today: sql<number>`sum(case when ${orders.createdAt} >= ${startToday} then 1 else 0 end)`,
          pending: sql<number>`sum(case when ${orders.status} = 'PENDING' then 1 else 0 end)`,
          verify: sql<number>`sum(case when ${orders.paymentStatus} = 'PENDING_VERIFICATION' then 1 else 0 end)`,
          revenue: sql<number>`sum(case when ${orders.createdAt} >= ${startMonth} and ${orders.status} not in ('CANCELLED','RETURNED') then ${orders.total} else 0 end)`,
        })
        .from(orders)
    : [null];
  const [pc] = await db.select({ total: sql<number>`count(*)`, low: sql<number>`sum(case when ${products.stock} < 10 then 1 else 0 end)` }).from(products);
  const recent = showOrders ? await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8) : [];
  const lowStock = showProducts
    ? await db.select({ id: products.id, name: products.name, stock: products.stock, images: products.images }).from(products).where(lt(products.stock, 10)).orderBy(products.stock).limit(6)
    : [];
  const top = await db.select({ id: products.id, name: products.name, sold: products.soldCount, images: products.images, price: products.price }).from(products).where(eq(products.isActive, true)).orderBy(desc(products.soldCount)).limit(5);
  const [unread] = can(user.role, "messages.view") ? await db.select({ n: sql<number>`count(*)` }).from(messages).where(eq(messages.isRead, false)) : [{ n: 0 }];

  const tiles = [
    showOrders && { label: "Orders today", value: Number(stats?.today || 0), icon: ShoppingCart, href: "/admin/orders" },
    showOrders && { label: "Pending orders", value: Number(stats?.pending || 0), icon: Clock, href: "/admin/orders?status=PENDING" },
    showOrders && { label: "Revenue this month", value: formatPrice(stats?.revenue || 0), icon: Banknote, href: "/admin/orders" },
    { label: "Products", value: Number(pc.total), icon: Package, href: showProducts ? "/admin/products" : "#" },
  ].filter(Boolean) as { label: string; value: string | number; icon: typeof Package; href: string }[];

  return (
    <>
      <PageHeader
        title={`Assalam o Alaikum, ${user.name.split(" ")[0]}`}
        description={`Aap ${ROLE_LABELS[user.role]} ke taur pe logged in hain.`}
        actions={
          <>
            {showProducts && <Link href="/admin/products/new" className="btn-primary"><Plus className="size-4" /> Add product</Link>}
            {can(user.role, "content.manage") && <Link href="/admin/pages/new" className="btn-outline">New page / guide</Link>}
          </>
        }
      />
      {sp.denied && <p className="mb-5 rounded-xl bg-sale/10 px-4 py-3 text-sm font-medium text-sale">Aap ke role ko us page ki permission nahi hai.</p>}
      {sp.welcome && <p className="mb-5 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">Master Admin account ban gaya. Ab Settings mein apni store details aur Users mein team members add karein.</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-2xl border border-line bg-white p-4 hover:border-brand-200 sm:p-5">
            <t.icon className="size-5 text-brand-700" />
            <p className="mt-3 font-display text-2xl font-bold sm:text-3xl">{t.value}</p>
            <p className="text-sm text-muted">{t.label}</p>
          </Link>
        ))}
      </div>

      {(Number(stats?.verify || 0) > 0 || Number(unread.n) > 0 || Number(pc.low || 0) > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Number(stats?.verify || 0) > 0 && <Link href="/admin/orders?payment=PENDING_VERIFICATION" className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">{stats?.verify} payments verify karni hain</Link>}
          {Number(unread.n) > 0 && <Link href="/admin/messages" className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-900">{unread.n} naye messages</Link>}
          {showProducts && Number(pc.low || 0) > 0 && <span className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-900">{pc.low} products ka stock kam hai</span>}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {showOrders && (
          <Card title="Recent orders" actions={<Link href="/admin/orders" className="text-sm font-semibold text-brand-700">View all</Link>}>
            {recent.length === 0 ? (
              <p className="text-sm text-muted">Abhi koi order nahi aaya. Pehla order aate hi yahan nazar aayega.</p>
            ) : (
              <ul className="-my-2 divide-y divide-line">
                {recent.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:opacity-80">
                      <span className="w-32 font-semibold">{o.orderNumber}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">{o.customerName}, {o.city}</span>
                      <Badge className={STATUS_COLOR[o.status]}>{STATUS_ADMIN_LABEL[o.status]}</Badge>
                      <span className="w-24 text-right font-semibold">{formatPrice(o.total)}</span>
                      <span className="w-full text-xs text-muted sm:w-28 sm:text-right">{formatDate(o.createdAt, true)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        <div className="space-y-6">
          <Card title="Best sellers">
            <ul className="-my-1 space-y-3">
              {top.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <Image src={p.images[0]} alt="" width={44} height={44} className="size-11 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                  <span className="text-sm font-semibold">{p.sold} sold</span>
                </li>
              ))}
            </ul>
          </Card>
          {lowStock.length > 0 && (
            <Card title="Low stock" actions={<AlertTriangle className="size-5 text-amber-600" />}>
              <ul className="-my-1 space-y-3">
                {lowStock.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:opacity-80">
                      <Image src={p.images[0]} alt="" width={40} height={40} className="size-10 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                      <Badge className="bg-rose-100 text-rose-800">{p.stock} left</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
