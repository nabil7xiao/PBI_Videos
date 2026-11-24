import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/current-user";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Settings" };

export default async function Page() {
  await requirePermission("settings.view");
  return <ComingSoon title="Settings" stage={10} features={["Business details, currency, tax rate", "Users and roles, branches, categories", "Backup and restore", "Stock reconcile check"]} />;
}
