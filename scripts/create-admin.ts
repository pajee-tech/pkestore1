/**
 * Command line se Master Admin banane / password reset karne ke liye (agar /admin/setup istemal na karna ho).
 * Usage: npm run create-admin -- "Your Name" you@email.com "StrongPass123"
 */
import "dotenv/config";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function main() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.log('Usage: npm run create-admin -- "Name" email@example.com "Password123"');
    process.exit(1);
  }
  if (password.length < 10 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    console.log("❌ Password 10+ characters, bare/chhote letters aur number ke sath ho.");
    process.exit(1);
  }
  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL!, ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined });
  const hash = await bcrypt.hash(password, 12);
  const [rows] = await conn.query("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
  if ((rows as unknown[]).length) {
    await conn.query("UPDATE users SET password_hash = ?, role = 'SUPER_ADMIN', is_active = 1, name = ? WHERE email = ?", [hash, name, email.toLowerCase()]);
    console.log("✅ Existing user ko Master Admin bana diya aur password reset ho gaya.");
  } else {
    const [sa] = await conn.query("SELECT id FROM users WHERE role = 'SUPER_ADMIN'");
    if ((sa as unknown[]).length) console.log("ℹ️  Ek Master Admin pehle se hai — ye doosra Master Admin ban raha hai.");
    await conn.query("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'SUPER_ADMIN')", [name, email.toLowerCase(), hash]);
    console.log("✅ Master Admin ban gaya. /admin/login pe login karein.");
  }
  await conn.end();
}
main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
