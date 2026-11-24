# Coffee CRM

Sales, stock, purchases, customers, stock audits, expenses and reports for a
coffee business. Runs on your own computer; works in a browser on a computer
or a phone.

> **Build status:** stage 1 of 10 — login, roles and permissions are done.
> Other menu items show what they will contain. See `docs/PROPOSAL.md` for the
> full plan and `docs/DECISIONS.md` for choices made along the way.

---

## 1. First-time setup

You need **Node.js 20.9 or newer** (check with `node -v`).

```bash
cd coffee-crm
npm install        # downloads the libraries (a few minutes the first time)
npm run setup      # creates the database and loads sample data
npm run dev        # starts the app
```

Open **http://localhost:3000** and log in with one of the demo accounts:

| Email | Role | Branch |
|---|---|---|
| `owner@coffee.test` | Owner — everything | All branches |
| `manager@coffee.test` | Manager | Main Roastery |
| `staff@coffee.test` | Staff | Main Roastery |
| `downtown@coffee.test` | Staff | Downtown Kiosk |

Password for all of them: **`Coffee#2026`**

> ⚠️ These are demo accounts. Before using the app for real, change the
> passwords (Settings → Users, arriving in stage 10) or start from an empty
> database.

### Using it from a phone on the same Wi-Fi

Run `npm run dev -- -H 0.0.0.0`, find your computer's local IP address
(e.g. `192.168.1.20`) and open `http://192.168.1.20:3000` on the phone.

## 2. Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the app for development (reloads when code changes). |
| `npm run build` then `npm start` | Start the faster "production" version. |
| `npm run db:seed` | Load sample data into an **empty** database (refuses if data exists). |
| `npm run db:reset` | ⚠️ **Erase everything** and reload sample data. |
| `npm run db:studio` | Open a spreadsheet-like view of the raw database. |
| `npm test` | Run the quick automatic checks. |
| `npm run test:e2e` | Run the browser tests (run `npm run build` first; `npx playwright install chromium` once). |

## 3. Backing up

All data lives in one file: **`data/dev.db`** (photos will go in
`data/uploads/`). To back up:

1. Stop the app (Ctrl + C in the terminal).
2. Copy the whole **`data`** folder somewhere safe (USB drive, cloud folder).

To restore, stop the app and put the copied `data` folder back.

A one-click **Download backup / Restore** button for the owner arrives in
stage 10 (Settings → Backup).

## 4. Who can do what

Permissions are defined in one file: **`src/lib/auth/roles.ts`**. Each line
lists the roles allowed to do something, for example:

```ts
"sales.refund": MGMT,   // owner and manager
```

Change the roles on a line and both the menu and the server-side protection
change together. Defaults: staff can sell, look up customers, record waste and
count stock, but can't see costs, profit, reports, expenses or settings, and
refunds need a manager.

## 5. Where things are

```
prisma/schema.prisma   the database design (every table is commented)
prisma/seed.ts         the sample data
src/app/               the pages (one folder per menu item)
src/server/            the business rules (stock ledger, sales, …)
src/lib/auth/          login, sessions and permissions
src/lib/money.ts       money is stored in cents to avoid rounding errors
tests/                 automatic checks
data/                  YOUR DATA (database, uploads, backups) — not in git
```

## 6. Settings in `.env`

| Setting | Meaning |
|---|---|
| `DATABASE_URL` | Where the database is. Default `file:./data/dev.db`. |
| `COOKIE_SECURE` | Set to `true` only when the app is served over HTTPS. |

## 7. Moving to PostgreSQL later

1. In `prisma/schema.prisma` change `provider = "sqlite"` to `"postgresql"`.
2. `npm install @prisma/adapter-pg` and in `src/lib/db.ts` replace
   `PrismaBetterSqlite3` with `PrismaPg` (the comment there shows how).
3. Set `DATABASE_URL` to your Postgres connection string.
4. Delete `prisma/migrations`, run `npx prisma migrate dev --name init`.
5. Move your data with the JSON backup/restore (stage 10).
