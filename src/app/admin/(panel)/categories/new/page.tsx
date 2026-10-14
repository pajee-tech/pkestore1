import { requirePagePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "../category-form";

export const metadata = { title: "Add category" };

export default async function NewCategory() {
  await requirePagePermission("categories.manage");
  return (
    <>
      <PageHeader title="Add category" back={{ href: "/admin/categories", label: "Categories" }} />
      <CategoryForm />
    </>
  );
}
