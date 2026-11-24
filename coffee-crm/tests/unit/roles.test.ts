import { describe, expect, it } from "vitest";
import { can, PERMISSIONS, ROLES, type Permission } from "@/lib/auth/roles";

describe("permissions", () => {
  it("owner has every permission", () => {
    for (const p of Object.keys(PERMISSIONS) as Permission[]) expect(can("OWNER", p)).toBe(true);
  });

  it("staff can sell and count stock but not see money-sensitive areas", () => {
    expect(can("STAFF", "sales.create")).toBe(true);
    expect(can("STAFF", "audits.count")).toBe(true);
    expect(can("STAFF", "stock.waste")).toBe(true);
    expect(can("STAFF", "sales.refund")).toBe(false);
    expect(can("STAFF", "products.viewCost")).toBe(false);
    expect(can("STAFF", "reports.view")).toBe(false);
    expect(can("STAFF", "expenses.view")).toBe(false);
    expect(can("STAFF", "audits.approve")).toBe(false);
    expect(can("STAFF", "settings.view")).toBe(false);
  });

  it("manager can approve and refund but not manage users or backups", () => {
    expect(can("MANAGER", "audits.approve")).toBe(true);
    expect(can("MANAGER", "sales.refund")).toBe(true);
    expect(can("MANAGER", "reports.view")).toBe(true);
    expect(can("MANAGER", "settings.users")).toBe(false);
    expect(can("MANAGER", "settings.backup")).toBe(false);
    expect(can("MANAGER", "settings.business")).toBe(false);
  });

  it("unknown or missing roles have no permissions", () => {
    expect(can("ADMIN", "dashboard.view")).toBe(false);
    expect(can(null, "dashboard.view")).toBe(false);
    expect(can(undefined, "sales.view")).toBe(false);
  });

  it("every permission lists only known roles", () => {
    for (const roles of Object.values(PERMISSIONS)) for (const r of roles) expect(ROLES).toContain(r);
  });
});
