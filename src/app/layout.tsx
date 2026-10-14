import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

// Har page request pe render hota hai (data cache ke sath) — build ke waqt database ki zaroorat nahi.
export const dynamic = "force-dynamic";

const figtree = localFont({ src: "../fonts/figtree.woff2", variable: "--font-figtree", display: "swap", weight: "300 900" });
const bricolage = localFont({ src: "../fonts/bricolage.woff2", variable: "--font-bricolage", display: "swap", weight: "200 800" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seoTitle, template: `%s | ${s.siteName}` },
    description: s.seoDescription,
    applicationName: s.siteName,
    openGraph: { type: "website", siteName: s.siteName, locale: "en_PK", images: s.ogImage ? [s.ogImage] : [] },
    twitter: { card: "summary_large_image" },
    icons: s.faviconUrl ? { icon: s.faviconUrl } : undefined,
  };
}

export const viewport: Viewport = { themeColor: "#0e5e54", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.variable} ${bricolage.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
