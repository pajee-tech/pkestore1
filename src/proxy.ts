import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

const PUBLIC_ADMIN = ["/admin/login", "/admin/setup"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if ((isAdminPage && !PUBLIC_ADMIN.some((p) => pathname.startsWith(p))) || isAdminApi) {
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      if (isAdminApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = pathname !== "/admin" ? `?next=${encodeURIComponent(pathname)}` : "";
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  if (isAdminPage || isAdminApi) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
