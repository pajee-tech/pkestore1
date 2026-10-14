import type { Category } from "@/db/schema";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { Card, Field, Toggle } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/image-picker";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { NameSlugFields } from "@/components/admin/list-editors";
import { CategorySelect } from "@/components/admin/category-select";
import { ICON_NAMES } from "@/components/store/icons";
import { saveCategory } from "./actions";

export function CategoryForm({ c }: { c?: Category }) {
  return (
    <AdminForm action={saveCategory} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="min-w-0 space-y-6">
        <Card title="Category details">
          <div className="grid gap-4">
            <NameSlugFields nameLabel="Category name" defaultName={c?.name} defaultSlug={c?.slug} prefix="/category/" />
            <Field label="Short description" htmlFor="description" hint="Category page ke upar aur mega menu mein nazar aati hai.">
              <textarea id="description" name="description" rows={2} defaultValue={c?.description || ""} className="input" />
            </Field>
          </div>
        </Card>
        <Card title="SEO content (page ke neeche)" description="Google ranking ke liye category ke baare mein 150–300 words. Optional.">
          <MarkdownEditor name="content" defaultValue={c?.content} rows={10} />
        </Card>
        <Card title="SEO">
          <div className="grid gap-4">
            <Field label="SEO title" htmlFor="seoTitle"><input id="seoTitle" name="seoTitle" defaultValue={c?.seoTitle || ""} className="input" /></Field>
            <Field label="Meta description" htmlFor="seoDescription"><textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={c?.seoDescription || ""} className="input" /></Field>
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card title="Publish">
          <div className="space-y-4">
            <Toggle name="isActive" defaultChecked={c ? c.isActive : true} label="Visible on website" />
            <Toggle name="showInMenu" defaultChecked={c ? c.showInMenu : true} label="Show in mega menu" />
            <SubmitButton className="btn-primary h-11 w-full">{c ? "Save changes" : "Create category"}</SubmitButton>
          </div>
        </Card>
        <Card title="Parent category" description="Khali chhorein to ye main category banegi.">
          <CategorySelect name="parentId" defaultValue={c?.parentId} allowNone noneLabel="— Main category —" rootsOnly excludeId={c?.id} />
        </Card>
        <Card title="Image">
          <ImageField name="image" defaultValue={c?.image} maxWidth={900} />
        </Card>
        <Card title="Menu icon & order">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Icon" htmlFor="icon">
              <select id="icon" name="icon" defaultValue={c?.icon || ""} className="input">
                <option value="">Default</option>
                {ICON_NAMES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Sort order" htmlFor="sortOrder"><input id="sortOrder" name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} className="input" /></Field>
          </div>
        </Card>
      </div>
    </AdminForm>
  );
}
