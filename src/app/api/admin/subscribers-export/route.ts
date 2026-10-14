import { desc } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "messages.view")) return new Response("Forbidden", { status: 403 });
  const rows = await db.select().from(subscribers).orderBy(desc(subscribers.id));
  const csv = "email,subscribed_at\n" + rows.map((r) => `"${r.email.replace(/"/g, "")}",${new Date(r.createdAt).toISOString()}`).join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="subscribers.csv"' } });
}
