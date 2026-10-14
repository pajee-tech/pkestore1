import type { Product } from "@/db/schema";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { Card, Field, Toggle } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/image-picker";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { NameSlugFields, SpecsField, StringListField } from "@/components/admin/list-editors";
import { CategorySelect } from "@/components/admin/category-select";
import { saveProduct } from "./actions";

export async function ProductForm({ p }: { p?: Product }) {
  return (
    <AdminForm action={saveProduct} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="min-w-0 space-y-6">
        <Card title="Basic info">
          <div className="grid gap-4">
            <NameSlugFields nameLabel="Product name" defaultName={p?.name} defaultSlug={p?.slug} prefix="/product/" />
            <Field label="Short description" htmlFor="shortDescription" hint="1–2 lines. Product page pe price ke neeche aur Google mein nazar aati hai.">
              <textarea id="shortDescription" name="shortDescription" rows={2} maxLength={500} defaultValue={p?.shortDescription || ""} className="input" />
            </Field>
          </div>
        </Card>
        <Card title="Images" description="Pehli image main image hai (cards aur Google pe). Arrows se order badlein.">
          <ImageField name="images" multiple defaultValue={p?.images || []} />
        </Card>
        <Card title="Full description">
          <MarkdownEditor name="description" defaultValue={p?.description} />
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Key features" description="Bullet points jo product page pe nazar aate hain.">
            <StringListField name="features" defaultValue={p?.features} />
          </Card>
          <Card title="Specifications">
            <SpecsField name="specs" defaultValue={p?.specs} />
          </Card>
        </div>
        <Card title="SEO" description="Khali chhorein to product name aur short description istemal hoti hai.">
          <div className="grid gap-4">
            <Field label="SEO title" htmlFor="seoTitle" hint="60 characters tak behtar."><input id="seoTitle" name="seoTitle" maxLength={191} defaultValue={p?.seoTitle || ""} className="input" /></Field>
            <Field label="Meta description" htmlFor="seoDescription" hint="150–160 characters."><textarea id="seoDescription" name="seoDescription" rows={2} maxLength={320} defaultValue={p?.seoDescription || ""} className="input" /></Field>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Publish">
          <div className="space-y-4">
            <Toggle name="isActive" defaultChecked={p ? p.isActive : true} label="Live on website" hint="Band karein to product hide ho jayega." />
            <Toggle name="isFeatured" defaultChecked={p?.isFeatured} label="Featured" hint="Homepage ke featured sections mein aayega." />
            <SubmitButton className="btn-primary h-11 w-full">{p ? "Save changes" : "Create product"}</SubmitButton>
          </div>
        </Card>
        <Card title="Category">
          <CategorySelect defaultValue={p?.categoryId} required />
        </Card>
        <Card title="Pricing & stock">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sale price (Rs)" htmlFor="price"><input id="price" name="price" type="number" min={1} required defaultValue={p?.price} className="input" /></Field>
            <Field label="Compare-at (Rs)" htmlFor="comparePrice" hint="Kata hua price"><input id="comparePrice" name="comparePrice" type="number" min={0} defaultValue={p?.comparePrice ?? ""} className="input" /></Field>
            <Field label="Stock" htmlFor="stock"><input id="stock" name="stock" type="number" min={0} defaultValue={p?.stock ?? 100} className="input" /></Field>
            <Field label="SKU" htmlFor="sku"><input id="sku" name="sku" defaultValue={p?.sku || ""} className="input" /></Field>
            <Field label="Badge" htmlFor="badge" hint="e.g. Hot, New" className="col-span-2"><input id="badge" name="badge" maxLength={40} defaultValue={p?.badge || ""} className="input" /></Field>
          </div>
        </Card>
        <Card title="Dropshipping (private)" description="Ye maloomat sirf admin ko nazar aati hai, website pe nahi.">
          <div className="grid gap-3">
            <Field label="Cost price (Rs)" htmlFor="costPrice"><input id="costPrice" name="costPrice" type="number" min={0} defaultValue={p?.costPrice ?? ""} className="input" /></Field>
            <Field label="Supplier name" htmlFor="supplierName"><input id="supplierName" name="supplierName" defaultValue={p?.supplierName || ""} className="input" /></Field>
            <Field label="Supplier product URL" htmlFor="supplierUrl"><input id="supplierUrl" name="supplierUrl" type="url" defaultValue={p?.supplierUrl || ""} className="input" placeholder="https://" /></Field>
            <Field label="Supplier SKU" htmlFor="supplierSku"><input id="supplierSku" name="supplierSku" defaultValue={p?.supplierSku || ""} className="input" /></Field>
            <Field label="Delivery time" htmlFor="deliveryDays"><input id="deliveryDays" name="deliveryDays" defaultValue={p?.deliveryDays || ""} className="input" placeholder="3–5 working days" /></Field>
          </div>
        </Card>
        <Card title="Display">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Rating" htmlFor="rating"><input id="rating" name="rating" type="number" step="0.1" min={0} max={5} defaultValue={p?.rating ?? 4.5} className="input" /></Field>
            <Field label="Reviews" htmlFor="reviewCount"><input id="reviewCount" name="reviewCount" type="number" min={0} defaultValue={p?.reviewCount ?? 0} className="input" /></Field>
            <Field label="Sort" htmlFor="sortOrder"><input id="sortOrder" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} className="input" /></Field>
          </div>
        </Card>
      </div>
    </AdminForm>
  );
}
