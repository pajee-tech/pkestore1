"use client";

import { useState } from "react";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import type { FieldDef, SectionDef } from "@/lib/section-defs";
import { ImageField } from "./image-picker";
import { MarkdownEditor } from "./markdown-editor";
import { ICON_NAMES } from "@/components/store/icons";

type Obj = Record<string, unknown>;

function FieldInput({ f, value, onChange, cats, uid }: { f: FieldDef; value: unknown; onChange: (v: unknown) => void; cats: { id: number; name: string }[]; uid: string }) {
  const id = `${uid}-${f.key}`;
  const v = value as string | number | boolean | undefined;
  switch (f.type) {
    case "image":
      return <ImageFieldControlled value={String(v || "")} onChange={onChange} />;
    case "textarea":
      return <textarea id={id} rows={2} value={String(v ?? "")} onChange={(e) => onChange(e.target.value)} className="input" />;
    case "markdown":
      return <MarkdownControlled value={String(v ?? "")} onChange={onChange} />;
    case "number":
      return <input id={id} type="number" min={f.min} max={f.max} value={v === undefined || v === null ? "" : String(v)} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} className="input" />;
    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-sm">
          <input id={id} type="checkbox" checked={!!v} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-brand-700" /> Yes
        </label>
      );
    case "select":
      return (
        <select id={id} value={String(v ?? "")} onChange={(e) => onChange(e.target.value)} className="input">
          {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case "icon":
      return (
        <select id={id} value={String(v ?? "")} onChange={(e) => onChange(e.target.value)} className="input">
          {ICON_NAMES.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case "category":
      return (
        <select id={id} value={String(v ?? "")} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")} className="input">
          <option value="">—</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      );
    default:
      return <input id={id} value={String(v ?? "")} onChange={(e) => onChange(e.target.value)} className="input" placeholder={f.type === "link" ? "/category/..." : undefined} />;
  }
}

function ImageFieldControlled({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <ImageField name="" defaultValue={value} aspect="wide" onChange={onChange} />;
}

function MarkdownControlled({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <MarkdownEditor name="" defaultValue={value} rows={12} onChange={onChange} />;
}

export function SectionConfigEditor({ def, initial, cats }: { def: SectionDef; initial: Obj; cats: { id: number; name: string }[] }) {
  const [cfg, setCfg] = useState<Obj>({ ...def.defaults, ...initial });
  const set = (k: string, v: unknown) => setCfg((c) => ({ ...c, [k]: v }));
  const items = def.items ? ((cfg[def.items.key] as Obj[]) || []) : [];
  const setItems = (next: Obj[]) => def.items && set(def.items.key, next);

  return (
    <div className="space-y-5">
      <input type="hidden" name="config" value={JSON.stringify(cfg)} />
      {def.fields.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {def.fields.map((f) => (
            <div key={f.key} className={f.type === "markdown" || f.type === "image" ? "sm:col-span-2" : ""}>
              <label className="label" htmlFor={`root-${f.key}`}>{f.label}</label>
              <FieldInput f={f} value={cfg[f.key]} onChange={(v) => set(f.key, v)} cats={cats} uid="root" />
              {f.hint && <p className="mt-1 text-xs text-muted">{f.hint}</p>}
            </div>
          ))}
        </div>
      )}
      {def.items && (
        <div className="space-y-4">
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl border border-line bg-paper/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-semibold">{def.items!.label} {i + 1}</span>
                <span className="ml-auto flex">
                  <button type="button" disabled={i === 0} onClick={() => { const a = [...items]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setItems(a); }} className="grid size-8 place-items-center rounded-lg hover:bg-white disabled:opacity-30" aria-label="Move up"><ArrowUp className="size-4" /></button>
                  <button type="button" disabled={i === items.length - 1} onClick={() => { const a = [...items]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; setItems(a); }} className="grid size-8 place-items-center rounded-lg hover:bg-white disabled:opacity-30" aria-label="Move down"><ArrowDown className="size-4" /></button>
                  <button type="button" onClick={() => setItems(items.filter((_, k) => k !== i))} className="grid size-8 place-items-center rounded-lg text-sale hover:bg-sale/10" aria-label="Remove"><X className="size-4" /></button>
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {def.items!.fields.map((f) => (
                  <div key={f.key} className={f.type === "image" || f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="label" htmlFor={`it${i}-${f.key}`}>{f.label}</label>
                    <FieldInput f={f} value={it[f.key]} onChange={(v) => setItems(items.map((x, k) => (k === i ? { ...x, [f.key]: v } : x)))} cats={cats} uid={`it${i}`} />
                    {f.hint && <p className="mt-1 text-xs text-muted">{f.hint}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {items.length < def.items.max && (
            <button type="button" onClick={() => setItems([...items, {}])} className="btn-outline"><Plus className="size-4" /> Add {def.items.label.toLowerCase()}</button>
          )}
        </div>
      )}
      {def.fields.length === 0 && !def.items && <p className="text-sm text-muted">Is section ki koi extra settings nahi — sirf title aur subtitle.</p>}
    </div>
  );
}
