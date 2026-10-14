"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-context";

export function CartButton() {
  const { count, setOpen, ready } = useCart();
  return (
    <button onClick={() => setOpen(true)} className="relative grid size-11 place-items-center rounded-full hover:bg-black/5" aria-label={`Cart, ${count} items`}>
      <ShoppingBag className="size-6" />
      {ready && count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-saffron-500 px-1 text-[11px] font-bold text-ink">{count}</span>
      )}
    </button>
  );
}
