"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Phone, MessageCircle } from "lucide-react";
import { SearchBox } from "./search-box";
import { DynIcon } from "./icons";
import type { MenuCat } from "./mega-menu";

export function MobileNav({
  cats,
  links,
  phone,
  whatsapp,
}: {
  cats: MenuCat[];
  links: { label: string; url: string }[];
  phone: string;
  whatsapp: string;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-full hover:bg-black/5 lg:hidden" aria-label="Open menu">
        <Menu className="size-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-display text-lg font-bold">Menu</span>
              <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-black/5" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4">
              <SearchBox onNavigate={() => setOpen(false)} />
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-6">
              <p className="px-3 pb-1 pt-2 text-sm font-semibold text-muted">Categories</p>
              <ul>
                {cats.map((c) => (
                  <li key={c.id} className="border-b border-line/70 last:border-0">
                    <div className="flex items-center">
                      <Link href={`/category/${c.slug}`} className="flex flex-1 items-center gap-3 px-3 py-3 text-[15px] font-medium">
                        <DynIcon name={c.icon} className="size-5 text-brand-700" />
                        {c.name}
                      </Link>
                      {c.children.length > 0 && (
                        <button
                          onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                          className="grid size-11 place-items-center"
                          aria-label={`Show ${c.name} subcategories`}
                          aria-expanded={expanded === c.id}
                        >
                          <ChevronDown className={`size-5 transition ${expanded === c.id ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                    {expanded === c.id && (
                      <ul className="mb-2 ml-11 border-l border-line pl-3">
                        {c.children.map((ch) => (
                          <li key={ch.id}>
                            <Link href={`/category/${ch.slug}`} className="block py-2 text-[15px] text-ink/80">
                              {ch.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <ul className="mt-4 border-t border-line pt-3">
                {links.map((l) => (
                  <li key={l.url + l.label}>
                    <Link href={l.url} className="block px-3 py-2.5 text-[15px] font-semibold">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-line p-3">
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn-outline">
                <Phone className="size-4" /> Call
              </a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
