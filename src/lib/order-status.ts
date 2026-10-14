import type { OrderStatus, PaymentMethod } from "@/db/schema";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Order received",
  CONFIRMED: "Confirmed",
  ORDERED_FROM_SUPPLIER: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const STATUS_ADMIN_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  ORDERED_FROM_SUPPLIER: "Ordered from supplier",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sky-100 text-sky-800",
  ORDERED_FROM_SUPPLIER: "bg-violet-100 text-violet-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
  RETURNED: "bg-slate-200 text-slate-700",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  COD: "Cash on Delivery",
  BANK: "Bank transfer",
  JAZZCASH: "JazzCash",
  EASYPAISA: "Easypaisa",
};

export const PAYMENT_STATUS_LABEL = {
  UNPAID: "Unpaid (COD)",
  PENDING_VERIFICATION: "Verification pending",
  PAID: "Paid",
  REFUNDED: "Refunded",
} as const;

export const TIMELINE: OrderStatus[] = ["PENDING", "CONFIRMED", "ORDERED_FROM_SUPPLIER", "SHIPPED", "DELIVERED"];
