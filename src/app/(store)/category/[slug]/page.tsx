import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategoryBySlug, getProductsInCategories, type ProductSort } from "@/lib/data";
import { ProductGrid } from "@/components/store/product-card";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { SortSelect } from "@/components/store/sort-select";
import { renderContent } from "@/lib/markdown";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryBySlug(slug);
  if (!data) return {};
  const c = data.category;
  return {
    title: c.seoTitle || `${c.name} – Best Price in Pakistan`,
    description: c.seoDescription || c.description || undefined,
    alternates: { canonical: `/category/${c.slug}` },
    openGraph: { images: c.image ? [c.image] : [] },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { sort }] = await Promise.all([params, searchParams]);
  const data = await getCategoryBySlug(slug);
  if (!data) notFound();
  const { category, children, parent, siblings } = data;
  const ids = [category.id, ...children.map((c) => c.id)];
  const products = await getProductsInCategories(ids, (sort as ProductSort) || "featured");
  const chips = children.length ? children : siblings;

  return (
    <div className="container-x">
      <Breadcrumbs items={[...(parent ? [{ label: parent.name, href: `/category/${parent.slug}` }] : []), { label: category.name }]} />
      <header className="grid items-center gap-5 overflow-hidden rounded-[28px] border border-line bg-white sm:grid-cols-[1fr_auto]">
        <div className="p-6 sm:p-8 lg:p-10">
          <h1 className="text-3xl font-extrabold sm:text-[40px]">{category.name}</h1>
          {category.description && <p className="mt-2 max-w-2xl text-[15px] text-muted sm:text-base">{category.description}</p>}
          <p className="mt-3 text-sm font-semibold text-brand-700">{products.length} products</p>
        </div>
        {category.image && (
          <div className="relative hidden aspect-square h-56 sm:block lg:h-64">
            <Image src={category.image} alt={category.name} fill sizes="256px" className="object-cover" priority />
          </div>
        )}
      </header>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {chips.length > 0 ? (
          <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {parent && (
              <li><Link href={`/category/${parent.slug}`} className="block whitespace-nowrap rounded-full border border-line bg-white px-4 py-2 text-sm font-medium hover:border-brand-500">All {parent.name}</Link></li>
            )}
            {chips.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/category/${c.slug}`}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-medium ${c.id === category.id ? "border-brand-700 bg-brand-700 text-white" : "border-line bg-white hover:border-brand-500 hover:text-brand-700"}`}
                >
                  {c.image && <Image src={c.image} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />}
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : <span />}
        <Suspense><SortSelect /></Suspense>
      </div>

      <div className="mt-6">
        {products.length ? (
          <ProductGrid products={products} priorityCount={4} />
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <p className="font-semibold">Is category mein abhi products nahi hain.</p>
            <Link href="/shop" className="btn-primary mt-4">Browse all products</Link>
          </div>
        )}
      </div>

      {category.content && (
        <section className="mt-14 rounded-[28px] border border-line bg-white p-6 sm:p-10">
          <div className="prose-store max-w-3xl" dangerouslySetInnerHTML={{ __html: renderContent(category.content) }} />
        </section>
      )}
    </div>
  );
}
