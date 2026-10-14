"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, FolderTree, LayoutTemplate, FileText, Menu, Images, TicketPercent, Inbox, Users, History,
  Settings, UserRound, X, ExternalLink, LogOut, type LucideIcon,
} from "lucide-react";
import type { NavItem } from "./nav-config";
import { PkMark } from "@/components/brand/pk-mark";
import { logoutAction } from "@/app/admin/auth-actions";

const ICONS: Record<string, LucideIcon> = { LayoutDashboard, ShoppingCart, Package, FolderTree, LayoutTemplate, FileText, Menu, Images, TicketPercent, Inbox, Users, History, Settings, UserRound };

export function AdminShell({ nav, user, badges, children }: { nav: NavItem[]; user: { name: string; roleLabel: string }; badges: Record<string, number>; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const groups = [...new Set(nav.map((n) => n.group))];
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/admin" className="flex items-center gap-2">
          <PkMark className="size-9" />
          <span className="font-display text-lg font-bold text-white">PKeStore</span>
        </Link>
        <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden" aria-label="Close menu"><X className="size-5" /></button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Admin">
        {groups.map((g) => (
          <div key={g} className="mt-4">
            <p className="px-3 pb-1 text-xs font-medium text-white/40">{g}</p>
            <ul>
              {nav.filter((n) => n.group === g).map((n) => {
                const Icon = ICONS[n.icon];
                const active = isActive(n.href);
                return (
                  <li key={n.href}>
                    <Link href={n.href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-medium transition ${active ? "bg-white text-brand-800" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>
                      <Icon className="size-[18px]" />
                      <span className="flex-1">{n.label}</span>
                      {badges[n.href] > 0 && <span className="rounded-full bg-saffron-500 px-2 text-xs font-bold text-ink">{badges[n.href]}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="grid size-9 place-items-center rounded-full bg-white/15 font-semibold text-white">{user.name.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
            <span className="block text-xs text-white/55">{user.roleLabel}</span>
          </span>
          <form action={logoutAction}>
            <button className="grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Log out" title="Log out"><LogOut className="size-[18px]" /></button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 hidden h-dvh bg-brand-900 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-brand-900">{sidebar}</aside>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-lg hover:bg-black/5 lg:hidden" aria-label="Open menu"><Menu className="size-5" /></button>
          <span className="font-display text-lg font-bold lg:hidden">Admin</span>
          <a href="/" target="_blank" className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold hover:border-brand-500 hover:text-brand-700">
            View store <ExternalLink className="size-3.5" />
          </a>
        </header>
        <main className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
