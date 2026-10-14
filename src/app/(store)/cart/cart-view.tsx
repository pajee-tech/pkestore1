"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import { formatPrice } from "@/lib/utils";
import { shippingFor } from "@/lib/pricing";

export function CartView({ shippingFee, freeOver }: { shippingFee: number; freeOver: number }) {
  const { items, update, remove, subtotal, ready } = useCart();
  const ship = shippingFor(subtotal, shippingFee, freeOver);
  if (!ready) return <div className="container-x py-20" />;
  if (!items.length)
    return (
      <div className="container-x flex flex-col items-center py-24 text-center">
        <ShoppingBag className="size-14 text-brand-200" />
        <h1 className="mt-4 text-3xl font-extrabold">Cart khali hai</h1>
        <p className="mt-2 text-muted">Pasandida products cart mein daalein, phir checkout karein.</p>
        <Link href="/shop" className="btn-primary mt-6 h-12 px-7">Start shopping</Link>
      </div>
    );
  return (
    <div className="container-x py-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Your cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-line rounded-[24px] border border-line bg-white px-4 sm:px-6">
          {items.map((i) => (
            <li key={i.id} className="flex gap-4 py-5">
              <Link href={`/product/${i.slug}`} className="shrink-0"><Image src={i.image} alt={i.name} width={96} height={96} className="size-20 rounded-xl object-cover sm:size-24" /></Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${i.slug}`} className="line-clamp-2 font-medium hover:text-brand-700">{i.name}</Link>
                  <p className="mt-1 text-sm text-muted">{formatPrice(i.price)} each</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center rounded-full border border-line">
                    <button onClick={() => update(i.id, i.qty - 1)} className="grid size-9 place-items-center" aria-label="Decrease quantity"><Minus className="size-4" /></button>
                    <span className="w-8 text-center font-semibold">{i.qty}</span>
                    <button onClick={() => update(i.id, i.qty + 1)} className="grid size-9 place-items-center" aria-label="Increase quantity"><Plus className="size-4" /></button>
                  </div>
                  <b className="w-24 text-right">{formatPrice(i.price * i.qty)}</b>
                  <button onClick={() => remove(i.id)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-black/5 hover:text-sale" aria-label={`Remove ${i.name}`}><Trash2 className="size-4" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-[24px] border border-line bg-white p-6 lg:sticky lg:top-40">
          <h2 className="text-xl font-bold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-[15px]">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{ship === 0 ? "Free" : formatPrice(ship)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-lg"><dt className="font-bold">Total</dt><dd className="font-extrabold text-brand-700">{formatPrice(subtotal + ship)}</dd></div>
          </dl>
          {freeOver > 0 && subtotal < freeOver && <p className="mt-3 rounded-xl bg-saffron-100 px-3 py-2 text-sm">{formatPrice(freeOver - subtotal)} aur add karein aur free delivery payen.</p>}
          <Link href="/checkout" className="btn-primary mt-5 h-12 w-full text-base">Proceed to checkout</Link>
          <Link href="/shop" className="mt-3 block text-center text-sm font-semibold text-brand-700 hover:underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
