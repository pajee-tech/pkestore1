import type { Role } from "@/db/schema";

export const PERMISSIONS = {
  "dashboard.view": ["SUPER_ADMIN", "ADMIN", "EDITOR", "MARKETER", "ORDER_MANAGER"],
  "products.manage": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "categories.manage": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "content.manage": ["SUPER_ADMIN", "ADMIN", "EDITOR", "MARKETER"],
  "sections.manage": ["SUPER_ADMIN", "ADMIN", "MARKETER"],
  "menu.manage": ["SUPER_ADMIN", "ADMIN", "MARKETER"],
  "coupons.manage": ["SUPER_ADMIN", "ADMIN", "MARKETER"],
  "orders.manage": ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER"],
  "media.manage": ["SUPER_ADMIN", "ADMIN", "EDITOR", "MARKETER"],
  "messages.view": ["SUPER_ADMIN", "ADMIN", "MARKETER", "ORDER_MANAGER"],
  "settings.manage": ["SUPER_ADMIN", "ADMIN"],
  "activity.view": ["SUPER_ADMIN", "ADMIN"],
  "users.manage": ["SUPER_ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Master Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  MARKETER: "Marketer",
  ORDER_MANAGER: "Order Manager",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN: "Full control, users & roles manage karta hai. Sirf ek hota hai.",
  ADMIN: "Sab kuch except users. Settings, orders, products, content.",
  EDITOR: "Products, categories, pages, pillar/cluster content, media.",
  MARKETER: "Homepage sections, banners, menu, coupons, pillar/cluster content, media, messages.",
  ORDER_MANAGER: "Orders, payment verification, tracking, customer messages.",
};
