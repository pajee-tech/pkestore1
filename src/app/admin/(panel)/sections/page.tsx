import Link from "next/link";
import { asc } from "drizzle-orm";
import { Pencil, ArrowUp, ArrowDown, Eye, EyeOff, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { sections, SECTION_TYPES } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { SECTION_DEFS } from "@/lib/section-defs";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { ActionButton } from "@/components/admin/action-button";
import { deleteSection, moveSection, toggleSection } from "./actions";

export const metadata = { title: "Homepage" };

export default async function SectionsPage() {
  await requirePagePermission("sections.manage");
  const rows = await db.select().from(sections).orderBy(asc(sections.sortOrder), asc(sections.id));
  return (
    <>
      <PageHeader
        title="Homepage sections"
        description="Homepage upar se neeche isi tarteeb mein banta hai. Arrows se order badlein, aankh se hide/show karein, pencil se edit."
        actions={<a href="/" target="_blank" className="btn-outline"><ExternalLink className="size-4" /> View homepage</a>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <ol className="space-y-2">
          {rows.map((s, i) => {
            const def = SECTION_DEFS[s.type];
            return (
              <li key={s.id} className={`flex items-center gap-3 rounded-2xl border border-line bg-white p-3 pl-4 ${s.isActive ? "" : "opacity-60"}`}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-paper text-sm font-bold text-muted">{i + 1}</span>
                <Link href={`/admin/sections/${s.id}`} className="min-w-0 flex-1">
                  <span className="block truncate font-semibold hover:text-brand-700">{s.title || def?.label || s.type}</span>
                  <span className="block text-xs text-muted">{def?.label}</span>
                </Link>
                {!s.isActive && <Badge>Hidden</Badge>}
                <div className="flex">
                  <ActionButton action={moveSection} id={s.id} extra={{ dir: "up" }} title="Move up"><ArrowUp className="size-4" /></ActionButton>
                  <ActionButton action={moveSection} id={s.id} extra={{ dir: "down" }} title="Move down"><ArrowDown className="size-4" /></ActionButton>
                  <ActionButton action={toggleSection} id={s.id} title={s.isActive ? "Hide" : "Show"}>{s.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</ActionButton>
                  <Link href={`/admin/sections/${s.id}`} className="grid size-8 place-items-center rounded-lg hover:bg-black/5" aria-label="Edit"><Pencil className="size-4" /></Link>
                  <DeleteButton action={deleteSection} id={s.id} confirmText="Ye section homepage se hata dein?" />
                </div>
              </li>
            );
          })}
        </ol>
        <Card title="Add a section" description="Naya section homepage ke aakhir mein add hota hai.">
          <ul className="-my-1 space-y-1">
            {SECTION_TYPES.map((t) => (
              <li key={t}>
                <Link href={`/admin/sections/new?type=${t}`} className="block rounded-xl px-3 py-2 hover:bg-paper">
                  <span className="block text-sm font-semibold">{SECTION_DEFS[t].label}</span>
                  <span className="block text-xs text-muted">{SECTION_DEFS[t].description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
