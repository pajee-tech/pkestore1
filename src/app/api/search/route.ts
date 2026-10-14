import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") || "";
  const ip = (req.headers.get("x-forwarded-for") || "x").split(",")[0].trim();
  if (!(await rateLimit(`search:${ip}`, 120, 60))) return NextResponse.json({ results: [] }, { status: 429 });
  const rows = await searchProducts(q, 6);
  return NextResponse.json(
    { results: rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, image: r.images[0], price: Number(r.price) })) },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
