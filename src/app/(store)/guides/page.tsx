import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getGuides } from "@/lib/data";
import { Breadcrumbs } from "@/components/store/breadcrumbs";

export const metadata: Metadata = { title: "Buying guides", description: "Products ke baare mein complete buying guides, tips aur comparisons.", alternates: { canonical: "/guides" } };

export default async function GuidesPage() {
  const pillars = await getGuides();
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Guides" }]} />
      <h1 className="text-3xl font-extrabold sm:text-5xl">Buying guides</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted">Sahi product chunne ke liye seedhi, kaam ki maloomat.</p>
      <div className="mt-10 space-y-14">
        {pillars.map((p) => (
          <section key={p.id} className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
            <Link href={`/guides/${p.slug}`} className="group block overflow-hidden rounded-[28px] border border-line bg-white">
              <span className="relative block aspect-[16/9]">{p.coverImage && <Image src={p.coverImage} alt="" fill sizes="(max-width:1024px) 100vw, 55vw" className="object-cover" />}</span>
              <span className="block p-6">
                <span className="text-sm font-semibold text-brand-700">Complete guide</span>
                <span className="mt-1 block font-display text-2xl font-bold group-hover:text-brand-700">{p.title}</span>
                {p.excerpt && <span className="mt-2 block text-muted">{p.excerpt}</span>}
              </span>
            </Link>
            <div>
              <h2 className="text-lg font-bold">Articles in this guide</h2>
              <ul className="mt-3 divide-y divide-line rounded-[24px] border border-line bg-white">
                {p.clusters.map((c) => (
                  <li key={c.id}>
                    <Link href={`/guides/${p.slug}/${c.slug}`} className="flex gap-4 p-4 hover:bg-paper">
                      {c.coverImage && <Image src={c.coverImage} alt="" width={112} height={63} className="h-[63px] w-28 shrink-0 rounded-lg object-cover" />}
                      <span>
                        <span className="block font-semibold leading-snug">{c.title}</span>
                        {c.excerpt && <span className="mt-1 line-clamp-2 block text-sm text-muted">{c.excerpt}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
                {!p.clusters.length && <li className="p-4 text-sm text-muted">Jald aa rahe hain.</li>}
              </ul>
            </div>
          </section>
        ))}
        {!pillars.length && <p className="text-muted">Abhi koi guide publish nahi hui.</p>}
      </div>
    </div>
  );
}
