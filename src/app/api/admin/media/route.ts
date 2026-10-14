import { NextResponse } from "next/server";
import { desc, like } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 60);
  const rows = await db
    .select({ id: media.id, url: media.url, alt: media.alt, size: media.size, width: media.width, height: media.height })
    .from(media)
    .where(q ? like(media.filename, `%${q.replace(/[%_\\]/g, "\\$&")}%`) : undefined)
    .orderBy(desc(media.id))
    .limit(120);
  return NextResponse.json({ items: rows });
}
