import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sections } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { SECTION_DEFS } from "@/lib/section-defs";
import { PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { SectionForm } from "../section-form";
import { deleteSection } from "../actions";

export const metadata = { title: "Edit section" };

export default async function EditSection({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("sections.manage");
  const { id } = await params;
  const [s] = await db.select().from(sections).where(eq(sections.id, Number(id))).limit(1);
  if (!s || !SECTION_DEFS[s.type]) notFound();
  return (
    <>
      <PageHeader
        title={s.title || SECTION_DEFS[s.type].label}
        description={SECTION_DEFS[s.type].label}
        back={{ href: "/admin/sections", label: "Homepage" }}
        actions={<DeleteButton action={deleteSection} id={s.id} label="Remove section" redirectTo="/admin/sections" className="btn border border-sale/30 bg-white text-sale hover:bg-sale/10" />}
      />
      <SectionForm s={s} type={s.type} />
    </>
  );
}
