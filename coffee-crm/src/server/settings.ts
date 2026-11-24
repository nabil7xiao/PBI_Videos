import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

/** Business settings (single row). Cached per request. */
export const getSettings = cache(async () => {
  const s = await db.setting.findUnique({ where: { id: 1 } });
  if (!s) throw new Error("Settings are missing. Run `npm run db:seed` to create them.");
  return s;
});
