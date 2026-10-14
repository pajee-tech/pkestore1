import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { pages, type PageType } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge, Empty, PageHeader, Table } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deletePage } from "./actions";

export const metadata = { title: "Pages & guides" };

const TABS: { key: string; label: string }[] = [
  { key: "", label: "All" },
  { key: "PAGE", label: "Pages" },
  { key: "PILLAR", label: "Pillar guides" },
  { key: "CLUSTER", label: "Cluster articles" },
];
const TYPE_LABEL: Record<PageType, string> = { PAGE: "Page", PILLAR: "Pillar", CLUSTER: "Cluster" };

export default async function PagesAdmin({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requirePagePermission("content.manage");
  const { type = "" } = await searchParams;
  const rows = await db
    .select()
    .from(pages)
    .where(type ? eq(pages.type, type as PageType) : undefined)
    .orderBy(asc(pages.type), desc(pages.updatedAt));
  const pillars = new Map(rows.filter((r) => r.type === "PILLAR").map((r) => [r.id, r]));
  const all = type === "CLUSTER" ? new Map((await db.select().from(pages).where(eq(pages.type, "PILLAR"))).map((r) => [r.id, r])) : pillars;
  const url = (p: (typeof rows)[number]) =>
    p.type === "PAGE" ? `/${p.slug}` : p.type === "PILLAR" ? `/guides/${p.slug}` : `/guides/${all.get(p.parentId!)?.slug || "x"}/${p.slug}`;

  return (
    <>
      <PageHeader
        title="Pages & guides"
        description="Pages: About, Contact, policies. Pillar guide: kisi topic ki mukammal guide. Cluster article: pillar ke andar chhote, specific articles jo pillar ko link karte hain (SEO ke liye)."
        actions={
          <>
            <Link href="/admin/pages/new?type=PAGE" className="btn-outline"><Plus className="size-4" /> Page</Link>
            <Link href="/admin/pages/new?type=PILLAR" className="btn-outline"><Plus className="size-4" /> Pillar</Link>
            <Link href="/admin/pages/new?type=CLUSTER" className="btn-primary"><Plus className="size-4" /> Cluster</Link>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t.key} href={t.key ? `/admin/pages?type=${t.key}` : "/admin/pages"} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${type === t.key ? "bg-brand-700 text-white" : "bg-white text-ink ring-1 ring-line hover:ring-brand-500"}`}>
            {t.label}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <Empty title="Abhi kuch nahi" action={<Link href="/admin/pages/new" className="btn-primary">Create</Link>} />
      ) : (
        <Table head={["Title", "Type", "Status", "Updated", ""]}>
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-paper/60">
              <td className="px-4 py-3">
                <Link href={`/admin/pages/${p.id}`} className="font-medium hover:text-brand-700">{p.title}</Link>
                <p className="text-xs text-muted">
                  {url(p)}
                  {p.type === "CLUSTER" && p.parentId && <> (in: {all.get(p.parentId)?.title || "—"})</>}
                </p>
              </td>
              <td className="px-4 py-3"><Badge className={p.type === "PILLAR" ? "bg-violet-100 text-violet-800" : p.type === "CLUSTER" ? "bg-sky-100 text-sky-800" : undefined}>{TYPE_LABEL[p.type]}</Badge></td>
              <td className="px-4 py-3">{p.status === "PUBLISHED" ? <Badge className="bg-emerald-100 text-emerald-800">Published</Badge> : <Badge className="bg-amber-100 text-amber-900">Draft</Badge>}</td>
              <td className="px-4 py-3 text-muted">{formatDate(p.updatedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  {p.status === "PUBLISHED" && <a href={url(p)} target="_blank" className="grid size-8 place-items-center rounded-lg hover:bg-black/5" aria-label="View"><ExternalLink className="size-4" /></a>}
                  <Link href={`/admin/pages/${p.id}`} className="grid size-8 place-items-center rounded-lg hover:bg-black/5" aria-label="Edit"><Pencil className="size-4" /></Link>
                  <DeleteButton action={deletePage} id={p.id} confirmText={`"${p.title}" delete karna hai?`} />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
