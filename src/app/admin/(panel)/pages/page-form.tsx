import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, pages, type Page } from "@/db/schema";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { Card, Field } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/image-picker";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { NameSlugFields } from "@/components/admin/list-editors";
import { PageTypeFields } from "./type-fields";
import { savePage } from "./actions";

export async function PageForm({ p, defaultType = "PAGE" }: { p?: Page; defaultType?: string }) {
  const [pillars, cats] = await Promise.all([
    db.select({ id: pages.id, name: pages.title }).from(pages).where(eq(pages.type, "PILLAR")).orderBy(asc(pages.title)),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
  ]);
  return (
    <AdminForm action={savePage} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="min-w-0 space-y-6">
        <Card title="Content">
          <div className="grid gap-4">
            <NameSlugFields nameField="title" nameLabel="Title" defaultName={p?.title} defaultSlug={p?.slug} prefix="/…/" />
            <Field label="Excerpt / intro" htmlFor="excerpt" hint="Title ke neeche aur listings mein nazar aata hai.">
              <textarea id="excerpt" name="excerpt" rows={2} maxLength={500} defaultValue={p?.excerpt || ""} className="input" />
            </Field>
            <div>
              <span className="label">Body</span>
              <MarkdownEditor name="content" defaultValue={p?.content} rows={22} placeholder={"## Pehli heading\n\nYahan apna content likhein…"} />
              <p className="mt-2 text-xs text-muted">Tip: Pillar guide mein har cluster article ka link dein, aur har cluster article mein pillar ka link — isi ko topic cluster kehte hain.</p>
            </div>
          </div>
        </Card>
        <Card title="SEO">
          <div className="grid gap-4">
            <Field label="SEO title" htmlFor="seoTitle"><input id="seoTitle" name="seoTitle" defaultValue={p?.seoTitle || ""} className="input" /></Field>
            <Field label="Meta description" htmlFor="seoDescription"><textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={p?.seoDescription || ""} className="input" /></Field>
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card title="Publish">
          <div className="space-y-4">
            <Field label="Status" htmlFor="status">
              <select id="status" name="status" defaultValue={p?.status || "DRAFT"} className="input">
                <option value="DRAFT">Draft (hidden)</option>
                <option value="PUBLISHED">Published (live)</option>
              </select>
            </Field>
            <SubmitButton className="btn-primary h-11 w-full">{p ? "Save changes" : "Create"}</SubmitButton>
          </div>
        </Card>
        <Card title="Type & placement">
          <PageTypeFields defaultType={p?.type || defaultType} defaultParent={p?.parentId} defaultCategory={p?.categoryId} defaultFooter={p?.showInFooter} pillars={pillars.filter((x) => x.id !== p?.id)} categories={cats} />
        </Card>
        <Card title="Cover image">
          <ImageField name="coverImage" defaultValue={p?.coverImage} aspect="wide" maxWidth={1400} />
        </Card>
        <Card title="Author">
          <input name="authorName" defaultValue={p?.authorName || ""} placeholder="PKeStore Team" className="input" aria-label="Author name" />
        </Card>
      </div>
    </AdminForm>
  );
}
