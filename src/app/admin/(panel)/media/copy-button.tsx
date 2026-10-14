"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text.startsWith("/") ? location.origin + text : text);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="grid size-8 place-items-center rounded-lg hover:bg-black/5"
      title="Copy URL"
      aria-label="Copy URL"
    >
      {ok ? <Check className="size-4 text-brand-700" /> : <Copy className="size-4" />}
    </button>
  );
}
