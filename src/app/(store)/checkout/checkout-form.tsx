"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Loader2, Upload, Tag } from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import { formatPrice } from "@/lib/utils";
import { shippingFor } from "@/lib/pricing";
import { placeOrderAction, checkCouponAction, type OrderResult } from "../actions";

type Method = "COD" | "JAZZCASH" | "EASYPAISA" | "BANK";
type Props = {
  settings: { shippingFee: number; freeOver: number; deliveryTime: string; methods: Record<Method, { label: string; info: string } | null> };
};

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur", "Abbottabad", "Mardan", "Sahiwal", "Okara", "Kasur", "Pattoki"];

export function CheckoutForm({ settings }: Props) {
  const { items, subtotal, ready, clear } = useCart();
  const router = useRouter();
  const methods = (Object.keys(settings.methods) as Method[]).filter((m) => settings.methods[m]);
  const [method, setMethod] = useState<Method>(methods[0] || "COD");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number; freeShipping: boolean } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [checking, startCheck] = useTransition();
  const [state, action, pending] = useActionState<OrderResult, FormData>(placeOrderAction, null);

  useEffect(() => {
    if (state?.ok) {
      clear();
      router.replace(`/order/${state.orderNumber}?t=${state.token}`);
    }
  }, [state, clear, router]);

  useEffect(() => setApplied(null), [subtotal]);

  if (!ready) return <div className="container-x py-20" />;
  if (!items.length && !state?.ok)
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-3xl font-extrabold">Cart khali hai</h1>
        <Link href="/shop" className="btn-primary mt-6">Start shopping</Link>
      </div>
    );

  const discount = applied?.discount || 0;
  const ship = shippingFor(subtotal, settings.shippingFee, settings.freeOver, applied?.freeShipping);
  const total = Math.max(subtotal - discount + ship, 0);
  const err = state && !state.ok ? state : null;
  const fieldErr = (f: string) => (err?.field === f ? "border-sale focus:border-sale focus:ring-sale/15" : "");

  return (
    <div className="container-x py-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Checkout</h1>
      <form action={action} className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
        <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ id: i.id, qty: i.qty })))} />
        <input type="hidden" name="coupon" value={applied?.code || ""} />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        <div className="space-y-6">
          <fieldset className="rounded-[24px] border border-line bg-white p-5 sm:p-7">
            <legend className="sr-only">Delivery details</legend>
            <h2 className="text-xl font-bold">Delivery details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="label">Full name</label>
                <input id="name" name="name" required autoComplete="name" className={`input ${fieldErr("name")}`} placeholder="Muhammad Ali" />
              </div>
              <div>
                <label htmlFor="phone" className="label">Mobile number</label>
                <input id="phone" name="phone" required inputMode="tel" autoComplete="tel" className={`input ${fieldErr("phone")}`} placeholder="03XX-XXXXXXX" />
              </div>
              <div>
                <label htmlFor="email" className="label">Email <span className="font-normal text-muted">(optional)</span></label>
                <input id="email" name="email" type="email" autoComplete="email" className={`input ${fieldErr("email")}`} placeholder="you@example.com" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="city" className="label">City</label>
                <input id="city" name="city" required list="pk-cities" autoComplete="address-level2" className={`input ${fieldErr("city")}`} placeholder="Lahore" />
                <datalist id="pk-cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="label">Complete address</label>
                <textarea id="address" name="address" required rows={3} autoComplete="street-address" className={`input ${fieldErr("address")}`} placeholder="House #, street, area, nearby landmark" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="label">Order notes <span className="font-normal text-muted">(optional)</span></label>
                <input id="notes" name="notes" className="input" placeholder="Jaise: shaam 5 baje ke baad deliver karein" />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-[24px] border border-line bg-white p-5 sm:p-7">
            <legend className="sr-only">Payment method</legend>
            <h2 className="text-xl font-bold">Payment method</h2>
            <div className="mt-4 space-y-3">
              {methods.map((m) => {
                const info = settings.methods[m]!;
                const active = method === m;
                return (
                  <label key={m} className={`block cursor-pointer rounded-2xl border-2 p-4 transition ${active ? "border-brand-700 bg-brand-50/60" : "border-line hover:border-brand-200"}`}>
                    <span className="flex items-center gap-3">
                      <input type="radio" name="paymentMethod" value={m} checked={active} onChange={() => setMethod(m)} className="size-5 accent-brand-700" />
                      <span className="font-semibold">{info.label}</span>
                    </span>
                    {active && (
                      <div className="mt-3 pl-8 text-sm">
                        <p className="whitespace-pre-line rounded-xl bg-white p-3 ring-1 ring-line">{info.info}</p>
                        {m !== "COD" && (
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                              <label htmlFor="transactionId" className="label">Transaction ID (TID)</label>
                              <input id="transactionId" name="transactionId" className={`input ${fieldErr("transactionId")}`} placeholder="e.g. 0123456789" />
                            </div>
                            <div>
                              <label htmlFor="proof" className="label">Payment screenshot</label>
                              <label className={`input flex cursor-pointer items-center gap-2 text-muted ${fieldErr("proof")}`}>
                                <Upload className="size-4" /> <span className="truncate">Upload image</span>
                                <input id="proof" name="proof" type="file" accept="image/*" className="sr-only" />
                              </label>
                            </div>
                            <p className="text-xs text-muted sm:col-span-2">Pehle upar diye account mein {formatPrice(total)} bhejein, phir TID likhein ya screenshot upload karein. Payment verify hone ke baad order dispatch hoga.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-[24px] border border-line bg-white p-5 sm:p-7 lg:sticky lg:top-40">
          <h2 className="text-xl font-bold">Your order</h2>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <span className="relative shrink-0">
                  <Image src={i.image} alt="" width={56} height={56} className="size-14 rounded-xl object-cover" />
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-[11px] font-bold text-white">{i.qty}</span>
                </span>
                <span className="line-clamp-2 flex-1 text-sm">{i.name}</span>
                <span className="text-sm font-semibold">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} className={`input pl-9 ${fieldErr("coupon")}`} placeholder="Coupon code" aria-label="Coupon code" />
            </div>
            <button
              type="button"
              disabled={!coupon || checking}
              onClick={() =>
                startCheck(async () => {
                  const r = await checkCouponAction(coupon, subtotal);
                  if (r.ok) {
                    setApplied({ code: r.code, discount: r.discount, freeShipping: r.freeShipping });
                    setCouponMsg(`Coupon ${r.code} laga diya gaya.`);
                  } else {
                    setApplied(null);
                    setCouponMsg(r.error);
                  }
                })
              }
              className="btn-outline h-[42px] px-4"
            >
              {checking ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
            </button>
          </div>
          {couponMsg && <p className={`mt-2 text-sm ${applied ? "text-brand-700" : "text-sale"}`}>{couponMsg}</p>}

          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between text-brand-700"><dt>Discount</dt><dd>-{formatPrice(discount)}</dd></div>}
            <div className="flex justify-between"><dt>Delivery</dt><dd>{ship === 0 ? "Free" : formatPrice(ship)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-lg"><dt className="font-bold">Total</dt><dd className="font-extrabold text-brand-700">{formatPrice(total)}</dd></div>
          </dl>
          <p className="mt-2 text-xs text-muted">Expected delivery: {settings.deliveryTime}</p>

          {err && <p role="alert" className="mt-4 rounded-xl bg-sale/10 px-3 py-2.5 text-sm font-medium text-sale">{err.message}</p>}

          <button disabled={pending} className="btn-primary mt-5 h-[52px] w-full text-base">
            {pending ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-4" />} {pending ? "Placing order…" : `Place order (${formatPrice(total)})`}
          </button>
          <p className="mt-3 text-center text-xs text-muted">Order place karne se aap hamari terms aur return policy se agree karte hain.</p>
        </aside>
      </form>
    </div>
  );
}
