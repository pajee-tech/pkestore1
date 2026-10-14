import { requirePagePermission } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { Card, Field, PageHeader, Toggle } from "@/components/admin/ui";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ImageField } from "@/components/admin/image-picker";
import { saveSettings } from "./actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePagePermission("settings.manage");
  const s = await getSettings();
  const T = ({ k, label, hint, area, type = "text" }: { k: keyof typeof s; label: string; hint?: string; area?: boolean; type?: string }) => (
    <Field label={label} htmlFor={k} hint={hint}>
      {area ? <textarea id={k} name={k} rows={3} defaultValue={String(s[k] ?? "")} className="input" /> : <input id={k} name={k} type={type} defaultValue={String(s[k] ?? "")} className="input" />}
    </Field>
  );
  return (
    <>
      <PageHeader title="Settings" description="Store ki basic maloomat, delivery charges, payment methods aur SEO." />
      <AdminForm action={saveSettings} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="Store">
            <div className="grid gap-4 sm:grid-cols-2">
              <T k="siteName" label="Store name" />
              <T k="tagline" label="Tagline" />
              <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                <ImageField name="logoUrl" defaultValue={s.logoUrl} label="Logo (optional)" maxWidth={600} />
                <ImageField name="faviconUrl" defaultValue={s.faviconUrl} label="Favicon (square)" maxWidth={256} />
              </div>
              <div className="sm:col-span-2"><T k="footerAbout" label="Footer about text" area /></div>
            </div>
          </Card>
          <Card title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <T k="phone" label="Phone (display)" />
              <T k="whatsapp" label="WhatsApp number" hint="923001234567 format (country code ke sath)" />
              <T k="email" label="Email" type="email" />
              <T k="businessHours" label="Business hours" />
              <div className="sm:col-span-2"><T k="address" label="Address / city" /></div>
            </div>
          </Card>
          <Card title="Announcement bar">
            <div className="grid gap-4">
              <Toggle name="announcementActive" defaultChecked={s.announcementActive} label="Show announcement bar" />
              <T k="announcement" label="Text" />
            </div>
          </Card>
          <Card title="Delivery">
            <div className="grid gap-4 sm:grid-cols-3">
              <T k="shippingFee" label="Delivery fee (Rs)" type="number" />
              <T k="freeShippingOver" label="Free delivery above (Rs)" type="number" hint="0 = kabhi free nahi" />
              <T k="deliveryTime" label="Delivery time" />
            </div>
          </Card>
        </div>

        <Card title="Payment methods" description="Checkout pe sirf on wale methods nazar aate hain. Manual payments mein customer TID / screenshot deta hai jo Orders mein verify hota hai.">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3 rounded-xl bg-paper p-4"><Toggle name="codEnabled" defaultChecked={s.codEnabled} label="Cash on Delivery" /></div>
            <div className="space-y-3 rounded-xl bg-paper p-4">
              <Toggle name="jazzcashEnabled" defaultChecked={s.jazzcashEnabled} label="JazzCash" />
              <div className="grid gap-3 sm:grid-cols-2"><T k="jazzcashNumber" label="Account number" /><T k="jazzcashName" label="Account title" /></div>
            </div>
            <div className="space-y-3 rounded-xl bg-paper p-4">
              <Toggle name="easypaisaEnabled" defaultChecked={s.easypaisaEnabled} label="Easypaisa" />
              <div className="grid gap-3 sm:grid-cols-2"><T k="easypaisaNumber" label="Account number" /><T k="easypaisaName" label="Account title" /></div>
            </div>
            <div className="space-y-3 rounded-xl bg-paper p-4">
              <Toggle name="bankEnabled" defaultChecked={s.bankEnabled} label="Bank transfer" />
              <T k="bankDetails" label="Bank details (customer ko nazar aati hain)" area />
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="SEO (homepage)">
            <div className="grid gap-4">
              <T k="seoTitle" label="Homepage title" />
              <T k="seoDescription" label="Meta description" area />
              <ImageField name="ogImage" defaultValue={s.ogImage} label="Share image (1200×630)" aspect="wide" maxWidth={1200} />
            </div>
          </Card>
          <Card title="Social & tracking">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Facebook" htmlFor="facebook"><input id="facebook" name="facebook" defaultValue={s.social.facebook} className="input" /></Field>
              <Field label="Instagram" htmlFor="instagram"><input id="instagram" name="instagram" defaultValue={s.social.instagram} className="input" /></Field>
              <Field label="TikTok" htmlFor="tiktok"><input id="tiktok" name="tiktok" defaultValue={s.social.tiktok} className="input" /></Field>
              <Field label="YouTube" htmlFor="youtube"><input id="youtube" name="youtube" defaultValue={s.social.youtube} className="input" /></Field>
              <T k="googleAnalyticsId" label="Google Analytics 4 ID" hint="G-XXXXXXXXXX" />
              <T k="metaPixelId" label="Meta (Facebook) Pixel ID" hint="Sirf numbers" />
            </div>
          </Card>
        </div>
        <div className="sticky bottom-4 flex justify-end">
          <SubmitButton className="btn-primary h-12 px-8 shadow-lg">Save settings</SubmitButton>
        </div>
      </AdminForm>
    </>
  );
}
