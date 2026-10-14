"use server";

import { db } from "@/db";
import { settings } from "@/db/schema";
import { logActivity, requirePermission } from "@/lib/auth";
import { done, fail, fdBool, fdNum, fdStr, type ActionState } from "@/lib/action-state";
import { refresh } from "@/lib/revalidate";
import { getSettings } from "@/lib/data";
import type { SiteSettings } from "@/lib/settings-defaults";

export async function saveSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("settings.manage");
  const cur = await getSettings();
  const url = (k: string) => {
    const v = fdStr(fd, k);
    return v && !/^https?:\/\//.test(v) ? null : v;
  };
  const social = { facebook: url("facebook"), instagram: url("instagram"), tiktok: url("tiktok"), youtube: url("youtube") };
  if (Object.values(social).some((v) => v === null)) return fail("Social links https:// se shuru hon.");
  const next: SiteSettings = {
    ...cur,
    siteName: fdStr(fd, "siteName").slice(0, 60) || cur.siteName,
    tagline: fdStr(fd, "tagline").slice(0, 120),
    logoUrl: fdStr(fd, "logoUrl"),
    faviconUrl: fdStr(fd, "faviconUrl"),
    phone: fdStr(fd, "phone").slice(0, 30),
    whatsapp: fdStr(fd, "whatsapp").replace(/\D/g, "").replace(/^0/, "92").slice(0, 15),
    email: fdStr(fd, "email").slice(0, 120),
    address: fdStr(fd, "address").slice(0, 200),
    businessHours: fdStr(fd, "businessHours").slice(0, 100),
    announcement: fdStr(fd, "announcement").slice(0, 200),
    announcementActive: fdBool(fd, "announcementActive"),
    shippingFee: Math.max(fdNum(fd, "shippingFee") ?? 0, 0),
    freeShippingOver: Math.max(fdNum(fd, "freeShippingOver") ?? 0, 0),
    deliveryTime: fdStr(fd, "deliveryTime").slice(0, 60),
    codEnabled: fdBool(fd, "codEnabled"),
    bankEnabled: fdBool(fd, "bankEnabled"),
    bankDetails: fdStr(fd, "bankDetails").slice(0, 600),
    jazzcashEnabled: fdBool(fd, "jazzcashEnabled"),
    jazzcashNumber: fdStr(fd, "jazzcashNumber").slice(0, 30),
    jazzcashName: fdStr(fd, "jazzcashName").slice(0, 60),
    easypaisaEnabled: fdBool(fd, "easypaisaEnabled"),
    easypaisaNumber: fdStr(fd, "easypaisaNumber").slice(0, 30),
    easypaisaName: fdStr(fd, "easypaisaName").slice(0, 60),
    social: social as SiteSettings["social"],
    seoTitle: fdStr(fd, "seoTitle").slice(0, 120),
    seoDescription: fdStr(fd, "seoDescription").slice(0, 320),
    ogImage: fdStr(fd, "ogImage"),
    googleAnalyticsId: fdStr(fd, "googleAnalyticsId").toUpperCase().slice(0, 20),
    metaPixelId: fdStr(fd, "metaPixelId").replace(/\D/g, "").slice(0, 20),
    footerAbout: fdStr(fd, "footerAbout").slice(0, 400),
  };
  if (!next.codEnabled && !next.bankEnabled && !next.jazzcashEnabled && !next.easypaisaEnabled) return fail("Kam az kam ek payment method on rakhein.");
  if (next.googleAnalyticsId && !/^G-[A-Z0-9]+$/.test(next.googleAnalyticsId)) return fail("Google Analytics ID G-XXXXXXX format mein ho.");
  await db.insert(settings).values({ key: "site", value: next }).onDuplicateKeyUpdate({ set: { value: next } });
  await logActivity(user, "update", "settings", null);
  refresh("settings");
  return done("Settings save ho gayin. Website update ho gayi.");
}
