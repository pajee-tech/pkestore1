"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { uploadImage } from "@/components/admin/image-picker";

export function Uploader() {
  const [busy, setBusy] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const router = useRouter();
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const out: string[] = [];
    let n = 0;
    for (const f of Array.from(files)) {
      setBusy(`${++n}/${files.length}`);
      const r = await uploadImage(f);
      out.push(r.url ? `✓ ${f.name} → ${Math.round((r.size || 0) / 1024)} KB WebP` : `✗ ${f.name}: ${r.error}`);
    }
    setBusy("");
    setLog(out);
    router.refresh();
  };
  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-8 text-center hover:bg-brand-50">
        {busy ? <Loader2 className="size-7 animate-spin text-brand-700" /> : <Upload className="size-7 text-brand-700" />}
        <span className="font-semibold">{busy ? `Uploading ${busy}…` : "Images upload karne ke liye click karein"}</span>
        <span className="text-sm text-muted">JPG, PNG, WebP. Khud WebP mein convert aur 200KB se kam ho jayengi.</span>
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} disabled={!!busy} />
      </label>
      {log.length > 0 && <ul className="mt-3 space-y-0.5 text-sm">{log.map((l, i) => <li key={i} className={l.startsWith("✗") ? "text-sale" : "text-brand-700"}>{l}</li>)}</ul>}
    </div>
  );
}
