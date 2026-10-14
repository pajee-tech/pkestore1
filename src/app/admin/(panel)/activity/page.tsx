import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge, Empty, PageHeader, Pagination, Table } from "@/components/admin/ui";

export const metadata = { title: "Activity log" };
const PER = 50;

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePagePermission("activity.view");
  const page = Math.max(Number((await searchParams).page) || 1, 1);
  const [rows, [{ n }]] = await Promise.all([
    db.select().from(activityLogs).orderBy(desc(activityLogs.id)).limit(PER).offset((page - 1) * PER),
    db.select({ n: sql<number>`count(*)` }).from(activityLogs),
  ]);
  return (
    <>
      <PageHeader title="Activity log" description="Kis ne kab kya change kiya — security aur team ki nigrani ke liye. Failed logins bhi yahan aate hain." />
      {rows.length === 0 ? <Empty title="Abhi koi activity nahi" /> : (
        <Table head={["When", "User", "Action", "Item", "Details", "IP"]}>
          {rows.map((a) => (
            <tr key={a.id}>
              <td className="whitespace-nowrap px-4 py-2.5 text-muted">{formatDate(a.createdAt, true)}</td>
              <td className="px-4 py-2.5">{a.userName || "—"}</td>
              <td className="px-4 py-2.5"><Badge className={a.action.includes("fail") || a.action === "delete" ? "bg-rose-100 text-rose-800" : a.action === "create" ? "bg-emerald-100 text-emerald-800" : undefined}>{a.action}</Badge></td>
              <td className="px-4 py-2.5">{a.entity}{a.entityId ? ` #${a.entityId}` : ""}</td>
              <td className="max-w-xs truncate px-4 py-2.5 text-muted" title={a.details || ""}>{a.details}</td>
              <td className="px-4 py-2.5 text-xs text-muted">{a.ip}</td>
            </tr>
          ))}
        </Table>
      )}
      <Pagination page={page} pages={Math.ceil(Number(n) / PER)} base="/admin/activity" />
    </>
  );
}
