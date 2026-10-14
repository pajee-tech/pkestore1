import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __pkeePool: mysql.Pool | undefined;
}

function createPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. .env file check karen.");
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
