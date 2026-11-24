/**
 * Login sessions.
 *
 * The browser only receives a long random token in an HTTP-only cookie (page
 * scripts cannot read it). The database stores the SHA-256 hash of that
 * token, so even a copy of the database cannot be used to log in.
 */
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "crm_session";
const SESSION_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Create a session for the user and set the cookie. */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * DAY_MS);
  await db.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Look up the session from the cookie. Returns the session with its user, or
 * null if there is no cookie, the session expired, or the user was disabled.
 * Sessions are extended automatically while the user keeps using the app.
 */
export async function readSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { branch: true } } },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now() || !session.user.active) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Sliding expiry: if less than (SESSION_DAYS - 1) days remain, push it out.
  // (The cookie keeps its original expiry; it's refreshed on next login.)
  if (session.expiresAt.getTime() - Date.now() < (SESSION_DAYS - 1) * DAY_MS) {
    await db.session
      .update({ where: { id: session.id }, data: { expiresAt: new Date(Date.now() + SESSION_DAYS * DAY_MS) } })
      .catch(() => {});
  }
  return session;
}

/** Delete the current session (logout) and clear the cookie. */
export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

/** Log a user out everywhere (used when an owner disables an account). */
export async function destroyAllSessionsForUser(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}
