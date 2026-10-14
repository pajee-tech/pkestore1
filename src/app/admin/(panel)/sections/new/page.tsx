import { notFound } from "next/navigation";
import { SECTION_TYPES, type SectionType } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { SECTION_DEFS } from "@/lib/section-defs";
import { PageHeader } from "@/components/admin/ui";
import { SectionForm } from "../section-form";

export const metadata = { title: "Add section" };

export default async function NewSection({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requirePagePermission("sections.manage");
  const { type } = await searchParams;
  if (!type || !SECTION_TYPES.includes(type as SectionType)) notFound();
  return (
    <>
      <PageHeader title={`Add: ${SECTION_DEFS[type as SectionType].label}`} back={{ href: "/admin/sections", label: "Homepage" }} />
      <SectionForm type={type as SectionType} />
    </>
  );
}
