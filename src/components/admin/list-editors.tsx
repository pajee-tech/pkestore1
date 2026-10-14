"use client";

import { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";

export function StringListField({ name, defaultValue, placeholder = "Feature" }: { name: string; defaultValue?: string[] | null; placeholder?: string }) {
  const [items, setItems] = useState<string[]>(defaultValue?.length ? defaultValue : [""]);
  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(items.map((s) => s.trim()).filter(Boolean))} />
      {items.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="size-4 shrink-0 text-muted/50" />
          <input value={v} onChange={(e) => setItems((p) => p.map((x, k) => (k === i ? e.target.value : x)))} placeholder={placeholder} className="input" />
          <button type="button" onClick={() => setItems((p) => p.filter((_, k) => k !== i))} className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-sale/10 hover:text-sale" aria-label="Remove"><X className="size-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => setItems((p) => [...p, ""])} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"><Plus className="size-4" /> Add</button>
    </div>
  );
}

export function SpecsField({ name, defaultValue }: { name: string; defaultValue?: { label: string; value: string }[] | null }) {
  const [rows, setRows] = useState(defaultValue?.length ? defaultValue : [{ label: "", value: "" }]);
  const set = (i: number, k: "label" | "value", v: string) => setRows((p) => p.map((r, n) => (n === i ? { ...r, [k]: v } : r)));
  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(rows.filter((r) => r.label.trim() && r.value.trim()))} />
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
          <input value={r.label} onChange={(e) => set(i, "label", e.target.value)} placeholder="e.g. Battery" className="input" aria-label="Spec name" />
          <input value={r.value} onChange={(e) => set(i, "value", e.target.value)} placeholder="e.g. 300mAh" className="input" aria-label="Spec value" />
          <button type="button" onClick={() => setRows((p) => p.filter((_, k) => k !== i))} className="grid size-10 place-items-center rounded-lg text-muted hover:bg-sale/10 hover:text-sale" aria-label="Remove row"><X className="size-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => setRows((p) => [...p, { label: "", value: "" }])} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"><Plus className="size-4" /> Add row</button>
    </div>
  );
}

export function NameSlugFields({ nameField = "name", nameLabel = "Name", defaultName, defaultSlug, prefix }: { nameField?: string; nameLabel?: string; defaultName?: string; defaultSlug?: string; prefix: string }) {
  const [name, setName] = useState(defaultName || "");
  const [slug, setSlug] = useState(defaultSlug || "");
  const [touched, setTouched] = useState(!!defaultSlug);
  const auto = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 150);
  return (
    <div className="grid gap-4">
      <div>
        <label htmlFor={nameField} className="label">{nameLabel}</label>
        <input id={nameField} name={nameField} required value={name} onChange={(e) => { setName(e.target.value); if (!touched) setSlug(auto(e.target.value)); }} className="input" />
      </div>
      <div>
        <label htmlFor="slug" className="label">URL slug</label>
        <div className="flex items-center rounded-xl border border-line bg-paper focus-within:border-brand-500">
          <span className="whitespace-nowrap pl-3.5 text-sm text-muted">{prefix}</span>
          <input id="slug" name="slug" required value={slug} onChange={(e) => { setTouched(true); setSlug(auto(e.target.value)); }} className="w-full bg-transparent px-1 py-2.5 text-sm outline-none" />
        </div>
        <p className="mt-1 text-xs text-muted">Sirf chhote English letters, numbers aur dash (-). Publish ke baad slug badalne se purana link toot jata hai.</p>
      </div>
    </div>
  );
}
