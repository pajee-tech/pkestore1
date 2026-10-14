import type { Metadata } from "next";
import Link from "next/link";
import { searchProducts } from "@/lib/data";
import { ProductGrid } from "@/components/store/product-card";
import { Breadcrumbs } from "@/components/store/breadcrumbs";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = await searchProducts(q);
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <h1 className="text-3xl font-extrabold">{q ? <>Results for &ldquo;{q}&rdquo;</> : "Search products"}</h1>
      <p className="mt-1 text-muted">{results.length} products found</p>
      <div className="mt-6">
        {results.length ? (
          <ProductGrid products={results} />
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <p className="font-semibold">Koi product nahi mila.</p>
            <p className="mt-1 text-sm text-muted">Spelling check karein ya doosra lafz try karein — jaise &ldquo;watch&rdquo;, &ldquo;charger&rdquo;, &ldquo;lamp&rdquo;.</p>
            <Link href="/shop" className="btn-primary mt-4">Browse all products</Link>
          </div>
        )}
      </div>
    </div>
  );
}
