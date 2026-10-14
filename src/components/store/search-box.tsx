"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Hit = { id: number; name: string; slug: string; image: string; price: number };

export function SearchBox({ className = "", autoFocus = false, onNavigate }: { className?: string; autoFocus?: boolean; onNavigate?: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const d = await r.json();
        setHits(d.results || []);
        setOpen(true);
      } catch {}
      setLoading(false);
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={box} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (!q.trim()) return;
          setOpen(false);
          onNavigate?.();
          router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
        className="flex items-center rounded-full border border-line bg-white pl-4 pr-1 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          autoFocus={autoFocus}
          type="search"
          name="q"
          placeholder="Search watches, earbuds, kitchen gadgets…"
          aria-label="Search products"
          className="h-11 w-full bg-transparent text-[15px] outline-none placeholder:text-muted/70"
        />
        <button type="submit" className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-700 text-white hover:bg-brand-800" aria-label="Search">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        </button>
      </form>
      {open && q.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          {hits.length === 0 && !loading ? (
            <p className="px-4 py-5 text-sm text-muted">&ldquo;{q}&rdquo; se koi product nahi mila. Doosra lafz try karein.</p>
          ) : (
            <ul>
              {hits.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/product/${h.slug}`}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-paper"
                  >
                    <Image src={h.image} alt="" width={48} height={48} className="size-12 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{h.name}</span>
                    <span className="text-sm font-semibold text-brand-700">{formatPrice(h.price)}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`/search?q=${encodeURIComponent(q.trim())}`} onClick={() => setOpen(false)} className="block border-t border-line px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-paper">
                  See all results for &ldquo;{q.trim()}&rdquo;
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
