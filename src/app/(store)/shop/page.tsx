import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getAllActiveProducts, getCategoryTree, type ProductSort } from "@/lib/data";
import { ProductGrid } from "@/components/store/product-card";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { SortSelect } from "@/components/store/sort-select";

export const metadata: Metadata = { title: "Shop all products", description: "PKeStore ke tamam products — best prices aur Cash on Delivery.", alternates: { canonical: "/shop" } };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams;
  const [products, tree] = await Promise.all([getAllActiveProducts((sort as ProductSort) || "featured"), getCategoryTree()]);
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">All products</h1>
          <p className="mt-1 text-muted">{products.length} products</p>
        </div>
        <Suspense><SortSelect /></Suspense>
      </div>
      <ul className="scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {tree.map((c) => (
          <li key={c.id}><Link href={`/category/${c.slug}`} className="block whitespace-nowrap rounded-full border border-line bg-white px-4 py-2 text-sm font-medium hover:border-brand-500 hover:text-brand-700">{c.name}</Link></li>
        ))}
      </ul>
      <div className="mt-6"><ProductGrid products={products} priorityCount={4} /></div>
    </div>
  );
}
