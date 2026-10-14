"use client";

import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Image as ImageIcon, Quote, Table2, Eye, Pencil, Loader2 } from "lucide-react";
import { uploadImage } from "./image-picker";

export function MarkdownEditor({ name, defaultValue, rows = 16, placeholder, onChange }: { name: string; defaultValue?: string | null; rows?: number; placeholder?: string; onChange?: (v: string) => void }) {
  const [value, setValue] = useState(defaultValue || "");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    onChange?.(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const wrap = (before: string, after = "", placeholderText = "text") => {
    const el = ta.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || placeholderText;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  const line = (prefix: string) => {
    const el = ta.current;
    if (!el) return;
    const s = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    setValue(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => el.focus());
  };
  const insert = (text: string) => {
    const el = ta.current;
    const s = el?.selectionStart ?? value.length;
    setValue(value.slice(0, s) + text + value.slice(s));
  };

  const tools = [
    { icon: Heading2, label: "Heading", fn: () => line("## ") },
    { icon: Heading3, label: "Sub-heading", fn: () => line("### ") },
    { icon: Bold, label: "Bold", fn: () => wrap("**", "**") },
    { icon: Italic, label: "Italic", fn: () => wrap("_", "_") },
    { icon: List, label: "Bullet list", fn: () => line("- ") },
    { icon: ListOrdered, label: "Numbered list", fn: () => line("1. ") },
    { icon: Quote, label: "Quote", fn: () => line("> ") },
    { icon: Link2, label: "Link", fn: () => wrap("[", "](/category/slug)", "link text") },
    { icon: Table2, label: "Table", fn: () => insert("\n| Column 1 | Column 2 |\n|---|---|\n| Value | Value |\n") },
    { icon: ImageIcon, label: "Image", fn: () => file.current?.click() },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-paper px-2 py-1.5">
        {!preview &&
          tools.map((t) => (
            <button key={t.label} type="button" onClick={t.fn} title={t.label} aria-label={t.label} className="grid size-8 place-items-center rounded-lg text-ink/70 hover:bg-white hover:text-ink">
              <t.icon className="size-4" />
            </button>
          ))}
        {busy && <Loader2 className="ml-1 size-4 animate-spin text-muted" />}
        <button type="button" onClick={() => setPreview((p) => !p)} className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-white">
          {preview ? <><Pencil className="size-3.5" /> Edit</> : <><Eye className="size-3.5" /> Preview</>}
        </button>
      </div>
      {preview ? (
        <div className="prose-store min-h-[300px] p-5 text-[15px]" dangerouslySetInnerHTML={{ __html: marked.parse(value || "_Kuch nahi likha_", { async: false }) as string }} />
      ) : (
        <textarea
          ref={ta}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="block w-full resize-y bg-transparent p-4 font-mono text-[13.5px] leading-relaxed outline-none"
        />
      )}
      <input
        ref={file}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          const r = await uploadImage(f, 1400);
          setBusy(false);
          if (r.url) insert(`\n![${f.name.replace(/\.\w+$/, "")}](${r.url})\n`);
          else alert(r.error);
          e.target.value = "";
        }}
      />
      <p className="border-t border-line bg-paper px-4 py-2 text-xs text-muted">
        Formatting: <code>## Heading</code>, <code>**bold**</code>, <code>- list</code>, <code>[link](/url)</code>. Preview se check karein.
      </p>
    </div>
  );
}
