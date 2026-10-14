import Image from "next/image";
import { Check } from "lucide-react";
import type { Order, OrderItem } from "@/db/schema";
import { formatDate, formatPrice } from "@/lib/utils";
import { PAYMENT_LABEL, PAYMENT_STATUS_LABEL, STATUS_LABEL, TIMELINE } from "@/lib/order-status";

export function OrderSummary({ order, items }: { order: Order; items: OrderItem[] }) {
  const stopped = order.status === "CANCELLED" || order.status === "RETURNED";
  const step = TIMELINE.indexOf(order.status);
  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-line bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Order {order.orderNumber}</h2>
          <span className="text-sm text-muted">Placed {formatDate(order.createdAt, true)}</span>
        </div>
        {stopped ? (
          <p className="mt-4 rounded-xl bg-sale/10 px-4 py-3 font-semibold text-sale">This order is {STATUS_LABEL[order.status].toLowerCase()}.</p>
        ) : (
          <ol className="mt-6 grid grid-cols-5 gap-1">
            {TIMELINE.map((st, n) => (
              <li key={st} className="flex flex-col items-center text-center">
                <span className={`grid size-9 place-items-center rounded-full text-sm font-bold ${n <= step ? "bg-brand-700 text-white" : "bg-paper text-muted ring-1 ring-line"}`}>
                  {n < step ? <Check className="size-4" /> : n + 1}
                </span>
                <span className={`mt-2 text-[11px] leading-tight sm:text-xs ${n <= step ? "font-semibold text-ink" : "text-muted"}`}>{STATUS_LABEL[st]}</span>
              </li>
            ))}
          </ol>
        )}
        {order.trackingNumber && (
          <p className="mt-5 rounded-xl bg-brand-50 px-4 py-3 text-sm">
            Courier: <b>{order.courier || "—"}</b> &nbsp; Tracking #: <b>{order.trackingNumber}</b>
          </p>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[24px] border border-line bg-white p-5 sm:p-7">
          <h3 className="font-bold">Delivery to</h3>
          <p className="mt-2 text-[15px] leading-relaxed">
            {order.customerName}<br />{order.address}<br />{order.city}<br />{order.phone}
          </p>
        </div>
        <div className="rounded-[24px] border border-line bg-white p-5 sm:p-7">
          <h3 className="font-bold">Payment</h3>
          <p className="mt-2 text-[15px]">{PAYMENT_LABEL[order.paymentMethod]}</p>
          <p className="text-sm text-muted">{PAYMENT_STATUS_LABEL[order.paymentStatus]}</p>
        </div>
      </section>

      <section className="rounded-[24px] border border-line bg-white p-5 sm:p-7">
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-3">
              {i.image && <Image src={i.image} alt="" width={56} height={56} className="size-14 rounded-xl object-cover" />}
              <span className="flex-1 text-sm">{i.name} <span className="text-muted">× {i.quantity}</span></span>
              <b className="text-sm">{formatPrice(Number(i.price) * i.quantity)}</b>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-[15px]">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          {Number(order.discount) > 0 && <div className="flex justify-between"><dt>Discount {order.couponCode && `(${order.couponCode})`}</dt><dd>-{formatPrice(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Delivery</dt><dd>{Number(order.shippingFee) === 0 ? "Free" : formatPrice(order.shippingFee)}</dd></div>
          <div className="flex justify-between pt-2 text-lg font-bold"><dt>Total</dt><dd className="text-brand-700">{formatPrice(order.total)}</dd></div>
        </dl>
      </section>
    </div>
  );
}
