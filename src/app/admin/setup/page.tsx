import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { AuthCard } from "@/components/admin/auth-card";
import { SetupForm } from "./setup-form";

export const metadata = { title: "Create Master Admin" };

export default async function SetupPage() {
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(users);
  if (Number(n) > 0) redirect("/admin/login");
  return (
    <AuthCard title="Create Master Admin" subtitle="Ye page sirf ek dafa kaam karta hai. Master Admin baad mein doosre users (Editor, Marketer waghera) bana sakta hai.">
      <SetupForm />
    </AuthCard>
  );
}
