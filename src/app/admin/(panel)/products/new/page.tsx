import { requirePagePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "../product-form";

export const metadata = { title: "Add product" };

export default async function NewProduct() {
  await requirePagePermission("products.manage");
  return (
    <>
      <PageHeader title="Add product" back={{ href: "/admin/products", label: "Products" }} />
      <ProductForm />
    </>
  );
}
