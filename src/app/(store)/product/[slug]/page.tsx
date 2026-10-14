import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Truck, ShieldCheck, RotateCcw, Banknote, Check } from "lucide-react";
import { getProductBySlug, getSettings } from "@/lib/data";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductBuyBox } from "@/components/store/add-to-cart";
import { ProductCard } from "@/components/store/product-card";
import { renderContent } from "@/lib/markdown";
import { discountPercent, formatPrice, siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) return {};
  const p = data.product;
  return {
    title: p.seoTitle || `${p.name} Price in Pakistan`,
    description: p.seoDescription || p.shortDescription || undefined,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { images: p.images.slice(0, 1), type: "website" },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [data, s] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!data) notFound();
  const { product: p, category, parent, related } = data;
  const price = Number(p.price);
  const compare = p.comparePrice ? Number(p.comparePrice) : null;
  const off = discountPercent(price, compare);
  const wa = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(`Assalam o Alaikum, mujhe ye product chahiye: ${p.name} (${siteUrl(`/product/${p.slug}`)})`)}`;

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images.map((i) => (i.startsWith("http") ? i : siteUrl(i))),
    description: p.shortDescription,
    sku: p.sku || String(p.id),
    brand: { "@type": "Brand", name: s.siteName },
    aggregateRating: p.reviewCount > 0 ? { "@type": "AggregateRating", ratingValue: Number(p.rating), reviewCount: p.reviewCount } : undefined,
    offers: {
      "@type": "Offer",
      url: siteUrl(`/product/${p.slug}`),
      priceCurrency: "PKR",
      price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="container-x">
      <Breadcrumbs
        items={[
          ...(parent ? [{ label: parent.name, href: `/category/${parent.slug}` }] : []),
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: p.name },
        ]}
      />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={p.images} name={p.name} />
        <div>
          {p.badge && <span className="inline-block rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">{p.badge}</span>}
          <h1 className="mt-3 text-[26px] font-extrabold leading-tight sm:text-4xl">{p.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, k) => (
                <Star key={k} className={`size-4 ${k < Math.round(Number(p.rating)) ? "fill-saffron-500 text-saffron-500" : "text-line"}`} />
              ))}
              <b className="ml-1">{Number(p.rating).toFixed(1)}</b>
              <span className="text-muted">({p.reviewCount} reviews)</span>
            </span>
            {p.soldCount > 0 && <span className="text-muted">{p.soldCount.toLocaleString()}+ sold</span>}
            {p.sku && <span className="text-muted">SKU: {p.sku}</span>}
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <span className="font-display text-4xl font-extrabold text-brand-700">{formatPrice(price)}</span>
            {compare && compare > price && (
              <>
                <span className="pb-1 text-lg text-muted line-through">{formatPrice(compare)}</span>
                <span className="mb-1 rounded-full bg-sale/10 px-2.5 py-1 text-sm font-bold text-sale">Save {off}%</span>
              </>
            )}
          </div>
          {p.shortDescription && <p className="mt-4 text-[16px] leading-relaxed text-ink/85">{p.shortDescription}</p>}

          {p.features && p.features.length > 0 && (
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {p.features.map((f, n) => (
                <li key={n} className="flex items-start gap-2 text-[15px]">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-600" /> {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 rounded-[22px] border border-line bg-white p-4 sm:p-5">
            <ProductBuyBox product={{ id: p.id, slug: p.slug, name: p.name, price, image: p.images[0], stock: p.stock }} />
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn mt-3 h-12 w-full bg-[#25D366] text-base text-white hover:bg-[#1fb457]">
              Order on WhatsApp
            </a>
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <li className="flex items-center gap-2.5 rounded-xl bg-white p-3 ring-1 ring-line"><Truck className="size-5 shrink-0 text-brand-700" /> Delivery in {p.deliveryDays || s.deliveryTime}</li>
            <li className="flex items-center gap-2.5 rounded-xl bg-white p-3 ring-1 ring-line"><Banknote className="size-5 shrink-0 text-brand-700" /> Cash on Delivery</li>
            <li className="flex items-center gap-2.5 rounded-xl bg-white p-3 ring-1 ring-line"><ShieldCheck className="size-5 shrink-0 text-brand-700" /> Check before you pay</li>
            <li className="flex items-center gap-2.5 rounded-xl bg-white p-3 ring-1 ring-line"><RotateCcw className="size-5 shrink-0 text-brand-700" /> 7-day easy return</li>
          </ul>
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="rounded-[24px] border border-line bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Product details</h2>
          <div className="prose-store mt-2" dangerouslySetInnerHTML={{ __html: renderContent(p.description) }} />
        </section>
        {p.specs && p.specs.length > 0 && (
          <section className="h-fit rounded-[24px] border border-line bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold">Specifications</h2>
            <dl className="mt-4 divide-y divide-line text-[15px]">
              {p.specs.map((sp, n) => (
                <div key={n} className="grid grid-cols-[42%_1fr] gap-3 py-2.5">
                  <dt className="text-muted">{sp.label}</dt>
                  <dd className="font-medium">{sp.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-2xl font-bold sm:text-[32px]">You may also like</h2>
            {category && <Link href={`/category/${parent?.slug || category.slug}`} className="text-sm font-semibold text-brand-700 hover:underline">More in {parent?.name || category.name}</Link>}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {related.slice(0, 4).map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </div>
  );
}
