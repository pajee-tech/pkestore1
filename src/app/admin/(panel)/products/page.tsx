import Link from "next/link";
import Image from "next/image";
import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { Plus, Pencil, Eye, EyeOff, Copy, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { Badge, Empty, PageHeader, Pagination, Table } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { ActionButton } from "@/components/admin/action-button";
import { getCategoryOptions } from "@/components/admin/category-select";
import { deleteProduct, duplicateProduct, toggleProduct } from "./actions";

export const metadata = { title: "Products" };
const PER = 30;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; status?: string; page?: string }> }) {
  await requirePagePermission("products.manage");
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const where = [];
  if (sp.q) {
    const t = `%${sp.q.replace(/[%_\\]/g, "\\$&")}%`;
    where.push(or(like(products.name, t), like(products.sku, t)));
  }
  if (sp.cat) {
    const cid = Number(sp.cat);
    const kids = (await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, cid))).map((k) => k.id);
    where.push(inArray(products.categoryId, [cid, ...kids]));
  }
  if (sp.status === "active") where.push(eq(products.isActive, true));
  if (sp.status === "hidden") where.push(eq(products.isActive, false));
  if (sp.status === "low") where.push(sql`${products.stock} < 10`);
  const cond = where.length ? and(...where) : undefined;

  const [rows, [{ n }], cats, tree] = await Promise.all([
    db
      .select({ id: products.id, name: products.name, slug: products.slug, sku: products.sku, price: products.price, comparePrice: products.comparePrice, stock: products.stock, images: products.images, isActive: products.isActive, isFeatured: products.isFeatured, categoryId: products.categoryId, soldCount: products.soldCount })
      .from(products)
      .where(cond)
      .orderBy(asc(products.sortOrder), desc(products.id))
      .limit(PER)
      .offset((page - 1) * PER),
    db.select({ n: sql<number>`count(*)` }).from(products).where(cond),
    db.select({ id: categories.id, name: categories.name }).from(categories),
    getCategoryOptions(),
  ]);
  const catName = new Map(cats.map((c) => [c.id, c.name]));
  const qs = new URLSearchParams(Object.entries({ q: sp.q || "", cat: sp.cat || "", status: sp.status || "" }).filter(([, v]) => v)).toString();

  return (
    <>
      <PageHeader title="Products" description={`${n} products. Naya product add karein, edit karein, hide karein ya delete karein.`} actions={<Link href="/admin/products/new" className="btn-primary"><Plus className="size-4" /> Add product</Link>} />
      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_220px_160px_auto]">
        <input name="q" defaultValue={sp.q} placeholder="Search by name or SKU" className="input" />
        <select name="cat" defaultValue={sp.cat || ""} className="input">
          <option value="">All categories</option>
          {tree.map((r) => (
            <optgroup key={r.id} label={r.name}>
              <option value={r.id}>All {r.name}</option>
              {r.children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          ))}
        </select>
        <select name="status" defaultValue={sp.status || ""} className="input">
          <option value="">Any status</option>
          <option value="active">Live</option>
          <option value="hidden">Hidden</option>
          <option value="low">Low stock</option>
        </select>
        <button className="btn-outline">Filter</button>
      </form>
      {rows.length === 0 ? (
        <Empty title="Koi product nahi mila" text="Filter hatayein ya naya product add karein." action={<Link href="/admin/products/new" className="btn-primary">Add product</Link>} />
      ) : (
        <Table head={["Product", "Category", "Price", "Stock", "Status", ""]}>
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-paper/60">
              <td className="min-w-[260px] px-4 py-3">
                <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                  <Image src={p.images[0] || "/seed/og-image.webp"} alt="" width={48} height={48} className="size-12 rounded-lg object-cover" />
                  <span className="min-w-0">
                    <span className="line-clamp-1 font-medium hover:text-brand-700">{p.name}</span>
                    <span className="text-xs text-muted">{p.sku || "No SKU"}, {p.soldCount} sold</span>
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{catName.get(p.categoryId) || "—"}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <b>{formatPrice(p.price)}</b>
                {p.comparePrice ? <span className="block text-xs text-muted line-through">{formatPrice(p.comparePrice)}</span> : null}
              </td>
              <td className="px-4 py-3">{p.stock < 10 ? <Badge className="bg-rose-100 text-rose-800">{p.stock}</Badge> : p.stock}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {p.isActive ? <Badge className="bg-emerald-100 text-emerald-800">Live</Badge> : <Badge>Hidden</Badge>}
                  {p.isFeatured && <Badge className="bg-saffron-100 text-amber-900">Featured</Badge>}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-0.5">
                  <Link href={`/admin/products/${p.id}`} className="grid size-8 place-items-center rounded-lg hover:bg-black/5" title="Edit" aria-label="Edit"><Pencil className="size-4" /></Link>
                  <a href={`/product/${p.slug}`} target="_blank" className="grid size-8 place-items-center rounded-lg hover:bg-black/5" title="View on site" aria-label="View on site"><ExternalLink className="size-4" /></a>
                  <ActionButton action={toggleProduct} id={p.id} title={p.isActive ? "Hide from website" : "Show on website"}>{p.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</ActionButton>
                  <ActionButton action={duplicateProduct} id={p.id} title="Duplicate"><Copy className="size-4" /></ActionButton>
                  <DeleteButton action={deleteProduct} id={p.id} confirmText={`"${p.name}" delete karna hai?`} />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
      <Pagination page={page} pages={Math.ceil(Number(n) / PER)} base={`/admin/products${qs ? `?${qs}` : ""}`} />
    </>
  );
}
