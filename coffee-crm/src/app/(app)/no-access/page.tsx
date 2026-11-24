import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Card } from "@/components/ui/card";

export default async function NoAccessPage() {
  const user = await requireUser();
  return (
    <Card className="mx-auto mt-10 max-w-md text-center">
      <ShieldAlert className="mx-auto mb-3 size-10 text-amber-600" aria-hidden />
      <h1 className="text-lg font-semibold">You don&apos;t have access to that page</h1>
      <p className="mt-1 text-sm text-stone-500">
        Your role ({ROLE_LABELS[user.role]}) can&apos;t open it. Ask the owner if you need access.
      </p>
      <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-coffee-700 underline">
        Back to the dashboard
      </Link>
    </Card>
  );
}
