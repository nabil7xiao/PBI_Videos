"use client";

/**
 * The frame around every page: a sidebar on computers, and a top bar with a
 * slide-out menu on phones.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  Coffee,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import type { IconName, NavItem } from "./nav-items";

const ICONS: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  sales: Receipt,
  customers: Users,
  products: Package,
  stock: Warehouse,
  purchases: ShoppingCart,
  suppliers: Truck,
  audits: ClipboardCheck,
  expenses: Wallet,
  reports: BarChart3,
  activity: History,
  settings: Settings,
};

type Props = {
  businessName: string;
  items: NavItem[];
  user: { name: string; roleLabel: string; branchLabel: string };
  logoutAction: () => Promise<void>;
  children: ReactNode;
};

export function AppShell({ businessName, items, user, logoutAction, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const nav = (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Main">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
              active ? "bg-coffee-700 text-white" : "text-coffee-100 hover:bg-coffee-800"
            }`}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const userBox = (
    <div className="border-t border-coffee-800 p-4">
      <p className="truncate text-sm font-medium text-white" data-testid="current-user">
        {user.name}
      </p>
      <p className="truncate text-xs text-coffee-200">
        {user.roleLabel} · {user.branchLabel}
      </p>
      <form action={logoutAction} className="mt-3">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-coffee-700 px-3 py-1.5 text-sm text-coffee-100 hover:bg-coffee-800"
        >
          <LogOut className="size-4" aria-hidden /> Log out
        </button>
      </form>
    </div>
  );

  const brand = (
    <div className="flex items-center gap-2 px-5 py-4">
      <Coffee className="size-6 text-coffee-300" aria-hidden />
      <span className="truncate font-semibold text-white">{businessName}</span>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="no-print hidden w-60 shrink-0 flex-col bg-coffee-900 lg:sticky lg:top-0 lg:flex lg:h-screen">
        {brand}
        {nav}
        {userBox}
      </aside>

      {/* Phone top bar */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between bg-coffee-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Coffee className="size-5 text-coffee-300" aria-hidden />
          <span className="font-semibold text-white">{businessName}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-coffee-100 hover:bg-coffee-800"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Phone slide-out menu */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-coffee-900">
            <div className="flex items-center justify-between pr-3">
              {brand}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-coffee-100 hover:bg-coffee-800"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            {nav}
            {userBox}
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
