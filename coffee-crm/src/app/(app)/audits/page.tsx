import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/current-user";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Stock audit" };

export default async function Page() {
  await requirePermission("audits.view");
  return <ComingSoon title="Stock audit" stage={7} features={["Start an audit session per branch", "Enter physical counts (works on a phone)", "Variance in quantity and value, with reasons", "Approve to post adjustments automatically"]} />;
}
