import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteUrl } from "@/lib/utils";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: it.href ? siteUrl(it.href) : undefined })),
  };
  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        {all.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5" />}
            {it.href && i < all.length - 1 ? <Link href={it.href} className="hover:text-brand-700">{it.label}</Link> : <span className="line-clamp-1 text-ink">{it.label}</span>}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </nav>
  );
}
