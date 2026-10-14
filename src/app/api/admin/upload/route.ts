import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getCurrentUser, logActivity } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { MAX_UPLOAD_BYTES, optimizeToWebp, storeImage } from "@/lib/image-storage";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || (!can(user.role, "media.manage") && !can(user.role, "products.manage"))) {
    return NextResponse.json({ error: "Permission nahi hai" }, { status: 403 });
  }
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: "Bad origin" }, { status: 403 });

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "File select karein" }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Image 4MB se chhoti honi chahiye" }, { status: 413 });
  const maxWidth = Math.min(Math.max(Number(fd.get("maxWidth")) || 1600, 400), 2400);
  try {
    const img = await optimizeToWebp(Buffer.from(await file.arrayBuffer()), maxWidth);
    const url = await storeImage(img.buffer, file.name);
    const alt = String(fd.get("alt") || file.name.replace(/\.[a-z0-9]+$/i, "")).slice(0, 191);
    const [res] = await db.insert(media).values({ url, filename: file.name.slice(0, 191), alt, size: img.size, width: img.width, height: img.height, uploadedBy: user.id });
    await logActivity(user, "upload", "media", res.insertId, file.name);
    return NextResponse.json({ id: res.insertId, url, size: img.size, width: img.width, height: img.height });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload fail ho gaya" }, { status: 400 });
  }
}
