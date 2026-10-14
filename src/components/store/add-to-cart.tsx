"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Minus, Plus, Zap } from "lucide-react";
import { useCart } from "./cart-context";

type P = { id: number; slug: string; name: string; price: number; image: string; stock: number };

export function QuickAdd({ product }: { product: P }) {
  const { add } = useCart();
  if (product.stock <= 0) return <span className="block rounded-full bg-black/5 py-2 text-center text-xs font-semibold text-muted">Out of stock</span>;
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        add({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image });
      }}
      className="flex w-full items-center justify-center gap-1.5 rounded-full border border-brand-700 py-2 text-[13px] font-semibold text-brand-700 transition hover:bg-brand-700 hover:text-white"
      aria-label={`Add ${product.name} to cart`}
    >
      <ShoppingBag className="size-4" /> Add to cart
    </button>
  );
}

export function ProductBuyBox({ product }: { product: P }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const out = product.stock <= 0;
  const item = { id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity</span>
        <div className="flex items-center rounded-full border border-line bg-white">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-10 place-items-center" aria-label="Decrease quantity"><Minus className="size-4" /></button>
          <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="grid size-10 place-items-center" aria-label="Increase quantity"><Plus className="size-4" /></button>
        </div>
        {product.stock > 0 && product.stock < 10 && <span className="text-sm font-semibold text-sale">Sirf {product.stock} baqi</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button disabled={out} onClick={() => add(item, qty)} className="btn-outline h-12 border-brand-700 text-base text-brand-700">
          <ShoppingBag className="size-5" /> {out ? "Out of stock" : "Add to cart"}
        </button>
        <button
          disabled={out}
          onClick={() => {
            add(item, qty);
            router.push("/checkout");
          }}
          className="btn-primary h-12 text-base"
        >
          <Zap className="size-5" /> Buy now
        </button>
      </div>
    </div>
  );
}
