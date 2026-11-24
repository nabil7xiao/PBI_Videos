import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/current-user";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Products" };

export default async function Page() {
  await requirePermission("products.view");
  return <ComingSoon title="Products" stage={2} features={["Product list with search and category filter", "Add / edit products: SKU, category, unit, cost and selling price, reorder level, photo", "Activate / deactivate products"]} />;
}
