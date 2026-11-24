import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { requirePermission } from "@/lib/auth/current-user";
import { can, PERMISSIONS, ROLE_LABELS, type Permission } from "@/lib/auth/roles";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Dashboard" };

// Groups shown in the "what you can do" panel.
const AREAS: { label: string; prefix: string }[] = [
  { label: "Dashboard", prefix: "dashboard." },
  { label: "Products", prefix: "products." },
  { label: "Stock", prefix: "stock." },
  { label: "Sales", prefix: "sales." },
  { label: "Purchases", prefix: "purchases." },
  { label: "Suppliers", prefix: "suppliers." },
  { label: "Customers", prefix: "customers." },
  { label: "Stock audit", prefix: "audits." },
  { label: "Expenses", prefix: "expenses." },
  { label: "Reports", prefix: "reports." },
  { label: "Settings", prefix: "settings." },
  { label: "Activity log", prefix: "activity." },
];

export default async function DashboardPage() {
  const user = await requirePermission("dashboard.view");
  const all = Object.keys(PERMISSIONS) as Permission[];

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name.split(" ")[0]}`}
        description={`Signed in as ${ROLE_LABELS[user.role]} · ${user.branchName ?? "All branches"}`}
      />

      <Card title="Sales, profit and stock alerts" className="mb-6">
        <p className="text-sm text-stone-600">
          Today&apos;s sales, this month&apos;s sales, gross profit, low-stock alerts, top products and recent activity
          will appear here in stage 9, once products, stock and sales exist.
        </p>
      </Card>

      <Card title="What your role can do">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {AREAS.map((area) => (
            <div key={area.prefix}>
              <p className="mb-1 text-sm font-semibold">{area.label}</p>
              <ul className="space-y-0.5 text-sm">
                {all
                  .filter((p) => p.startsWith(area.prefix))
                  .map((p) => {
                    const allowed = can(user.role, p);
                    return (
                      <li key={p} className={`flex items-center gap-1.5 ${allowed ? "text-stone-700" : "text-stone-400"}`}>
                        {allowed ? (
                          <Check className="size-3.5 text-green-600" aria-label="allowed" />
                        ) : (
                          <X className="size-3.5" aria-label="not allowed" />
                        )}
                        <code className="text-xs">{p.slice(area.prefix.length)}</code>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
