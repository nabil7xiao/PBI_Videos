/**
 * Runs before every page request. It only does a quick check: "is there a
 * login cookie at all?". If not, the visitor is sent to the login page.
 * The real checks (is the session valid, does the role allow this page) happen
 * on the server in each page and action — see src/lib/auth/current-user.ts.
 */
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "crm_session";
const PUBLIC_PATHS = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const hasCookie = request.cookies.has(SESSION_COOKIE);

  if (!isPublic && !hasCookie) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals, API file downloads handle auth themselves, and static files.
  matcher: ["/((?!_next/static|_next/image|api/|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
