import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const s = await getSettings();
  return (
    <CheckoutForm
      settings={{
        shippingFee: s.shippingFee,
        freeOver: s.freeShippingOver,
        deliveryTime: s.deliveryTime,
        methods: {
          COD: s.codEnabled ? { label: "Cash on Delivery", info: "Parcel milne pe rider ko payment karein." } : null,
          JAZZCASH: s.jazzcashEnabled ? { label: "JazzCash", info: `Account: ${s.jazzcashNumber}\nName: ${s.jazzcashName}` } : null,
          EASYPAISA: s.easypaisaEnabled ? { label: "Easypaisa", info: `Account: ${s.easypaisaNumber}\nName: ${s.easypaisaName}` } : null,
          BANK: s.bankEnabled ? { label: "Bank transfer", info: s.bankDetails } : null,
        },
      }}
    />
  );
}
