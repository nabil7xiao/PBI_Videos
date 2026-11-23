# Coffee CRM — Stage 0 proposal (awaiting approval)

Nothing has been built yet. This document covers the plan, the database schema,
the folder structure and the open questions. Once you approve it (with any
changes), stage 1 starts.

The full schema is in [`../prisma/schema.prisma`](../prisma/schema.prisma). It has
been checked with `prisma validate` and creates all 25 tables on SQLite.

---

## 1. Tech choices

| Area | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Pages and server logic in one project. |
| Styling | Tailwind CSS v4 | Responsive, works on phone and desktop. |
| Database | Prisma 7.10 (stable) + SQLite | One file on disk in development. Postgres later by changing one line. Prisma 8 is still a release candidate, so I'm not using it. |
| Auth | Email + password (bcrypt), sessions stored in the database, HTTP-only cookie | No external service. Deactivating a user logs them out right away. |
| Validation | Zod schemas shared by forms and server actions | The same rules run everywhere, so input is always checked on the server. |
| Charts | Recharts | As requested. |
| CSV / PDF export | Plain CSV + `@react-pdf/renderer` | Gives real PDF files, not just "print to PDF". |
| Tests | Vitest for business rules + a Playwright smoke test per stage | Lets me run and test after each stage, as the brief asks. |

## 2. Key design decisions

1. **Money is stored as whole cents** (integers) and **quantities as decimals**,
   so you can sell 0.250 kg of beans without rounding errors.
2. **A single stock ledger.** Every stock change goes through one function,
   `postStockMovement()`, in `src/server/stock.ts`. That includes purchases,
   sales, returns, waste, adjustments, audit corrections and transfers. In the
   same transaction it writes a `StockMovement` row and updates the cached
   `StockLevel`. That function is also the only place the negative-stock rule is
   enforced, and it respects the `allowNegativeStock` setting. A "Reconcile"
   check (under Settings, also used in tests) rebuilds the stock levels from the
   ledger and confirms they match.
3. **Profit uses weighted-average cost.** Each receipt of goods updates the
   average cost per product per branch. Each sale line saves the cost at that
   moment, so gross profit for past months never changes when prices change
   later.
4. **History is never rewritten.** Sale and purchase lines save the product
   name, price and cost at the time of the transaction. Products, customers,
   suppliers and users are deactivated instead of deleted.
5. **Customer segments are calculated, not typed in.** They use thresholds you
   can change in Settings:
   - **NEW**: first purchase within the last 30 days.
   - **VIP**: has spent at least the VIP threshold in the last 365 days.
   - **INACTIVE**: no purchase in the last 90 days.
   - **REGULAR**: everyone else.
6. **Audits** save each product's system quantity when the audit starts. On
   approval, only the variance (counted minus system) is posted to the ledger,
   so sales made while staff were counting aren't lost. A reason is required
   for every non-zero variance, and only a manager or owner can approve.
7. **Refunds and returns** are recorded per line. For each line you choose
   whether it goes back on the shelf (stock comes back in) or is
   damaged/written off (money is returned, stock is not). Loyalty points from
   the refunded part are taken back.
8. **Backup and restore** (owner only):
   - **Download backup** gives a JSON export of every table. It works for both
     SQLite and Postgres, so it also covers a future move to Postgres.
   - **Restore** automatically saves a backup first, then replaces all data in
     one transaction.
   - The README also explains how to copy the raw `.db` file.
9. **Document numbers** are gap-free and separate for each branch, for example
   `S-MAIN-000123`, `PO-MAIN-000045`, `R-MAIN-000012` and `AUD-MAIN-000007`.
10. **Product photos** are saved in `data/uploads/` and served through the app.
    Next.js doesn't serve files added to `public/` after the build.

## 3. Default permissions (editable in code; one file)

✅ = full access · 👁 = view only · — = no access

| Page | Owner | Manager | Staff |
|---|---|---|---|
| Dashboard | ✅ (with profit) | ✅ (with profit) | 👁 today's sales only, no cost/profit |
| Products | ✅ | ✅ | 👁 (no cost prices) |
| Stock / movements | ✅ | ✅ adjust, waste, transfer | 👁 + record waste |
| Sales (POS) | ✅ | ✅ + refunds | ✅ create sales; refunds need manager |
| Purchases | ✅ | ✅ | 👁 + receive goods |
| Suppliers | ✅ | ✅ | — |
| Customers | ✅ | ✅ | ✅ (no delete/export) |
| Stock audit | ✅ approve | ✅ approve | ✅ count only |
| Expenses | ✅ | ✅ | — |
| Reports | ✅ | ✅ | — |
| Settings: business, tax, currency | ✅ | — | — |
| Settings: users and roles | ✅ | — | — |
| Settings: categories | ✅ | ✅ | — |
| Settings: backup and restore | ✅ | — | — |
| Activity log | ✅ all | ✅ own branch | — |

