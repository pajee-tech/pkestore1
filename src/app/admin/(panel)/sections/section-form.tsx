import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories, type Section, type SectionType } from "@/db/schema";
import { SECTION_DEFS } from "@/lib/section-defs";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { Card, Field, Toggle } from "@/components/admin/ui";
import { SectionConfigEditor } from "@/components/admin/section-config-editor";
import { saveSection } from "./actions";

export async function SectionForm({ s, type }: { s?: Section; type: SectionType }) {
  const def = SECTION_DEFS[type];
  const cats = await db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name));
  return (
    <AdminForm action={saveSection} className="grid gap-6 xl:grid-cols-[1fr_300px]">
      {s && <input type="hidden" name="id" value={s.id} />}
      <input type="hidden" name="type" value={type} />
      <div className="min-w-0 space-y-6">
        {(def.title || def.subtitle) && (
          <Card title="Heading">
            <div className="grid gap-4">
              {def.title && <Field label="Title" htmlFor="title"><input id="title" name="title" defaultValue={s?.title || ""} className="input" /></Field>}
              {def.subtitle && <Field label="Subtitle" htmlFor="subtitle"><input id="subtitle" name="subtitle" defaultValue={s?.subtitle || ""} className="input" /></Field>}
            </div>
          </Card>
        )}
        <Card title="Settings" description={def.description}>
          <SectionConfigEditor def={def} initial={(s?.config as Record<string, unknown>) || {}} cats={cats} />
        </Card>
      </div>
      <div>
        <Card title="Publish">
          <div className="space-y-4">
            <Toggle name="isActive" defaultChecked={s ? s.isActive : true} label="Show on homepage" />
            <SubmitButton className="btn-primary h-11 w-full">{s ? "Save section" : "Add section"}</SubmitButton>
          </div>
        </Card>
      </div>
    </AdminForm>
  );
}
