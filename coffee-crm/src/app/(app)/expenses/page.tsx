import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/current-user";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Expenses" };

export default async function Page() {
  await requirePermission("expenses.view");
  return <ComingSoon title="Expenses" stage={8} features={["Rent, salaries, utilities and other costs", "Categories", "Feeds into the profit reports"]} />;
}
