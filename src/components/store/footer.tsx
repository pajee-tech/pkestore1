import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { getCategoryTree, getFooterPages, getMenuItems, getSettings } from "@/lib/data";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

function Facebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
    </svg>
  );
}

function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Youtube({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  );
}

function TikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.79a5.7 5.7 0 1 0 4.91 5.64V9.01a7.3 7.3 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.24-1.48Z" />
    </svg>
  );
}

export async function Footer() {
  const [s, tree, pages, items] = await Promise.all([getSettings(), getCategoryTree(), getFooterPages(), getMenuItems()]);
  const social = [
    { href: s.social.facebook, label: "Facebook", Icon: Facebook },
    { href: s.social.instagram, label: "Instagram", Icon: Instagram },
    { href: s.social.tiktok, label: "TikTok", Icon: TikTok },
    { href: s.social.youtube, label: "YouTube", Icon: Youtube },
  ].filter((x) => x.href);
  const help = [...items.FOOTER_HELP.map((m) => ({ label: m.label, url: m.url })), ...pages.map((p) => ({ label: p.title, url: `/${p.slug}` }))];
  const shop = items.FOOTER_SHOP.length ? items.FOOTER_SHOP.map((m) => ({ label: m.label, url: m.url })) : tree.slice(0, 10).map((c) => ({ label: c.name, url: `/category/${c.slug}` }));

  return (
    <footer className="mt-20 bg-[#0c2723] text-white/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo name={s.siteName} logoUrl={s.logoUrl} light />
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed">{s.footerAbout}</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            <li className="flex gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 text-saffron-400" /><a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:text-white">{s.phone}</a></li>
            <li className="flex gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 text-saffron-400" /><a href={`mailto:${s.email}`} className="hover:text-white">{s.email}</a></li>
            <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-saffron-400" />{s.address}</li>
            <li className="flex gap-2.5"><Clock className="mt-0.5 size-4 shrink-0 text-saffron-400" />{s.businessHours}</li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Shop</h2>
          <ul className="mt-4 space-y-2 text-[15px]">
            {shop.map((l) => (
              <li key={l.url}><Link href={l.url} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Help & info</h2>
          <ul className="mt-4 space-y-2 text-[15px]">
            {help.map((l) => (
              <li key={l.url + l.label}><Link href={l.url} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Deals in your inbox</h2>
          <p className="mt-4 text-[15px]">New arrivals aur discount codes sab se pehle payen.</p>
          <NewsletterForm dark />
          {social.length > 0 && (
            <ul className="mt-6 flex gap-2">
              {social.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-saffron-500 hover:text-ink">
                    <Icon className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-sm sm:flex-row">
          <p>© {new Date().getFullYear()} {s.siteName}. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/90">
            {s.codEnabled && <li className="rounded-md bg-white/10 px-2.5 py-1">Cash on Delivery</li>}
            {s.jazzcashEnabled && <li className="rounded-md bg-white/10 px-2.5 py-1">JazzCash</li>}
            {s.easypaisaEnabled && <li className="rounded-md bg-white/10 px-2.5 py-1">Easypaisa</li>}
            {s.bankEnabled && <li className="rounded-md bg-white/10 px-2.5 py-1">Bank Transfer</li>}
          </ul>
        </div>
      </div>
    </footer>
  );
}
