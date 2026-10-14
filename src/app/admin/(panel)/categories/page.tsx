import Link from "next/link";
import Image from "next/image";
import { asc, sql } from "drizzle-orm";
import { Plus, Pencil, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { Badge, PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { ActionButton } from "@/components/admin/action-button";
import { deleteCategory, moveCategory } from "./actions";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requirePagePermission("categories.manage");
  const all = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.id));
  const counts = await db.select({ id: products.categoryId, n: sql<number>`count(*)` }).from(products).groupBy(products.categoryId);
  const cnt = new Map(counts.map((c) => [c.id, Number(c.n)]));
  const roots = all.filter((c) => !c.parentId);

  const Row = ({ c, child = false }: { c: (typeof all)[number]; child?: boolean }) => (
    <div className={`flex items-center gap-3 px-4 py-3 ${child ? "pl-10 sm:pl-16" : ""}`}>
      {c.image ? <Image src={c.image} alt="" width={44} height={44} className="size-11 rounded-lg object-cover" /> : <span className="size-11 rounded-lg bg-paper" />}
      <div className="min-w-0 flex-1">
        <Link href={`/admin/categories/${c.id}`} className={`font-medium hover:text-brand-700 ${child ? "" : "text-[15px] font-semibold"}`}>{c.name}</Link>
        <p className="text-xs text-muted">/category/{c.slug}, {cnt.get(c.id) || 0} products</p>
      </div>
      <div className="hidden gap-1 sm:flex">
        {!c.isActive && <Badge>Hidden</Badge>}
        {!child && !c.showInMenu && <Badge className="bg-amber-100 text-amber-900">Not in menu</Badge>}
      </div>
      <div className="flex items-center">
        <ActionButton action={moveCategory} id={c.id} extra={{ dir: "up" }} title="Move up"><ArrowUp className="size-4" /></ActionButton>
        <ActionButton action={moveCategory} id={c.id} extra={{ dir: "down" }} title="Move down"><ArrowDown className="size-4" /></ActionButton>
        <a href={`/category/${c.slug}`} target="_blank" className="grid size-8 place-items-center rounded-lg hover:bg-black/5" aria-label="View"><ExternalLink className="size-4" /></a>
        <Link href={`/admin/categories/${c.id}`} className="grid size-8 place-items-center rounded-lg hover:bg-black/5" aria-label="Edit"><Pencil className="size-4" /></Link>
        <DeleteButton action={deleteCategory} id={c.id} confirmText={`"${c.name}" delete karni hai?`} />
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Categories"
        description="Main categories mega menu mein aati hain, aur un ki sub-categories menu ke andar. Arrows se order badlein."
        actions={<Link href="/admin/categories/new" className="btn-primary"><Plus className="size-4" /> Add category</Link>}
      />
      <div className="space-y-3">
        {roots.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-2xl border border-line bg-white">
            <Row c={r} />
            <div className="divide-y divide-line border-t border-line bg-paper/40">
              {all.filter((c) => c.parentId === r.id).map((c) => <Row key={c.id} c={c} child />)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
