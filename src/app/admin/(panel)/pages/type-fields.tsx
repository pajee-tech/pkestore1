"use client";

import { useState } from "react";

type Opt = { id: number; name: string };

export function PageTypeFields({ defaultType, defaultParent, defaultCategory, defaultFooter, pillars, categories }: { defaultType: string; defaultParent?: number | null; defaultCategory?: number | null; defaultFooter?: boolean; pillars: Opt[]; categories: Opt[] }) {
  const [type, setType] = useState(defaultType);
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="type" className="label">Type</label>
        <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="input">
          <option value="PAGE">Page (About, Contact, Policy…)</option>
          <option value="PILLAR">Pillar guide (main topic)</option>
          <option value="CLUSTER">Cluster article (sub-topic)</option>
        </select>
      </div>
      {type === "CLUSTER" && (
        <div>
          <label htmlFor="parentId" className="label">Parent pillar guide</label>
          <select id="parentId" name="parentId" defaultValue={defaultParent ?? ""} required className="input">
            <option value="">Select pillar</option>
            {pillars.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {pillars.length === 0 && <p className="mt-1 text-xs text-sale">Pehle ek pillar guide banayein.</p>}
        </div>
      )}
      {type !== "PAGE" && (
        <div>
          <label htmlFor="categoryId" className="label">Related category (optional)</label>
          <select id="categoryId" name="categoryId" defaultValue={defaultCategory ?? ""} className="input">
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <p className="mt-1 text-xs text-muted">Article ke neeche is category ke products dikhenge.</p>
        </div>
      )}
      {type === "PAGE" && (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="showInFooter" defaultChecked={defaultFooter} className="size-4 accent-brand-700" /> Footer mein link dikhayein
        </label>
      )}
    </div>
  );
}
