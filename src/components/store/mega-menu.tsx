"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutGrid, ChevronDown, ChevronRight } from "lucide-react";
import { DynIcon } from "./icons";
import { formatPrice } from "@/lib/utils";

export type MenuCat = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  description: string | null;
  children: { id: number; name: string; slug: string; image: string | null }[];
  topProducts: { id: number; name: string; slug: string; images: string[]; price: number }[];
};

export function MegaMenu({ cats, links }: { cats: MenuCat[]; links: { label: string; url: string; newTab: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const show = (i: number) => {
    if (timer.current) clearTimeout(timer.current);
    setActive(i);
    setOpen(true);
  };
  const hide = () => {
    timer.current = setTimeout(() => setOpen(false), 140);
  };
  const cat = cats[active];

  return (
    <nav className="relative hidden border-t border-line bg-white lg:block" onMouseLeave={hide} aria-label="Main">
      <div className="container-x flex h-12 items-center gap-1">
        <button
          onMouseEnter={() => show(active)}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mr-2 flex h-9 items-center gap-2 rounded-full bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <LayoutGrid className="size-4" /> All categories <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
        </button>
        <ul className="flex min-w-0 flex-1 items-center overflow-hidden">
          {cats.slice(0, 7).map((c, i) => (
            <li key={c.id} className={i >= 4 ? "hidden xl:block" : ""}>
              <Link
                href={`/category/${c.slug}`}
                onMouseEnter={() => show(i)}
                className={`flex h-9 items-center whitespace-nowrap rounded-full px-3 text-sm font-medium transition hover:bg-brand-50 hover:text-brand-700 ${open && active === i ? "bg-brand-50 text-brand-700" : "text-ink/85"}`}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="flex shrink-0 items-center" onMouseEnter={hide}>
          {links.map((l) => (
            <li key={l.url + l.label}>
              <Link href={l.url} target={l.newTab ? "_blank" : undefined} className="flex h-9 items-center whitespace-nowrap rounded-full px-3 text-sm font-semibold text-ink/85 hover:text-brand-700">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {open && cat && (
        <div className="absolute inset-x-0 top-full z-40 border-t border-line bg-white shadow-[0_24px_48px_-24px_rgba(22,33,31,.35)]" onMouseEnter={() => show(active)}>
          <div className="container-x grid grid-cols-[260px_1fr_300px] gap-0 py-0">
            <ul className="border-r border-line py-4 pr-3">
              {cats.map((c, i) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition ${i === active ? "bg-brand-50 font-semibold text-brand-700" : "text-ink/85 hover:bg-paper"}`}
                  >
                    <DynIcon name={c.icon} className="size-[18px] shrink-0" />
                    <span className="flex-1">{c.name}</span>
                    <ChevronRight className={`size-4 ${i === active ? "opacity-100" : "opacity-0"}`} />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="px-8 py-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-bold">{cat.name}</h3>
                <Link href={`/category/${cat.slug}`} className="text-sm font-semibold text-brand-700 hover:underline">
                  Shop all {cat.name}
                </Link>
              </div>
              {cat.description && <p className="mt-1 max-w-xl text-sm text-muted">{cat.description}</p>}
              <ul className="mt-5 grid grid-cols-3 gap-3">
                {cat.children.map((ch) => (
                  <li key={ch.id}>
                    <Link href={`/category/${ch.slug}`} className="group flex items-center gap-3 rounded-2xl border border-line p-2 pr-3 transition hover:border-brand-200 hover:bg-brand-50/50">
                      {ch.image && <Image src={ch.image} alt="" width={56} height={56} className="size-14 rounded-xl object-cover" />}
                      <span className="text-sm font-semibold group-hover:text-brand-700">{ch.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {cat.topProducts.length > 0 && (
                <>
                  <p className="mt-6 text-sm font-semibold text-muted">Popular in {cat.name}</p>
                  <ul className="mt-2 grid grid-cols-2 gap-3">
                    {cat.topProducts.map((p) => (
                      <li key={p.id}>
                        <Link href={`/product/${p.slug}`} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-paper">
                          <Image src={p.images[0]} alt="" width={64} height={64} className="size-16 rounded-xl object-cover" />
                          <span className="min-w-0">
                            <span className="line-clamp-2 text-sm font-medium leading-snug">{p.name}</span>
                            <span className="mt-0.5 block text-sm font-bold text-brand-700">{formatPrice(p.price)}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {cat.image && (
              <Link href={`/category/${cat.slug}`} className="relative my-5 block overflow-hidden rounded-3xl">
                <Image src={cat.image} alt={cat.name} fill sizes="300px" className="object-cover" />
                <span className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold backdrop-blur">
                  Explore {cat.name}
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
