/**
 * Poore database (tables + starter data) ki ek .sql file banata hai jo Hostinger phpMyAdmin mein import ho sakti hai.
 * Usage: npm run db:export  →  database/pkestore.sql
 */
import "dotenv/config";
import fs from "node:fs";
import mysql from "mysql2/promise";

const TABLES = ["categories", "products", "pages", "sections", "menu_items", "coupons", "settings"];

async function main() {
  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL!, ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined });
  const out: string[] = [
    "-- PKeStore database: tables + starter data",
    "-- Hostinger hPanel > Databases > phpMyAdmin > apna database select karein > Import > ye file choose karein > Go",
    "SET NAMES utf8mb4;",
    "SET FOREIGN_KEY_CHECKS = 0;",
    "",
  ];
  const schema = fs.readFileSync("drizzle/0000_init.sql", "utf8").split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);
  for (const s of schema) out.push(s.replace(/^CREATE TABLE `/, "CREATE TABLE IF NOT EXISTS `").replace(/;?$/, ";"));
  out.push("");

  const [mig] = await conn.query("SELECT * FROM __drizzle_migrations");
  out.push("CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (`id` serial PRIMARY KEY, `hash` text NOT NULL, `created_at` bigint);");
  for (const r of mig as Record<string, unknown>[]) out.push(conn.format("INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) VALUES (?, ?);", [r.hash, r.created_at]));
  out.push("");

  for (const t of TABLES) {
    const [rows] = await conn.query({ sql: `SELECT * FROM \`${t}\``, typeCast: (field, next) => (field.type === "JSON" ? field.string() : next()) });
    for (const r of rows as Record<string, unknown>[]) {
      const cols = Object.keys(r);
      const vals = cols.map((c) => {
        const v = r[c];
        if (v instanceof Date) return v.toISOString().slice(0, 19).replace("T", " ");
        return v;
      });
      out.push(conn.format(`INSERT INTO \`${t}\` (${cols.map((c) => `\`${c}\``).join(", ")}) VALUES (?);`, [vals]));
    }
    out.push("");
  }
  out.push("SET FOREIGN_KEY_CHECKS = 1;");
  fs.mkdirSync("database", { recursive: true });
  fs.writeFileSync("database/pkestore.sql", out.join("\n"));
  console.log("✅ database/pkestore.sql ban gayi (" + Math.round(fs.statSync("database/pkestore.sql").size / 1024) + " KB)");
  await conn.end();
}
main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
