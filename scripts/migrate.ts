import "dotenv/config";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

async function main() {
  const conn = await mysql.createConnection({
    uri: process.env.DATABASE_URL!,
    multipleStatements: true,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  await migrate(drizzle(conn), { migrationsFolder: "./drizzle" });
  console.log("✅ Database tables ready");
  await conn.end();
}
main().catch((e) => {
  console.error("❌ Migration failed:", e.message);
  process.exit(1);
});
