# Decisions log

Short record of choices made during the build, so future changes have context.

## Business defaults (agreed: "go with the defaults")

- Currency **USD**, tax **10 % included in shelf prices** — both editable in Settings.
- **Two sample branches** (Main Roastery, Downtown Kiosk) so multi-branch
  features and transfers can be tried. A single-shop business simply has one.
- **Drinks** are products with `trackStock = false` (no recipe deduction in v1).
- **Loyalty:** 1 point per $1 spent; 100 points = $1 off.
- **Permissions:** as in the PROPOSAL table, defined in `src/lib/auth/roles.ts`.
- English UI, dates shown as **DD/MM/YYYY**.
- App lives in the `coffee-crm/` folder of this repository.

## Technical

- **Next.js 16.4, Prisma 7.10 (stable), Tailwind 4.** Prisma 8 is still a
  release candidate, so it is not used.
- **Cache Components turned off** (`cacheComponents: false`). Next 16 enables
  it in new projects; it is aimed at mostly-static sites and requires
  `<Suspense>`/`"use cache"` planning on every page. A CRM shows live data on
  every page, so the classic "render fresh on every request" model is simpler
  and less error-prone. Revisit when upgrading to Next 17, where it is planned
  to become the only mode.
- **Own session system** instead of an auth library: random token in an
  HTTP-only cookie, SHA-256 hash in the `Session` table, 7-day sliding expiry.
  Disabling a user deletes their sessions immediately.
- **Login protection:** same error for unknown email and wrong password,
  constant-time comparison for unknown emails, and a 15-minute lockout after
  5 failed attempts per email (in memory — fine for one shop server).
- **`proxy.ts`** (Next 16's replacement for middleware) only checks that a
  session cookie exists; real checks happen on the server in every page and
  action (`requirePermission` / `assertPermission`).
- **System fonts** instead of Google Fonts, so the app works offline.
- `npm audit` reports issues in a dependency of the Prisma command-line tool
  (`effect`). It is a development-only tool, not part of the running app.
