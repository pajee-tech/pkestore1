import { desc } from "drizzle-orm";
import { db } from "@/db";
import { coupons, type Coupon } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge, Card, Field, PageHeader, Toggle } from "@/components/admin/ui";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCoupon, saveCoupon } from "./actions";

export const metadata = { title: "Coupons" };

function CouponFields({ c }: { c?: Coupon }) {
  const exp = c?.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : "";
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Code" htmlFor={`code-${c?.id || "new"}`}><input id={`code-${c?.id || "new"}`} name="code" required defaultValue={c?.code} className="input uppercase" placeholder="EID20" /></Field>
        <Field label="Type" htmlFor={`type-${c?.id || "new"}`}>
          <select id={`type-${c?.id || "new"}`} name="type" defaultValue={c?.type || "PERCENT"} className="input">
            <option value="PERCENT">Percent off (%)</option>
            <option value="FIXED">Fixed amount off (Rs)</option>
            <option value="FREE_SHIPPING">Free delivery</option>
          </select>
        </Field>
        <Field label="Value" htmlFor={`value-${c?.id || "new"}`} hint="% ya Rs. Free delivery ke liye 0."><input id={`value-${c?.id || "new"}`} name="value" type="number" min={0} defaultValue={c?.value ?? 10} className="input" /></Field>
        <Field label="Minimum order (Rs)" htmlFor={`min-${c?.id || "new"}`}><input id={`min-${c?.id || "new"}`} name="minOrder" type="number" min={0} defaultValue={c?.minOrder ?? 0} className="input" /></Field>
        <Field label="Max uses" htmlFor={`max-${c?.id || "new"}`} hint="Khali = unlimited"><input id={`max-${c?.id || "new"}`} name="maxUses" type="number" min={1} defaultValue={c?.maxUses ?? ""} className="input" /></Field>
        <Field label="Expires on" htmlFor={`exp-${c?.id || "new"}`}><input id={`exp-${c?.id || "new"}`} name="expiresAt" type="date" defaultValue={exp} className="input" /></Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Toggle name="isActive" defaultChecked={c ? c.isActive : true} label="Active" />
        <SubmitButton>{c ? "Save" : "Create coupon"}</SubmitButton>
      </div>
    </>
  );
}

export default async function CouponsPage() {
  await requirePagePermission("coupons.manage");
  const rows = await db.select().from(coupons).orderBy(desc(coupons.id));
  const label = (c: Coupon) => (c.type === "PERCENT" ? `${c.value}% off` : c.type === "FIXED" ? `${formatPrice(c.value)} off` : "Free delivery");
  return (
    <>
      <PageHeader title="Coupons" description="Discount codes jo customer checkout pe lagata hai. Ads aur Instagram campaigns ke liye alag codes banayein taake pata chale kaun sa channel chal raha hai." />
      <Card title="New coupon" className="mb-6">
        <AdminForm action={saveCoupon} resetOnSuccess><CouponFields /></AdminForm>
      </Card>
      <div className="space-y-3">
        {rows.map((c) => (
          <details key={c.id} className="group rounded-2xl border border-line bg-white">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-5 py-4">
              <span className="font-mono text-base font-bold">{c.code}</span>
              <Badge className="bg-brand-50 text-brand-800">{label(c)}</Badge>
              {Number(c.minOrder) > 0 && <span className="text-sm text-muted">min {formatPrice(c.minOrder)}</span>}
              <span className="text-sm text-muted">used {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</span>
              {c.expiresAt && <span className="text-sm text-muted">till {formatDate(c.expiresAt)}</span>}
              {!c.isActive && <Badge>Inactive</Badge>}
              <span className="ml-auto text-sm font-semibold text-brand-700 group-open:hidden">Edit</span>
              <DeleteButton action={deleteCoupon} id={c.id} />
            </summary>
            <div className="border-t border-line p-5"><AdminForm action={saveCoupon}><CouponFields c={c} /></AdminForm></div>
          </details>
        ))}
      </div>
    </>
  );
}
