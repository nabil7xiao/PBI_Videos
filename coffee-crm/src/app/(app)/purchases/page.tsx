import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/current-user";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Purchases" };

export default async function Page() {
  await requirePermission("purchases.view");
  return <ComingSoon title="Purchases" stage={4} features={["Purchase orders and direct purchase entries", "Receive goods into stock (fully or partly)", "Payment status: paid, partial, unpaid"]} />;
}
