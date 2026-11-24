/**
 * Activity log: "who did what and when". Call logActivity() inside the same
 * database transaction as the change it describes, so a log entry exists if
 * and only if the change was saved.
 */
import "server-only";
import { db, type Tx } from "@/lib/db";

export type ActivityInput = {
  userId: string | null;
  action: string; // e.g. "sale.create", "auth.login"
  summary: string; // human readable sentence
  entityType?: string;
  entityId?: string;
  metadata?: unknown; // anything JSON-serialisable (e.g. before/after values)
};

export async function logActivity(input: ActivityInput, tx: Tx = db) {
  await tx.activityLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      summary: input.summary,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata === undefined ? null : JSON.stringify(input.metadata),
    },
  });
}
