import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(n: number | string | null | undefined) {
  const v = Number(n || 0);
  return "Rs " + v.toLocaleString("en-PK", { maximumFractionDigits: 0 });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
}

export function discountPercent(price: number, compare?: number | null) {
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return base + path;
}

export function formatDate(d: Date | string | null | undefined, withTime = false) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Karachi",
  });
}

export function isSafeUrl(url: string) {
  return /^(\/(?!\/)|https?:\/\/|mailto:|tel:|#)/i.test(url.trim());
}

/** Pakistani mobile number ko 03XXXXXXXXX format mein laata hai */
export function normalizePhone(input: string) {
  let d = (input || "").replace(/\D/g, "");
  if (d.startsWith("0092")) d = d.slice(4);
  if (d.startsWith("92")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("3")) d = "0" + d;
  return d.slice(0, 15);
}
