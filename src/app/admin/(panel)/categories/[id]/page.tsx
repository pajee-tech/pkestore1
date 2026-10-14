import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { CategoryForm } from "../category-form";
import { deleteCategory } from "../actions";

export const metadata = { title: "Edit category" };

export default async function EditCategory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requirePagePermission("categories.manage");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [c] = await db.select().from(categories).where(eq(categories.id, Number(id))).limit(1);
  if (!c) notFound();
  return (
    <>
      <PageHeader
        title={c.name}
        back={{ href: "/admin/categories", label: "Categories" }}
        actions={
          <>
            <a href={`/category/${c.slug}`} target="_blank" className="btn-outline"><ExternalLink className="size-4" /> View</a>
            <DeleteButton action={deleteCategory} id={c.id} label="Delete" redirectTo="/admin/categories" className="btn border border-sale/30 bg-white text-sale hover:bg-sale/10" />
          </>
        }
      />
      {sp.created && <p className="mb-5 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">Category ban gayi.</p>}
      <CategoryForm c={c} />
    </>
  );
}
