import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default async function CartPage() {
  const s = await getSettings();
  return <CartView shippingFee={s.shippingFee} freeOver={s.freeShippingOver} />;
}
