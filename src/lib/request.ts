import { headers } from "next/headers";

export async function getClientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim().slice(0, 64);
}

export async function getUserAgent() {
  const h = await headers();
  return (h.get("user-agent") || "").slice(0, 255);
}
