"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const OPTIONS = [
  ["featured", "Featured"],
  ["popular", "Best selling"],
  ["newest", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
] as const;

export function SortSelect() {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">Sort by</span>
      <select
        value={sp.get("sort") || "featured"}
        onChange={(e) => {
          const p = new URLSearchParams(sp.toString());
          p.set("sort", e.target.value);
          router.push(`${pathname}?${p.toString()}`, { scroll: false });
        }}
        className="h-10 rounded-full border border-line bg-white px-4 pr-8 text-sm font-medium outline-none focus:border-brand-500"
      >
        {OPTIONS.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}