Every permission is checked on the server as well as hidden in the menu.

## 4. Folder structure

```
coffee-crm/
├─ README.md                  how to install, run, seed, back up, restore
├─ prisma/
│  ├─ schema.prisma           the database design (this proposal)
│  ├─ migrations/             generated history of schema changes
│  └─ seed.ts                 realistic sample data (≈ 12 months of sales)
├─ prisma.config.ts
├─ data/                      (git-ignored) dev.db, uploads/, backups/
├─ src/
│  ├─ app/
│  │  ├─ login/               login page
│  │  ├─ (app)/               everything behind login, with sidebar layout
│  │  │  ├─ dashboard/
│  │  │  ├─ products/         list · new · [id] edit
│  │  │  ├─ stock/            levels · movements · adjust · transfer
│  │  │  ├─ purchases/        list · new · [id] (receive, pay)
│  │  │  ├─ suppliers/
│  │  │  ├─ sales/            list · new (POS) · [id] · [id]/receipt · [id]/refund
│  │  │  ├─ customers/
│  │  │  ├─ audits/           list · new · [id] count / review / approve
│  │  │  ├─ expenses/
│  │  │  ├─ reports/          sales · profit · products · customers · suppliers
│  │  │  ├─ activity/
│  │  │  └─ settings/         business · users · branches · categories · backup
│  │  └─ api/                 file downloads only: CSV, PDF, backup, photos
│  ├─ server/                 ALL business rules live here (one file per area)
│  │  ├─ stock.ts             postStockMovement(): the single ledger entry point
│  │  ├─ sales.ts  refunds.ts  purchases.ts  audits.ts
│  │  ├─ customers.ts  expenses.ts  reports.ts  backup.ts  activity.ts
│  ├─ lib/
│  │  ├─ db.ts                Prisma client
│  │  ├─ auth/                session.ts, password.ts, permissions.ts
│  │  ├─ validation/          Zod schemas
│  │  └─ money.ts  format.ts  dates.ts
│  └─ components/             ui/, forms/, charts/, layout/
└─ tests/                     Vitest (ledger, sales, audits) + Playwright smoke
```

Pages stay thin. They call functions in `src/server/`, and every write there
runs inside a database transaction and writes to the activity log.

## 5. Build order (each stage is run, tested and demoed before the next)

0. **Scaffold**: project setup, schema, migration, seed skeleton, layout and
   README.
1. **Auth and roles**: login/logout, sessions, permission guard, users seeded
   for each role.
2. **Products**: categories, products, photo upload, CSV import (optional).
3. **Stock**: ledger service, stock levels, movement history, adjust and waste,
   low-stock and out-of-stock flags, branch transfer.
4. **Purchases and suppliers**: purchase orders, partial receiving, supplier
   payments, outstanding balances.
5. **Sales**: POS screen, discounts, split payments, receipt, refunds and
   returns.
6. **Customers**: CRM profiles, history, loyalty earn and redeem, segments,
   notes.
7. **Stock audit**: start, count (works on a phone), review variances, approve
   and post.
8. **Expenses**: categories and entries.
9. **Reports and dashboard**: monthly and yearly views, month-over-month and
   year-over-year comparisons, best and worst products, customer growth,
   supplier spend, CSV and PDF export.
10. **Settings and activity log UI**: business details, tax, currency, users,
    backup and restore, reconcile check.

## 6. Questions for you

1. **Currency**: which one? (For example USD, EUR, GBP, AED, SAR or MAD.)
2. **Branches**: one shop or several? If several, do you need stock transfers
   between branches?
3. **Tax**: what rate, and do your shelf prices already include tax?
4. **Drinks**: do you sell made-to-order drinks? I suggest treating them as
   non-stock items in v1. Recipes that deduct beans and milk could be added
   later.
5. **Loyalty**: is "1 point per 1 unit of currency spent, 100 points = 1 unit
   off" a good default?
6. **Permissions**: is the table in section 3 right for your staff?
7. **Where the code lives**: this repository (PBI_Videos) holds Power BI
   videos, so I've put the app in a self-contained `coffee-crm/` folder on the
   working branch. Is that OK, or would you like a separate repository?
8. **Language and date format**: English UI with dates as DD/MM/YYYY?
