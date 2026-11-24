import { requireUser } from "@/lib/auth/current-user";
import { can, ROLE_LABELS } from "@/lib/auth/roles";
import { AppShell } from "@/components/layout/app-shell";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { getSettings } from "@/server/settings";
import { logout } from "@/app/login/actions";

// Everything inside the (app) folder requires a logged-in user.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const settings = await getSettings();
  const items = NAV_ITEMS.filter((item) => can(user.role, item.permission));

  return (
    <AppShell
      businessName={settings.businessName}
      items={items}
      user={{ name: user.name, roleLabel: ROLE_LABELS[user.role], branchLabel: user.branchName ?? "All branches" }}
      logoutAction={logout}
    >
      {children}
    </AppShell>
  );
}
