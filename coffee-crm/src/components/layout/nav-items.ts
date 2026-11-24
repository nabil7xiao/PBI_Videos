/**
 * The main menu. Each item names the permission needed to see it (see
 * src/lib/auth/roles.ts). `stage` marks pages that are not built yet.
 */
import type { Permission } from "@/lib/auth/roles";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  permission: Permission;
};

export type IconName =
  | "dashboard"
  | "sales"
  | "customers"
  | "products"
  | "stock"
  | "purchases"
  | "suppliers"
  | "audits"
  | "expenses"
  | "reports"
  | "activity"
  | "settings";

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", permission: "dashboard.view" },
  { href: "/sales", label: "Sales", icon: "sales", permission: "sales.view" },
  { href: "/customers", label: "Customers", icon: "customers", permission: "customers.view" },
  { href: "/products", label: "Products", icon: "products", permission: "products.view" },
  { href: "/stock", label: "Stock", icon: "stock", permission: "stock.view" },
  { href: "/purchases", label: "Purchases", icon: "purchases", permission: "purchases.view" },
  { href: "/suppliers", label: "Suppliers", icon: "suppliers", permission: "suppliers.view" },
  { href: "/audits", label: "Stock audit", icon: "audits", permission: "audits.view" },
  { href: "/expenses", label: "Expenses", icon: "expenses", permission: "expenses.view" },
  { href: "/reports", label: "Reports", icon: "reports", permission: "reports.view" },
  { href: "/activity", label: "Activity log", icon: "activity", permission: "activity.view" },
  { href: "/settings", label: "Settings", icon: "settings", permission: "settings.view" },
];
