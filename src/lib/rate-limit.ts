import "server-only";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { eq, lt } from "drizzle-orm";

/**
 * Simple DB-based rate limiter (serverless pe bhi kaam karta hai).
 * true = allowed, false = limit cross ho gayi.
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const now = new Date();
  const k = key.slice(0, 191);
  const [row] = await db.select().from(rateLimits).where(eq(rateLimits.key, k)).limit(1);
  if (!row || row.resetAt < now) {
    const resetAt = new Date(now.getTime() + windowSec * 1000);
    if (row) await db.update(rateLimits).set({ count: 1, resetAt }).where(eq(rateLimits.key, k));
    else await db.insert(rateLimits).values({ key: k, count: 1, resetAt }).onDuplicateKeyUpdate({ set: { count: 1, resetAt } });
    // occasional cleanup
    if (Math.random() < 0.02) await db.delete(rateLimits).where(lt(rateLimits.resetAt, now));
    return true;
  }
  if (row.count >= limit) return false;
  await db.update(rateLimits).set({ count: row.count + 1 }).where(eq(rateLimits.key, k));
  return true;
}

export async function resetRateLimit(key: string) {
  await db.delete(rateLimits).where(eq(rateLimits.key, key.slice(0, 191)));
}
