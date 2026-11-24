import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/current-user";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Customers" };

export default async function Page() {
  await requirePermission("customers.view");
  return <ComingSoon title="Customers" stage={6} features={["Customer profiles and purchase history", "Total spent, last purchase, loyalty points", "Segments: new, regular, VIP, inactive", "Notes"]} />;
}
