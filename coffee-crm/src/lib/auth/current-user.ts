/**
 * The "who is logged in and what may they do" layer. Every page and server
 * action calls one of these before touching data — hiding a menu item is not
 * protection, these checks are.
 */
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "./session";
import { can, isRole, type Permission, type Role } from "./roles";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Branch the user is pinned to, or null if they can work in all branches. */
  branchId: string | null;
  branchName: string | null;
};

/** The logged-in user, or null. Cached for the duration of one request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSession();
  if (!session || !isRole(session.user.role)) return null;
  const u = session.user;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as Role,
    branchId: u.branchId,
    branchName: u.branch?.name ?? null,
  };
});

/** Use at the top of any protected page: sends visitors to /login. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Use at the top of a page that needs a permission: shows "no access" otherwise. */
export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) redirect("/no-access");
  return user;
}

/**
 * Use inside server actions. Throws instead of redirecting so the form can
 * show the message.
 */
export async function assertPermission(permission: Permission): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new PermissionError("Your session has expired. Please log in again.");
  if (!can(user.role, permission)) throw new PermissionError("You don't have permission to do that.");
  return user;
}

export class PermissionError extends Error {}
