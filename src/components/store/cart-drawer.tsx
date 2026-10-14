"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "./cart-context";
import { formatPrice } from "@/lib/utils";

export function CartDrawer({ freeShippingOver, shippingFee }: { freeShippingOver: number; shippingFee: number }) {
  const { items, open, setOpen, update, remove, subtotal } = useCart();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  if (!open) return null;
  const left = Math.max(freeShippingOver - subtotal, 0);
  const pct = freeShippingOver ? Math.min((subtotal / freeShippingOver) * 100, 100) : 100;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-xl font-bold">Your cart</h2>
          <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-black/5" aria-label="Close cart">
            <X className="size-5" />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="size-12 text-brand-200" />
            <p className="text-lg font-semibold">Cart abhi khali hai</p>
            <p className="text-sm text-muted">Products browse karein aur jo pasand aaye cart mein daalein.</p>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn-primary mt-2">Start shopping</Link>
          </div>
        ) : (
          <>
            {freeShippingOver > 0 && (
              <div className="border-b border-line px-5 py-3">
                <p className="text-sm">
                  {left > 0 ? (
                    <>Add <b>{formatPrice(left)}</b> more for free delivery</>
                  ) : (
                    <b className="text-brand-700">Free delivery unlocked</b>
                  )}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-50">
                  <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 py-4">
                  <Link href={`/product/${i.slug}`} onClick={() => setOpen(false)} className="shrink-0">
                    <Image src={i.image} alt={i.name} width={80} height={80} className="size-20 rounded-xl object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${i.slug}`} onClick={() => setOpen(false)} className="line-clamp-2 text-sm font-medium leading-snug">{i.name}</Link>
                    <p className="mt-1 text-sm font-bold text-brand-700">{formatPrice(i.price)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line">
                        <button onClick={() => update(i.id, i.qty - 1)} className="grid size-8 place-items-center" aria-label="Decrease quantity"><Minus className="size-3.5" /></button>
                        <span className="w-7 text-center text-sm font-semibold">{i.qty}</span>
                        <button onClick={() => update(i.id, i.qty + 1)} className="grid size-8 place-items-center" aria-label="Increase quantity"><Plus className="size-3.5" /></button>
                      </div>
                      <button onClick={() => remove(i.id)} className="grid size-8 place-items-center rounded-full text-muted hover:bg-black/5 hover:text-sale" aria-label={`Remove ${i.name}`}><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-5">
              <div className="flex justify-between text-sm"><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div>
              <div className="mt-1 flex justify-between text-sm text-muted"><span>Delivery</span><span>{left > 0 || !freeShippingOver ? formatPrice(shippingFee) : "Free"}</span></div>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn-primary mt-4 h-12 w-full text-base">Checkout</Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="mt-2 block text-center text-sm font-semibold text-brand-700 hover:underline">View full cart</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
