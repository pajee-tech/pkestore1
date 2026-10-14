import Image from "next/image";
import Link from "next/link";
import type { Page } from "@/db/schema";
import { extractHeadings, renderContent } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { getProductList } from "@/lib/data";
import { ProductCard } from "./product-card";

export async function Article({ page, aside, eyebrow }: { page: Page; aside?: React.ReactNode; eyebrow?: React.ReactNode }) {
  const toc = extractHeadings(page.content).filter((h) => h.level === 2);
  const products = page.categoryId ? await getProductList({ source: "category", categoryId: page.categoryId, limit: 4 }) : [];
  return (
    <article>
      <header className="mx-auto max-w-3xl text-center">
        {eyebrow}
        <h1 className="mt-3 text-[32px] font-extrabold leading-[1.1] sm:text-5xl">{page.title}</h1>
        {page.excerpt && <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{page.excerpt}</p>}
        <p className="mt-4 text-sm text-muted">
          {page.authorName && <>By {page.authorName}, </>}
          updated {formatDate(page.updatedAt)}
        </p>
      </header>
      {page.coverImage && (
        <div className="relative mx-auto mt-8 aspect-[16/9] max-w-5xl overflow-hidden rounded-[28px]">
          <Image src={page.coverImage} alt="" fill priority sizes="(max-width: 1100px) 100vw, 1024px" className="object-cover" />
        </div>
      )}
      <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[240px_1fr_260px]">
        <nav aria-label="On this page" className="hidden lg:block">
          {toc.length > 0 && (
            <div className="sticky top-40">
              <p className="text-sm font-semibold">On this page</p>
              <ul className="mt-3 space-y-2 border-l border-line text-sm">
                {toc.map((h) => (
                  <li key={h.id}><a href={`#${h.id}`} className="-ml-px block border-l-2 border-transparent pl-3 text-muted hover:border-brand-700 hover:text-ink">{h.text}</a></li>
                ))}
              </ul>
            </div>
          )}
        </nav>
        <div className="prose-store min-w-0" dangerouslySetInnerHTML={{ __html: renderContent(page.content) }} />
        <aside className="space-y-6">{aside}</aside>
      </div>
      {products.length > 0 && (
        <section className="mx-auto mt-14 max-w-6xl">
          <h2 className="mb-5 text-2xl font-bold">Products mentioned in this guide</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
      )}
    </article>
  );
}

export function GuideLinks({ title, links }: { title: string; links: { href: string; title: string; active?: boolean }[] }) {
  if (!links.length) return null;
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="font-display font-bold">{title}</p>
      <ul className="mt-3 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}><Link href={l.href} className={l.active ? "font-semibold text-brand-700" : "text-ink/80 hover:text-brand-700"}>{l.title}</Link></li>
        ))}
      </ul>
    </div>
  );
}
