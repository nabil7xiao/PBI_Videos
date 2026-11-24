import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Activity log" };

const PAGE_SIZE = 100;

export default async function ActivityPage({ searchParams }: PageProps<"/activity">) {
  const user = await requirePermission("activity.view");
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  // Owners see everything. Managers see activity of users in their own branch
  // (plus their own), but not the owner's.
  const where = can(user.role, "activity.viewAll")
    ? {}
    : user.branchId
      ? { OR: [{ userId: user.id }, { user: { branchId: user.branchId, role: { not: "OWNER" } } }] }
      : { OR: [{ userId: user.id }, { user: { role: { not: "OWNER" } } }] };

  const [rows, total] = await Promise.all([
    db.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    db.activityLog.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader title="Activity log" description="Who did what, and when. Entries can't be edited or deleted." />
      <Card className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs text-stone-500 uppercase">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Who</th>
              <th className="px-4 py-2">What</th>
              <th className="hidden px-4 py-2 md:table-cell">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 whitespace-nowrap text-stone-500">{formatDateTime(r.createdAt)}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.user?.name ?? "—"}</td>
                <td className="px-4 py-2">{r.summary}</td>
                <td className="hidden px-4 py-2 md:table-cell">
                  <code className="text-xs text-stone-500">{r.action}</code>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone-500">
                  No activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-stone-500">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a className="rounded-lg border bg-white px-3 py-1.5" href={`?page=${page - 1}`}>
                Previous
              </a>
            )}
            {page < pages && (
              <a className="rounded-lg border bg-white px-3 py-1.5" href={`?page=${page + 1}`}>
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
