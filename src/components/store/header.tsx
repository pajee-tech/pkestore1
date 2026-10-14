import Link from "next/link";
import { Truck, Phone } from "lucide-react";
import { getMegaMenu, getMenuItems, getSettings } from "@/lib/data";
import { Logo } from "./logo";
import { SearchBox } from "./search-box";
import { CartButton } from "./cart-button";
import { MegaMenu, type MenuCat } from "./mega-menu";
import { MobileNav } from "./mobile-nav";

export async function Header() {
  const [s, menu, items] = await Promise.all([getSettings(), getMegaMenu(), getMenuItems()]);
  const cats: MenuCat[] = menu.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    image: c.image,
    description: c.description,
    children: c.children.map((ch) => ({ id: ch.id, name: ch.name, slug: ch.slug, image: ch.image })),
    topProducts: c.topProducts.map((p) => ({ id: p.id, name: p.name, slug: p.slug, images: p.images, price: Number(p.price) })),
  }));
  const links = items.HEADER.map((l) => ({ label: l.label, url: l.url, newTab: l.openInNewTab }));

  return (
    <>
      {s.announcementActive && s.announcement && (
        <div className="bg-brand-800 text-white">
          <p className="container-x py-2 text-center text-[13px] font-medium leading-snug">{s.announcement}</p>
        </div>
      )}
    <header className="sticky top-0 z-50">
      <div className="border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="container-x flex h-16 items-center gap-2 sm:h-[72px] sm:gap-4">
          <MobileNav cats={cats} links={links} phone={s.phone} whatsapp={s.whatsapp} />
          <Logo name={s.siteName} logoUrl={s.logoUrl} />
          <SearchBox className="mx-auto hidden max-w-xl flex-1 md:block" />
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="mr-2 hidden items-center gap-2.5 xl:flex">
              <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Phone className="size-[18px]" />
              </span>
              <span className="leading-tight">
                <span className="block text-xs text-muted">Call / WhatsApp</span>
                <span className="block text-sm font-semibold">{s.phone}</span>
              </span>
            </a>
            <Link href="/track-order" className="hidden h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold hover:bg-black/5 sm:flex">
              <Truck className="size-5" /> <span className="hidden lg:inline">Track order</span>
            </Link>
            <CartButton />
          </div>
        </div>
        <div className="container-x pb-3 md:hidden">
          <SearchBox />
        </div>
        <MegaMenu cats={cats} links={links} />
      </div>
    </header>
    </>
  );
}
