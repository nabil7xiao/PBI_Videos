"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyAgainstDummy, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, readSession } from "@/lib/auth/session";
import { clearFailures, isLockedOut, recordFailure } from "@/lib/auth/rate-limit";
import { logActivity } from "@/server/activity";

export type LoginState = { error?: string; email?: string };

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

/** Only allow redirects to pages inside this app (never to another website). */
function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  const { password, next } = parsed.data;
  const key = parsed.data.email;
  if (isLockedOut(key)) {
    return { error: "Too many failed attempts. Please wait 15 minutes and try again.", email };
  }

  const user = await db.user.findUnique({ where: { email: key } });
  const ok = user ? await verifyPassword(password, user.passwordHash) : await verifyAgainstDummy(password);

  if (!user || !ok || !user.active) {
    recordFailure(key);
    await logActivity({
      userId: user?.id ?? null,
      action: "auth.login_failed",
      summary: `Failed login for ${key}${user && !user.active ? " (account disabled)" : ""}`,
    });
    // Same message whatever went wrong, so it doesn't reveal which emails exist.
    return { error: "Email or password is incorrect.", email };
  }

  clearFailures(key);
  await createSession(user.id);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await logActivity({ userId: user.id, action: "auth.login", summary: `${user.name} logged in` });

  redirect(safeNext(next));
}

export async function logout() {
  const session = await readSession();
  if (session) {
    await logActivity({ userId: session.userId, action: "auth.logout", summary: `${session.user.name} logged out` });
  }
  await destroySession();
  redirect("/login");
}
