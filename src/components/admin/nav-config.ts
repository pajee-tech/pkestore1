import type { Permission } from "@/lib/permissions";

export type NavItem = { href: string; label: string; icon: string; perm: Permission | null; group: string };

export const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard", perm: "dashboard.view", group: "Overview" },
  { href: "/admin/orders", label: "Orders", icon: "ShoppingCart", perm: "orders.manage", group: "Overview" },
  { href: "/admin/products", label: "Products", icon: "Package", perm: "products.manage", group: "Catalog" },
  { href: "/admin/categories", label: "Categories", icon: "FolderTree", perm: "categories.manage", group: "Catalog" },
  { href: "/admin/sections", label: "Homepage", icon: "LayoutTemplate", perm: "sections.manage", group: "Website" },
  { href: "/admin/pages", label: "Pages & guides", icon: "FileText", perm: "content.manage", group: "Website" },
  { href: "/admin/menu", label: "Menus", icon: "Menu", perm: "menu.manage", group: "Website" },
  { href: "/admin/media", label: "Media library", icon: "Images", perm: "media.manage", group: "Website" },
  { href: "/admin/coupons", label: "Coupons", icon: "TicketPercent", perm: "coupons.manage", group: "Marketing" },
  { href: "/admin/messages", label: "Messages", icon: "Inbox", perm: "messages.view", group: "Marketing" },
  { href: "/admin/users", label: "Users & roles", icon: "Users", perm: "users.manage", group: "System" },
  { href: "/admin/activity", label: "Activity log", icon: "History", perm: "activity.view", group: "System" },
  { href: "/admin/settings", label: "Settings", icon: "Settings", perm: "settings.manage", group: "System" },
  { href: "/admin/profile", label: "My account", icon: "UserRound", perm: null, group: "System" },
];
