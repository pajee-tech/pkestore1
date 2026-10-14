import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageForm } from "../page-form";
import { deletePage } from "../actions";

export const metadata = { title: "Edit page" };

export default async function EditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requirePagePermission("content.manage");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [p] = await db.select().from(pages).where(eq(pages.id, Number(id))).limit(1);
  if (!p) notFound();
  let url = `/${p.slug}`;
  if (p.type === "PILLAR") url = `/guides/${p.slug}`;
  if (p.type === "CLUSTER" && p.parentId) {
    const [par] = await db.select({ slug: pages.slug }).from(pages).where(eq(pages.id, p.parentId)).limit(1);
    url = `/guides/${par?.slug}/${p.slug}`;
  }
  return (
    <>
      <PageHeader
        title={p.title}
        back={{ href: "/admin/pages", label: "Pages & guides" }}
        actions={
          <>
            {p.status === "PUBLISHED" && <a href={url} target="_blank" className="btn-outline"><ExternalLink className="size-4" /> View</a>}
            <DeleteButton action={deletePage} id={p.id} label="Delete" redirectTo="/admin/pages" className="btn border border-sale/30 bg-white text-sale hover:bg-sale/10" />
          </>
        }
      />
      {sp.created && <p className="mb-5 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">Ban gaya. Status &ldquo;Published&rdquo; karein to website pe live ho jayega.</p>}
      <PageForm p={p} />
    </>
  );
}
