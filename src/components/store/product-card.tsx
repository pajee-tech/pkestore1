import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatPrice, discountPercent } from "@/lib/utils";
import type { ProductCard as PC } from "@/lib/data";
import { QuickAdd } from "./add-to-cart";

export function ProductCard({ p, priority = false }: { p: PC; priority?: boolean }) {
  const price = Number(p.price);
  const compare = p.comparePrice ? Number(p.comparePrice) : null;
  const off = discountPercent(price, compare);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand-200 hover:shadow-[0_12px_30px_-18px_rgba(14,94,84,.45)]">
      <Link href={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-paper">
        <Image
          src={p.images[0]}
          alt={p.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          {off > 0 && <span className="rounded-full bg-sale px-2 py-0.5 text-[11px] font-bold text-white">-{off}%</span>}
          {p.badge && <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">{p.badge}</span>}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-center gap-1 text-xs text-muted">
          <Star className="size-3.5 fill-saffron-500 text-saffron-500" />
          <span className="font-semibold text-ink">{Number(p.rating).toFixed(1)}</span>
          <span>({p.reviewCount})</span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-sans text-sm font-medium leading-snug tracking-normal sm:text-[15px]">
          <Link href={`/product/${p.slug}`} className="hover:text-brand-700">{p.name}</Link>
        </h3>
        <div className="mt-auto pt-2.5">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-base font-bold text-ink sm:text-lg">{formatPrice(price)}</span>
            {compare && compare > price && <span className="text-xs text-muted line-through sm:text-sm">{formatPrice(compare)}</span>}
          </p>
          <div className="mt-2.5">
            <QuickAdd product={{ id: p.id, slug: p.slug, name: p.name, price, image: p.images[0], stock: p.stock }} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: PC[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-5">
      {products.map((p, i) => (
        <ProductCard key={p.id} p={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
