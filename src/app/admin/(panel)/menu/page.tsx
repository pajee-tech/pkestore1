import { asc } from "drizzle-orm";
import { ArrowUp, ArrowDown } from "lucide-react";
import { db } from "@/db";
import { menuItems, MENU_LOCATIONS, type MenuItem } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { Card, PageHeader } from "@/components/admin/ui";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { ActionButton } from "@/components/admin/action-button";
import { deleteMenuItem, moveMenuItem, saveMenuItem } from "./actions";

export const metadata = { title: "Menus" };

const LOC: Record<(typeof MENU_LOCATIONS)[number], { label: string; hint: string }> = {
  HEADER: { label: "Header links", hint: "Mega menu bar ke right side (Deals, Guides…). Categories khud mega menu mein aati hain." },
  FOOTER_SHOP: { label: "Footer: Shop column", hint: "Khali chhorein to categories khud dikhengi." },
  FOOTER_HELP: { label: "Footer: Help column", hint: "'Footer mein dikhayein' wale pages bhi yahan khud add hote hain." },
  TOPBAR: { label: "Top bar (reserved)", hint: "Abhi istemal nahi ho raha." },
};

function Row({ m }: { m: MenuItem }) {
  return (
    <AdminForm action={saveMenuItem} className="grid items-center gap-2 border-b border-line py-3 last:border-0 sm:grid-cols-[1fr_1.4fr_auto_auto]">
      <input type="hidden" name="id" value={m.id} />
      <input type="hidden" name="location" value={m.location} />
      <input name="label" defaultValue={m.label} className="input" aria-label="Label" />
      <input name="url" defaultValue={m.url} className="input" aria-label="Link" />
      <div className="flex items-center gap-3 text-xs">
        <label className="flex items-center gap-1"><input type="checkbox" name="isActive" defaultChecked={m.isActive} className="accent-brand-700" /> Live</label>
        <label className="flex items-center gap-1"><input type="checkbox" name="openInNewTab" defaultChecked={m.openInNewTab} className="accent-brand-700" /> New tab</label>
      </div>
      <SubmitButton className="btn-outline px-4 py-2">Save</SubmitButton>
    </AdminForm>
  );
}

export default async function MenuPage() {
  await requirePagePermission("menu.manage");
  const rows = await db.select().from(menuItems).orderBy(asc(menuItems.sortOrder), asc(menuItems.id));
  return (
    <>
      <PageHeader title="Menus" description="Header aur footer ke links. Link kisi bhi page ka ho sakta hai, jaise /category/smart-gadgets, /guides, /about ya https://… " />
      <div className="space-y-6">
        {MENU_LOCATIONS.filter((l) => l !== "TOPBAR").map((loc) => (
          <Card key={loc} title={LOC[loc].label} description={LOC[loc].hint}>
            {rows.filter((r) => r.location === loc).map((m) => (
              <div key={m.id} className="flex items-start gap-1">
                <div className="min-w-0 flex-1"><Row m={m} /></div>
                <div className="flex pt-4">
                  <ActionButton action={moveMenuItem} id={m.id} extra={{ dir: "up" }} title="Move up"><ArrowUp className="size-4" /></ActionButton>
                  <ActionButton action={moveMenuItem} id={m.id} extra={{ dir: "down" }} title="Move down"><ArrowDown className="size-4" /></ActionButton>
                  <DeleteButton action={deleteMenuItem} id={m.id} />
                </div>
              </div>
            ))}
            <AdminForm action={saveMenuItem} resetOnSuccess className="mt-3 grid gap-2 rounded-xl bg-paper p-3 sm:grid-cols-[1fr_1.4fr_auto]">
              <input type="hidden" name="location" value={loc} />
              <input type="hidden" name="isActive" value="on" />
              <input name="label" placeholder="Label, e.g. Sale" className="input" aria-label="New link label" />
              <input name="url" placeholder="/shop?sort=price-asc" className="input" aria-label="New link URL" />
              <SubmitButton className="btn-primary">Add link</SubmitButton>
            </AdminForm>
          </Card>
        ))}
      </div>
    </>
  );
}
