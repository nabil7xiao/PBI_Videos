import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/current-user";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Sales" };

export default async function Page() {
  await requirePermission("sales.view");
  return <ComingSoon title="Sales" stage={5} features={["Point-of-sale screen with line items and discounts", "Split payments and printable receipts", "Refunds and returns"]} />;
}
