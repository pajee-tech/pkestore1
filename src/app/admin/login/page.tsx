import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { AuthCard } from "@/components/admin/auth-card";
import { LoginForm } from "./login-form";

export const metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(users);
  if (Number(n) === 0) redirect("/admin/setup");
  if (await getCurrentUser()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <AuthCard title="Sign in" subtitle="Apne admin account se login karein.">
      <LoginForm next={next || "/admin"} />
    </AuthCard>
  );
}
