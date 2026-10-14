import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __pkeePool: mysql.Pool | undefined;
}

function createPool() {
  let url = process.env.DATABASE_URL;
  if (!url) {
    // Build ke waqt DATABASE_URL ki zaroorat nahi. Live site pe ye zaroor set hona chahiye.
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      console.error("❌ DATABASE_URL set nahi hai. Hosting ke Environment Variables mein DATABASE_URL add karein aur redeploy karein.");
    }
    url = "mysql://not-configured:not-configured@127.0.0.1:3306/not-configured";
  }
  return mysql.createPool({
    uri: url,
    connectionLimit: Number(process.env.DATABASE_POOL_SIZE || 5),
    waitForConnections: true,
    enableKeepAlive: true,
    idleTimeout: 60_000,
    maxIdle: 2,
    timezone: "Z",
    charset: "utf8mb4",
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
}

const pool = globalThis.__pkeePool ?? createPool();
if (process.env.NODE_ENV !== "production") globalThis.__pkeePool = pool;

export const db = drizzle(pool, { schema, mode: "default" });
export { schema };
