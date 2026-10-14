import Image from "next/image";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink, Phone, MessageCircle } from "lucide-react";
import { db } from "@/db";
import { orderItems, orders, ORDER_STATUSES } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/utils";
import { PAYMENT_LABEL, PAYMENT_STATUS_LABEL, STATUS_ADMIN_LABEL, STATUS_COLOR } from "@/lib/order-status";
import { Badge, Card, Field, PageHeader } from "@/components/admin/ui";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteOrder, updateOrder } from "../actions";

export const metadata = { title: "Order" };

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePagePermission("orders.manage");
  const { id } = await params;
  const [o] = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
  if (!o) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
  const wa = "92" + o.phone.replace(/^0/, "");
  const msg = encodeURIComponent(`Assalam o Alaikum ${o.customerName}, PKeStore se aap ka order ${o.orderNumber} (${formatPrice(o.total)}) confirm karna hai. Kya address "${o.address}, ${o.city}" sahi hai?`);

  return (
    <>
      <PageHeader
        title={`Order ${o.orderNumber}`}
        description={`Placed ${formatDate(o.createdAt, true)}`}
        back={{ href: "/admin/orders", label: "Orders" }}
        actions={
          <>
            <Badge className={STATUS_COLOR[o.status]}>{STATUS_ADMIN_LABEL[o.status]}</Badge>
            {(user.role === "SUPER_ADMIN" || user.role === "ADMIN") && <DeleteButton action={deleteOrder} id={o.id} label="Delete" confirmText="Order hamesha ke liye delete karna hai?" className="btn border border-sale/30 bg-white text-sale hover:bg-sale/10" />}
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <Card title="Items" description="Dropship: supplier link se product order karein, phir status 'Ordered from supplier' karein.">
            <ul className="-my-2 divide-y divide-line">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  {i.image && <Image src={i.image} alt="" width={56} height={56} className="size-14 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-sm text-muted">{formatPrice(i.price)} × {i.quantity}</p>
                    {i.supplierUrl && <a href={i.supplierUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">Supplier link <ExternalLink className="size-3" /></a>}
                  </div>
                  <b>{formatPrice(Number(i.price) * i.quantity)}</b>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
              {Number(o.discount) > 0 && <div className="flex justify-between"><dt>Discount ({o.couponCode})</dt><dd>-{formatPrice(o.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Delivery</dt><dd>{formatPrice(o.shippingFee)}</dd></div>
              <div className="flex justify-between pt-1 text-base font-bold"><dt>Total</dt><dd>{formatPrice(o.total)}</dd></div>
            </dl>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Customer">
              <p className="font-semibold">{o.customerName}</p>
              <p className="mt-1 text-sm">{o.address}<br />{o.city}</p>
              <p className="mt-2 text-sm">{o.phone}{o.email && <><br />{o.email}</>}</p>
              {o.notes && <p className="mt-3 rounded-xl bg-saffron-100 p-3 text-sm"><b>Customer note:</b> {o.notes}</p>}
              <div className="mt-4 flex gap-2">
                <a href={`tel:${o.phone}`} className="btn-outline px-4"><Phone className="size-4" /> Call</a>
                <a href={`https://wa.me/${wa}?text=${msg}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] px-4 text-white"><MessageCircle className="size-4" /> WhatsApp</a>
              </div>
            </Card>
            <Card title="Payment">
              <p className="font-semibold">{PAYMENT_LABEL[o.paymentMethod]}</p>
              <p className="text-sm text-muted">{PAYMENT_STATUS_LABEL[o.paymentStatus]}</p>
              {o.transactionId && <p className="mt-2 text-sm">Transaction ID: <b>{o.transactionId}</b></p>}
              {o.paymentProof && (
                <a href={o.paymentProof} target="_blank" rel="noopener noreferrer" className="mt-3 block w-40 overflow-hidden rounded-xl border border-line">
                  <Image src={o.paymentProof} alt="Payment screenshot" width={160} height={220} className="h-auto w-full" />
                </a>
              )}
              {o.paymentMethod !== "COD" && o.paymentStatus === "PENDING_VERIFICATION" && <p className="mt-3 rounded-xl bg-amber-100 p-3 text-sm text-amber-900">Apne JazzCash/Easypaisa/bank app mein payment check karein, phir Payment status &ldquo;Paid&rdquo; karein.</p>}
            </Card>
          </div>
        </div>
        <Card title="Update order" className="h-fit">
          <AdminForm action={updateOrder} className="space-y-4">
            <input type="hidden" name="id" value={o.id} />
            <Field label="Order status" htmlFor="status">
              <select id="status" name="status" defaultValue={o.status} className="input">
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_ADMIN_LABEL[s]}</option>)}
              </select>
            </Field>
            <Field label="Payment status" htmlFor="paymentStatus">
              <select id="paymentStatus" name="paymentStatus" defaultValue={o.paymentStatus} className="input">
                {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Courier" htmlFor="courier"><input id="courier" name="courier" list="couriers" defaultValue={o.courier || ""} className="input" /></Field>
              <Field label="Tracking #" htmlFor="trackingNumber"><input id="trackingNumber" name="trackingNumber" defaultValue={o.trackingNumber || ""} className="input" /></Field>
              <datalist id="couriers">{["TCS", "Leopards", "M&P", "Trax", "PostEx", "Call Courier", "BlueEx", "Pakistan Post"].map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <Field label="Internal notes" htmlFor="adminNotes" hint="Sirf team ko nazar aate hain."><textarea id="adminNotes" name="adminNotes" rows={4} defaultValue={o.adminNotes || ""} className="input" /></Field>
            <SubmitButton className="btn-primary h-11 w-full">Save</SubmitButton>
            <p className="text-xs text-muted">Cancelled ya Returned karne se stock khud wapis add ho jata hai. Customer tracking page pe status aur tracking number dekh sakta hai.</p>
          </AdminForm>
        </Card>
      </div>
    </>
  );
}
