import { asc, sql } from "drizzle-orm";
import { LogOut } from "lucide-react";
import { db } from "@/db";
import { sessions, users, ROLES, type User } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { PERMISSIONS, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { Badge, Card, Field, PageHeader, Toggle } from "@/components/admin/ui";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { ActionButton } from "@/components/admin/action-button";
import { deleteUser, logoutUser, saveUser } from "./actions";

export const metadata = { title: "Users & roles" };
const ASSIGNABLE = ROLES.filter((r) => r !== "SUPER_ADMIN");

function UserFields({ u }: { u?: Omit<User, "passwordHash"> }) {
  const sid = u?.id || "new";
  const isSuper = u?.role === "SUPER_ADMIN";
  return (
    <>
      {u && <input type="hidden" name="id" value={u.id} />}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Name" htmlFor={`n-${sid}`}><input id={`n-${sid}`} name="name" required defaultValue={u?.name} className="input" /></Field>
        <Field label="Email (login)" htmlFor={`e-${sid}`}><input id={`e-${sid}`} name="email" type="email" required defaultValue={u?.email} autoComplete="off" className="input" /></Field>
        <Field label="Role" htmlFor={`r-${sid}`}>
          {isSuper ? (
            <input disabled value="Master Admin" className="input bg-paper" aria-label="Role" />
          ) : (
            <select id={`r-${sid}`} name="role" defaultValue={u?.role || "EDITOR"} className="input">
              {ASSIGNABLE.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          )}
        </Field>
        <Field label={u ? "New password (optional)" : "Password"} htmlFor={`p-${sid}`} hint="10+ chars, A-z aur number">
          <input id={`p-${sid}`} name="password" type="password" required={!u} autoComplete="new-password" className="input" />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {!isSuper && u ? <Toggle name="isActive" defaultChecked={u.isActive} label="Account active" /> : <span />}
        <SubmitButton>{u ? "Save" : "Create user"}</SubmitButton>
      </div>
    </>
  );
}

export default async function UsersPage() {
  const me = await requirePagePermission("users.manage");
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive, lastLoginAt: users.lastLoginAt, createdAt: users.createdAt, updatedAt: users.updatedAt })
    .from(users)
    .orderBy(asc(users.id));
  const sess = await db.select({ u: sessions.userId, n: sql<number>`count(*)` }).from(sessions).groupBy(sessions.userId);
  const active = new Map(sess.map((s) => [s.u, Number(s.n)]));
  const permList = Object.entries(PERMISSIONS) as [string, readonly string[]][];

  return (
    <>
      <PageHeader title="Users & roles" description="Master Admin team members bana sakta hai. Har role ko sirf us ke kaam ke sections nazar aate hain." />
      <Card title="Add team member" className="mb-6"><AdminForm action={saveUser} resetOnSuccess><UserFields /></AdminForm></Card>
      <div className="space-y-3">
        {rows.map((u) => (
          <details key={u.id} className="group rounded-2xl border border-line bg-white">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-5 py-4">
              <span className="grid size-10 place-items-center rounded-full bg-brand-50 font-bold text-brand-800">{u.name[0]?.toUpperCase()}</span>
              <span className="min-w-0">
                <span className="block font-semibold">{u.name} {u.id === me.id && <span className="text-sm font-normal text-muted">(you)</span>}</span>
                <span className="block text-sm text-muted">{u.email}</span>
              </span>
              <Badge className={u.role === "SUPER_ADMIN" ? "bg-saffron-100 text-amber-900" : "bg-brand-50 text-brand-800"}>{ROLE_LABELS[u.role]}</Badge>
              {!u.isActive && <Badge className="bg-rose-100 text-rose-800">Disabled</Badge>}
              <span className="ml-auto text-xs text-muted">Last login: {formatDate(u.lastLoginAt, true)}</span>
              {active.get(u.id) ? <ActionButton action={logoutUser} id={u.id} title="Log out from all devices"><LogOut className="size-4" /></ActionButton> : null}
              {u.role !== "SUPER_ADMIN" && u.id !== me.id && <DeleteButton action={deleteUser} id={u.id} confirmText={`${u.name} ka account delete karein?`} />}
            </summary>
            <div className="border-t border-line p-5"><AdminForm action={saveUser}><UserFields u={u} /></AdminForm></div>
          </details>
        ))}
      </div>

      <Card title="Role permissions" className="mt-8" description="Kaun sa role kya kar sakta hai.">
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r) => (
            <div key={r} className="rounded-xl bg-paper p-3">
              <p className="font-semibold">{ROLE_LABELS[r]}</p>
              <p className="text-sm text-muted">{ROLE_DESCRIPTIONS[r]}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="border-b border-line text-left text-xs text-muted"><th className="py-2 pr-3">Permission</th>{ROLES.map((r) => <th key={r} className="px-2 py-2 text-center">{ROLE_LABELS[r]}</th>)}</tr></thead>
            <tbody>
              {permList.map(([p, roles]) => (
                <tr key={p} className="border-b border-line/60">
                  <td className="py-2 pr-3 font-medium">{p.replace(".", ": ")}</td>
                  {ROLES.map((r) => <td key={r} className="px-2 py-2 text-center">{roles.includes(r) ? <span className="text-brand-700">✓</span> : <span className="text-muted/40">—</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
