import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPillarWithClusters } from "@/lib/data";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { Article, GuideLinks } from "@/components/store/article";

type Props = { params: Promise<{ pillar: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPillarWithClusters((await params).pillar);
  if (!data) return {};
  const p = data.pillar;
  return { title: p.seoTitle || p.title, description: p.seoDescription || p.excerpt || undefined, alternates: { canonical: `/guides/${p.slug}` }, openGraph: { type: "article", images: p.coverImage ? [p.coverImage] : [] } };
}

export default async function PillarPage({ params }: Props) {
  const data = await getPillarWithClusters((await params).pillar);
  if (!data) notFound();
  const { pillar, clusters } = data;
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: pillar.title }]} />
      <Article
        page={pillar}
        eyebrow={<span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">Complete guide</span>}
        aside={<GuideLinks title="Read next in this guide" links={clusters.map((c) => ({ href: `/guides/${pillar.slug}/${c.slug}`, title: c.title }))} />}
      />
    </div>
  );
}
