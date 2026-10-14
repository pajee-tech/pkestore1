import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { messages, orders } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { NAV } from "@/components/admin/nav-config";
import { AdminShell } from "@/components/admin/sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const nav = NAV.filter((n) => !n.perm || can(user.role, n.perm));
  const badges: Record<string, number> = {};
  if (can(user.role, "orders.manage")) {
    const [r] = await db.select({ n: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "PENDING"));
    badges["/admin/orders"] = Number(r.n);
  }
  if (can(user.role, "messages.view")) {
    const [r] = await db.select({ n: sql<number>`count(*)` }).from(messages).where(and(eq(messages.isRead, false)));
    badges["/admin/messages"] = Number(r.n);
  }
  return (
    <AdminShell nav={nav} user={{ name: user.name, roleLabel: ROLE_LABELS[user.role] }} badges={badges}>
      {children}
    </AdminShell>
  );
}
