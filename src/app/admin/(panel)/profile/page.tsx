import { requireUser } from "@/lib/auth";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/permissions";
import { Card, Field, PageHeader } from "@/components/admin/ui";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { changePassword, logoutEverywhere, updateProfile } from "./actions";

export const metadata = { title: "My account" };

export default async function ProfilePage() {
  const me = await requireUser();
  return (
    <>
      <PageHeader title="My account" description={`${ROLE_LABELS[me.role]}: ${ROLE_DESCRIPTIONS[me.role]}`} />
      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <Card title="Profile">
          <AdminForm action={updateProfile} className="space-y-4">
            <Field label="Name" htmlFor="name"><input id="name" name="name" defaultValue={me.name} className="input" /></Field>
            <Field label="Email" htmlFor="em" hint="Email sirf Master Admin badal sakta hai."><input id="em" disabled value={me.email} className="input bg-paper" /></Field>
            <SubmitButton>Save</SubmitButton>
          </AdminForm>
        </Card>
        <Card title="Change password" description="Password badalne ke baad dobara login karna hoga.">
          <AdminForm action={changePassword} className="space-y-4">
            <Field label="Current password" htmlFor="current"><input id="current" name="current" type="password" required autoComplete="current-password" className="input" /></Field>
            <Field label="New password" htmlFor="next" hint="10+ characters, bare/chhote letters aur number"><input id="next" name="next" type="password" required autoComplete="new-password" className="input" /></Field>
            <Field label="Confirm new password" htmlFor="confirm"><input id="confirm" name="confirm" type="password" required autoComplete="new-password" className="input" /></Field>
            <SubmitButton>Change password</SubmitButton>
          </AdminForm>
        </Card>
        <Card title="Security">
          <p className="text-sm text-muted">Agar shak ho ke kisi aur device pe aap ka account khula hai, to tamam devices se logout karein.</p>
          <form action={logoutEverywhere} className="mt-4"><button className="btn border border-sale/30 bg-white text-sale hover:bg-sale/10">Log out from all devices</button></form>
        </Card>
      </div>
    </>
  );
}
