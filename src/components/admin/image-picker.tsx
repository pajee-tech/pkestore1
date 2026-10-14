"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, ImagePlus, X, Loader2, ArrowLeft, ArrowRight, Library } from "lucide-react";

type MediaItem = { id: number; url: string; alt: string | null; size: number };

/** Browser mein hi image ko chhota karta hai taake upload jaldi ho (server phir WebP ≤200KB banata hai). */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2200 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/jpeg", 0.9));
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadImage(file: File, maxWidth?: number): Promise<{ url?: string; error?: string; size?: number }> {
  const fd = new FormData();
  fd.append("file", await shrink(file));
  if (maxWidth) fd.append("maxWidth", String(maxWidth));
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const d = await r.json().catch(() => ({ error: "Upload fail" }));
  return r.ok ? d : { error: d.error || "Upload fail" };
}

export function MediaLibraryModal({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [q, setQ] = useState("");
  const load = useCallback(async (term: string) => {
    const r = await fetch(`/api/admin/media${term ? `?q=${encodeURIComponent(term)}` : ""}`);
    const d = await r.json();
    setItems(d.items || []);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
  }, [q, load]);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Media library">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <h2 className="font-sans text-lg font-semibold tracking-normal">Media library</h2>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name" className="input ml-auto max-w-xs" />
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-black/5" aria-label="Close"><X className="size-5" /></button>
        </div>
        <div className="overflow-y-auto p-4">
          {!items ? (
            <Loader2 className="mx-auto my-10 size-6 animate-spin text-muted" />
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Library khali hai. Pehle image upload karein.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {items.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => onPick(m.url)} className="group block w-full overflow-hidden rounded-xl border border-line hover:ring-2 hover:ring-brand-500">
                    <span className="relative block aspect-square bg-paper"><Image src={m.url} alt={m.alt || ""} fill sizes="160px" className="object-cover" /></span>
                    <span className="block truncate px-2 py-1 text-left text-[11px] text-muted">{Math.round(m.size / 1024)} KB</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Image field — upload ya library se choose. `multiple` ho to array (JSON) save hota hai.
 */
export function ImageField({ name, defaultValue, multiple = false, maxWidth, aspect = "square", label, onChange }: { name: string; defaultValue?: string | string[] | null; multiple?: boolean; maxWidth?: number; aspect?: "square" | "wide"; label?: string; onChange?: (v: string) => void }) {
  const initial = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [lib, setLib] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange?.(multiple ? JSON.stringify(urls) : urls[0] || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls]);

  const add = (u: string) => setUrls((prev) => (multiple ? [...prev, u] : [u]));
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    for (const f of Array.from(files).slice(0, multiple ? 10 : 1)) {
      const r = await uploadImage(f, maxWidth);
      if (r.url) add(r.url);
      else setErr(r.error || "Upload fail");
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  };
  const move = (i: number, d: number) =>
    setUrls((prev) => {
      const a = [...prev];
      const j = i + d;
      if (j < 0 || j >= a.length) return a;
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });

  const box = aspect === "wide" ? "aspect-[16/9] w-56" : "aspect-square w-28";
  return (
    <div>
      {label && <span className="label">{label}</span>}
      <input type="hidden" name={name} value={multiple ? JSON.stringify(urls) : urls[0] || ""} />
      <div className="flex flex-wrap gap-3">
        {urls.map((u, i) => (
          <div key={u + i} className={`group relative overflow-hidden rounded-xl border border-line bg-paper ${box}`}>
            <Image src={u} alt="" fill sizes="224px" className="object-cover" />
            {multiple && i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">Main</span>}
            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
              {multiple ? (
                <span className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="grid size-7 place-items-center rounded-full bg-white/95 shadow" aria-label="Move left"><ArrowLeft className="size-3.5" /></button>
                  <button type="button" onClick={() => move(i, 1)} className="grid size-7 place-items-center rounded-full bg-white/95 shadow" aria-label="Move right"><ArrowRight className="size-3.5" /></button>
                </span>
              ) : <span />}
              <button type="button" onClick={() => setUrls((p) => p.filter((_, k) => k !== i))} className="grid size-7 place-items-center rounded-full bg-white/95 text-sale shadow" aria-label="Remove image"><X className="size-3.5" /></button>
            </div>
          </div>
        ))}
        {(multiple || urls.length === 0) && (
          <div className={`flex flex-col items-stretch justify-center gap-1.5 rounded-xl border-2 border-dashed border-line p-2 ${box}`}>
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-50 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload
            </button>
            <button type="button" onClick={() => setLib(true)} className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-muted hover:bg-black/5">
              <Library className="size-4" /> Library
            </button>
          </div>
        )}
        {!multiple && urls.length > 0 && (
          <button type="button" onClick={() => input.current?.click()} className="self-end text-xs font-semibold text-brand-700 hover:underline">
            <ImagePlus className="mr-1 inline size-4" />Replace
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => onFiles(e.target.files)} />
      {err && <p className="mt-2 text-sm text-sale">{err}</p>}
      <p className="mt-1.5 text-xs text-muted">Koi bhi JPG/PNG upload karein — khud WebP mein convert ho kar 200KB se kam ho jayegi.</p>
      {lib && <MediaLibraryModal onClose={() => setLib(false)} onPick={(u) => { add(u); setLib(false); }} />}
    </div>
  );
}
