import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/current-user";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Stock" };

export default async function Page() {
  await requirePermission("stock.view");
  return <ComingSoon title="Stock" stage={3} features={["Quantity per product and per branch", "Full stock movement history (the ledger)", "Adjustments, waste and branch transfers", "Low-stock and out-of-stock flags"]} />;
}
