import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProductForm } from "../product-form";
import { deleteProduct } from "../actions";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requirePagePermission("products.manage");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [p] = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);
  if (!p) notFound();
  const margin = p.costPrice ? Number(p.price) - Number(p.costPrice) : null;
  return (
    <>
      <PageHeader
        title={p.name}
        back={{ href: "/admin/products", label: "Products" }}
        description={margin != null ? `Profit per piece: ${formatPrice(margin)} (${Math.round((margin / Number(p.price)) * 100)}%)` : undefined}
        actions={
          <>
            <a href={`/product/${p.slug}`} target="_blank" className="btn-outline"><ExternalLink className="size-4" /> View</a>
            <DeleteButton action={deleteProduct} id={p.id} label="Delete" redirectTo="/admin/products" className="btn border border-sale/30 bg-white text-sale hover:bg-sale/10" />
          </>
        }
      />
      {sp.created && <p className="mb-5 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">Product ban gaya. Ab ye website pe {p.isActive ? "live hai" : "hidden hai"}.</p>}
      <ProductForm p={p} />
    </>
  );
}
