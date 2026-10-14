import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

export async function getCategoryOptions() {
  const all = await db.select({ id: categories.id, name: categories.name, parentId: categories.parentId }).from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
  const roots = all.filter((c) => !c.parentId);
  return roots.map((r) => ({ ...r, children: all.filter((c) => c.parentId === r.id) }));
}

export async function CategorySelect({ name = "categoryId", defaultValue, allowNone, noneLabel = "— None —", required, rootsOnly, excludeId }: { name?: string; defaultValue?: number | null; allowNone?: boolean; noneLabel?: string; required?: boolean; rootsOnly?: boolean; excludeId?: number }) {
  const tree = await getCategoryOptions();
  return (
    <select id={name} name={name} defaultValue={defaultValue ?? ""} required={required} className="input">
      {(allowNone || !defaultValue) && <option value="">{allowNone ? noneLabel : "Select category"}</option>}
      {tree.filter((r) => r.id !== excludeId).map((r) =>
        rootsOnly ? (
          <option key={r.id} value={r.id}>{r.name}</option>
        ) : (
          <optgroup key={r.id} label={r.name}>
            <option value={r.id}>{r.name} (main)</option>
            {r.children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </optgroup>
        ),
      )}
    </select>
  );
}
