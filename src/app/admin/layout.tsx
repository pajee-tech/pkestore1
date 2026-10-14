import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s | PKeStore Admin" }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#f3f5f4]">{children}</div>;
}
