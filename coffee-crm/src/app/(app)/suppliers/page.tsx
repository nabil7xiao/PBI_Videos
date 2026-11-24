import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/current-user";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Suppliers" };

export default async function Page() {
  await requirePermission("suppliers.view");
  return <ComingSoon title="Suppliers" stage={4} features={["Supplier contact details", "Purchase history", "Outstanding balance"]} />;
}
