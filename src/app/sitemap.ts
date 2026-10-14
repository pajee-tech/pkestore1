import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { cats, prods, pgs } = await getSitemapData();
  const pillarSlug = new Map(pgs.filter((p) => p.type === "PILLAR").map((p) => [p.id, p.slug]));
  return [
    { url: siteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: siteUrl("/shop"), changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/guides"), changeFrequency: "weekly", priority: 0.6 },
    ...cats.map((c) => ({ url: siteUrl(`/category/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...prods.map((p) => ({ url: siteUrl(`/product/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...pgs.flatMap((p) => {
      if (p.type === "PAGE") return [{ url: siteUrl(`/${p.slug}`), lastModified: p.updatedAt, priority: 0.4 }];
      if (p.type === "PILLAR") return [{ url: siteUrl(`/guides/${p.slug}`), lastModified: p.updatedAt, priority: 0.6 }];
      const parent = p.parentId ? pillarSlug.get(p.parentId) : null;
      return parent ? [{ url: siteUrl(`/guides/${parent}/${p.slug}`), lastModified: p.updatedAt, priority: 0.5 }] : [];
    }),
  ];
}
