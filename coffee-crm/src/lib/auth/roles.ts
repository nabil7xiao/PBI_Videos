/**
 * Roles and permissions — THE place to change who can do what.
 *
 * Each permission lists the roles that have it. Pages, menu items and server
 * actions all check these same names, so editing a line here changes the
 * menu AND the server-side protection together.
 */

export const ROLES = ["OWNER", "MANAGER", "STAFF"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  STAFF: "Staff",
};

const ALL: Role[] = ["OWNER", "MANAGER", "STAFF"];
const MGMT: Role[] = ["OWNER", "MANAGER"];
const OWNER: Role[] = ["OWNER"];

export const PERMISSIONS = {
  // Dashboard
  "dashboard.view": ALL,
  "dashboard.viewProfit": MGMT, // money totals beyond today's sales, profit, cost

  // Products
  "products.view": ALL,
  "products.edit": MGMT,
  "products.viewCost": MGMT,

  // Stock
  "stock.view": ALL,
  "stock.waste": ALL,
  "stock.adjust": MGMT,
  "stock.transfer": MGMT,

  // Sales
  "sales.view": ALL,
  "sales.create": ALL,
  "sales.refund": MGMT,

  // Purchases & suppliers
  "purchases.view": ALL,
  "purchases.edit": MGMT,
  "purchases.receive": ALL,
  "purchases.pay": MGMT,
  "suppliers.view": MGMT,
  "suppliers.edit": MGMT,

  // Customers
  "customers.view": ALL,
  "customers.edit": ALL,
  "customers.delete": MGMT,
  "customers.export": MGMT,

  // Stock audit
  "audits.view": ALL,
  "audits.count": ALL,
  "audits.create": MGMT,
  "audits.approve": MGMT,

  // Expenses & reports
  "expenses.view": MGMT,
  "expenses.edit": MGMT,
  "reports.view": MGMT,

  // Settings
  "settings.view": MGMT,
  "settings.business": OWNER,
  "settings.users": OWNER,
  "settings.branches": OWNER,
  "settings.categories": MGMT,
  "settings.backup": OWNER,

  // Activity log (managers see their own branch's users only)
  "activity.view": MGMT,
  "activity.viewAll": OWNER,
} satisfies Record<string, Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** True if the role has the permission. Unknown roles have no permissions. */
export function can(role: string | null | undefined, permission: Permission): boolean {
  if (!isRole(role)) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
