import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Section } from "@/db/schema";
import { getCategoryTree, getLatestGuides, getProductList } from "@/lib/data";
import { renderContent } from "@/lib/markdown";
import { HeroSlider, type Slide } from "./hero-slider";
import { ProductCard } from "./product-card";
import { DynIcon } from "./icons";
import { NewsletterForm } from "./newsletter-form";

type Cfg = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");
const arr = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);

function SectionHead({ title, subtitle, link, linkText = "View all" }: { title?: string | null; subtitle?: string | null; link?: string; linkText?: string }) {
  if (!title) return null;
  return (
    <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
      <div>
        <h2 className="text-2xl font-bold sm:text-[32px]">{title}</h2>
        {subtitle && <p className="mt-1 text-[15px] text-muted sm:text-base">{subtitle}</p>}
      </div>
      {link && (
        <Link href={link} className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold hover:border-brand-500 hover:text-brand-700">
          {linkText}
        </Link>
      )}
    </div>
  );
}

async function ProductsSection({ s, c }: { s: Section; c: Cfg }) {
  const source = (str(c.source) || "featured") as "featured" | "latest" | "popular" | "sale" | "category";
  const list = await getProductList({ source, categoryId: Number(c.categoryId) || undefined, limit: Number(c.limit) || 8 });
  if (!list.length) return null;
  const layout = str(c.layout) || "grid";
  return (
    <section className="container-x mt-14 sm:mt-20">
      <SectionHead title={s.title} subtitle={s.subtitle} link={str(c.viewAllLink) || undefined} />
      {layout === "row" ? (
        <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:px-0">
          {list.map((p) => (
            <div key={p.id} className="w-[46%] shrink-0 snap-start xs:w-[44%] sm:w-[31%] lg:w-[23.5%] xl:w-[19%]">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-5">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </section>
  );
}

async function CategoriesSection({ s }: { s: Section }) {
  const tree = await getCategoryTree();
  return (
    <section className="container-x mt-12 sm:mt-16">
      <SectionHead title={s.title} subtitle={s.subtitle} link="/shop" linkText="All products" />
      <ul className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-x-3 sm:gap-y-5 sm:overflow-visible sm:px-0 lg:grid-cols-10">
        {tree.map((c) => (
          <li key={c.id} className="w-[23%] shrink-0 sm:w-auto">
            <Link href={`/category/${c.slug}`} className="group flex flex-col items-center text-center">
              <span className="relative block aspect-square w-full max-w-[120px] overflow-hidden rounded-[30%] bg-white ring-1 ring-line transition group-hover:ring-2 group-hover:ring-brand-500">
                {c.image ? (
                  <Image src={c.image} alt="" fill sizes="120px" className="object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <span className="grid size-full place-items-center text-brand-700"><DynIcon name={c.icon} className="size-8" /></span>
                )}
              </span>
              <span className="mt-2 text-[13px] font-semibold leading-tight sm:text-sm">{c.name}</span>
              <span className="text-xs text-muted">{c.productCount} items</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

type BannerItem = { image: string; title: string; text?: string; buttonText?: string; buttonLink?: string; dark?: boolean };

function BannerCard({ b, tall = false }: { b: BannerItem; tall?: boolean }) {
  return (
    <Link href={b.buttonLink || "#"} className={`group relative block overflow-hidden rounded-[24px] ${tall ? "aspect-[16/10] sm:aspect-[16/6]" : "aspect-[2/1]"}`}>
      {b.image && <Image src={b.image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-right transition duration-700 group-hover:scale-[1.03]" />}
      <div className={`absolute inset-0 flex flex-col justify-center p-5 sm:p-8 ${b.dark ? "text-white" : "text-ink"}`}>
        <div className="max-w-[60%]">
          <h3 className="text-xl font-extrabold leading-tight sm:text-3xl">{b.title}</h3>
          {b.text && <p className={`mt-1.5 text-sm sm:text-base ${b.dark ? "text-white/80" : "text-ink/75"}`}>{b.text}</p>}
          {b.buttonText && <span className={`mt-3 inline-flex rounded-full px-4 py-2 text-sm font-semibold sm:mt-5 ${b.dark ? "bg-saffron-500 text-ink" : "bg-ink text-white"}`}>{b.buttonText}</span>}
        </div>
      </div>
    </Link>
  );
}

async function GuidesSection({ s, c }: { s: Section; c: Cfg }) {
  const guides = await getLatestGuides(Number(c.limit) || 3);
  if (!guides.length) return null;
  return (
    <section className="container-x mt-14 sm:mt-20">
      <SectionHead title={s.title} subtitle={s.subtitle} link="/guides" linkText="All guides" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {guides.map((g) => (
          <Link key={g.id} href={g.href} className="group overflow-hidden rounded-2xl border border-line bg-white hover:border-brand-200">
            <span className="relative block aspect-[16/9] bg-paper">
              {g.coverImage && <Image src={g.coverImage} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />}
            </span>
            <span className="block p-5">
              <span className="text-xs font-semibold text-brand-700">{g.type === "PILLAR" ? "Complete guide" : "Article"}</span>
              <span className="mt-1 block font-display text-lg font-bold leading-snug group-hover:text-brand-700">{g.title}</span>
              {g.excerpt && <span className="mt-2 line-clamp-2 block text-sm text-muted">{g.excerpt}</span>}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function RenderSection({ s }: { s: Section }) {
  const c = (s.config || {}) as Cfg;
  switch (s.type) {
    case "hero": {
      const slides = arr<Slide>(c.slides).filter((x) => x.image && x.title);
      return slides.length ? <HeroSlider slides={slides} /> : null;
    }
    case "usp": {
      const items = arr<{ icon: string; title: string; text: string }>(c.items);
      return (
        <section className="container-x mt-6">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
            {items.map((it, n) => (
              <li key={n} className="flex items-center gap-3 bg-white p-4 sm:p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><DynIcon name={it.icon} className="size-5" /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold sm:text-[15px]">{it.title}</span>
                  <span className="block text-xs text-muted sm:text-sm">{it.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      );
    }
    case "categories":
      return <CategoriesSection s={s} />;
    case "products":
      return <ProductsSection s={s} c={c} />;
    case "banner": {
      const b = { image: str(c.image), title: s.title || "", text: s.subtitle || "", buttonText: str(c.buttonText), buttonLink: str(c.buttonLink), dark: c.dark === true };
      return (
        <section className="container-x mt-14 sm:mt-20">
          <BannerCard b={b} tall />
        </section>
      );
    }
    case "dual_banner": {
      const items = arr<BannerItem>(c.items).slice(0, 2);
      return (
        <section className="container-x mt-14 grid gap-4 sm:mt-20 md:grid-cols-2 lg:gap-6">
          {items.map((b, n) => (
            <BannerCard key={n} b={b} />
          ))}
        </section>
      );
    }
    case "testimonials": {
      const items = arr<{ name: string; city: string; text: string; rating: number }>(c.items);
      return (
        <section className="container-x mt-14 sm:mt-20">
          <SectionHead title={s.title} subtitle={s.subtitle} />
          <ul className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:px-0">
            {items.map((t, n) => (
              <li key={n} className="w-[85%] shrink-0 snap-start rounded-2xl border border-line bg-white p-6 md:w-auto">
                <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, k) => (
                    <Star key={k} className={`size-4 ${k < (t.rating || 5) ? "fill-saffron-500 text-saffron-500" : "text-line"}`} />
                  ))}
                </div>
                <p className="mt-3 text-[15px] leading-relaxed">{t.text}</p>
                <p className="mt-4 text-sm font-semibold">
                  {t.name}
                  <span className="font-normal text-muted">, {t.city}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      );
    }
    case "guides":
      return <GuidesSection s={s} c={c} />;
    case "newsletter":
      return (
        <section className="container-x mt-14 sm:mt-20">
          <div className="grid items-center gap-6 rounded-[28px] bg-brand-700 px-6 py-10 text-white sm:px-10 md:grid-cols-2 lg:px-14">
            <div>
              <h2 className="text-2xl font-bold sm:text-[32px]">{s.title || "Get deals first"}</h2>
              {s.subtitle && <p className="mt-2 text-white/80">{s.subtitle}</p>}
            </div>
            <NewsletterForm dark />
          </div>
        </section>
      );
    case "richtext":
      return (
        <section className="container-x mt-14 sm:mt-20">
          {s.title && <h2 className="mb-4 text-2xl font-bold sm:text-[32px]">{s.title}</h2>}
          <div className="prose-store max-w-3xl" dangerouslySetInnerHTML={{ __html: renderContent(str(c.content)) }} />
        </section>
      );
    default:
      return null;
  }
}
