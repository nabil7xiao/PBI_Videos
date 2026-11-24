import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/current-user";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Reports" };

export default async function Page() {
  await requirePermission("reports.view");
  return <ComingSoon title="Reports" stage={9} features={["Monthly and yearly revenue, cost of goods, gross profit, expenses", "Best and worst products, customer growth, supplier spending", "Month-over-month and year-over-year comparison", "Export to CSV and PDF"]} />;
}
