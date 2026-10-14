import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClusterPage } from "@/lib/data";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { Article, GuideLinks } from "@/components/store/article";

type Props = { params: Promise<{ pillar: string; cluster: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pillar, cluster } = await params;
  const data = await getClusterPage(pillar, cluster);
  if (!data) return {};
  const c = data.cluster;
  return { title: c.seoTitle || c.title, description: c.seoDescription || c.excerpt || undefined, alternates: { canonical: `/guides/${pillar}/${c.slug}` }, openGraph: { type: "article", images: c.coverImage ? [c.coverImage] : [] } };
}

export default async function ClusterPage({ params }: Props) {
  const { pillar: ps, cluster: cs } = await params;
  const data = await getClusterPage(ps, cs);
  if (!data) notFound();
  const { cluster, pillar, siblings } = data;
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: pillar.title, href: `/guides/${pillar.slug}` }, { label: cluster.title }]} />
      <Article
        page={cluster}
        eyebrow={<Link href={`/guides/${pillar.slug}`} className="inline-block rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 hover:bg-brand-100">Part of: {pillar.title}</Link>}
        aside={
          <>
            <GuideLinks title="Main guide" links={[{ href: `/guides/${pillar.slug}`, title: pillar.title }]} />
            <GuideLinks title="Related articles" links={siblings.map((s) => ({ href: `/guides/${pillar.slug}/${s.slug}`, title: s.title }))} />
          </>
        }
      />
    </div>
  );
}
