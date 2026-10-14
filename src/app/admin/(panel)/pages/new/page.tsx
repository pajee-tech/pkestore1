import { requirePagePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { PageForm } from "../page-form";

export const metadata = { title: "New page" };

export default async function NewPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requirePagePermission("content.manage");
  const { type = "PAGE" } = await searchParams;
  const label = type === "PILLAR" ? "New pillar guide" : type === "CLUSTER" ? "New cluster article" : "New page";
  return (
    <>
      <PageHeader title={label} back={{ href: "/admin/pages", label: "Pages & guides" }} />
      <PageForm defaultType={["PAGE", "PILLAR", "CLUSTER"].includes(type) ? type : "PAGE"} />
    </>
  );
}
