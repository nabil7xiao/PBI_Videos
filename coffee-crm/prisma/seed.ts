/**
 * Sample data so you can click through everything straight away.
 *
 *   npm run db:seed     fills an EMPTY database (refuses if data already exists,
 *                       so it can never overwrite your real records)
 *   npm run db:reset    wipes the database and re-runs this seed
 *
 * Demo logins (all use the password below — change them before real use):
 *   owner@coffee.test     Owner, all branches
 *   manager@coffee.test   Manager, Main branch
 *   staff@coffee.test     Staff, Main branch
 *   downtown@coffee.test  Staff, Downtown branch
 */
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth/password";

export const DEMO_PASSWORD = "Coffee#2026";

async function main() {
  if (await db.setting.findUnique({ where: { id: 1 } })) {
    console.log("The database already has data, so the seed was skipped.");
    console.log("To start again from sample data, run: npm run db:reset  (this ERASES everything)");
    return;
  }

  console.log("Seeding settings, branches and users…");

  await db.setting.create({
    data: {
      id: 1,
      businessName: "Bean & Brew Coffee Co.",
      legalName: "Bean & Brew Coffee Company LLC",
      address: "12 Roastery Lane, Springfield",
      phone: "+1 555 0100",
      email: "hello@beanandbrew.test",
      currencyCode: "USD",
      currencyDecimals: 2,
      taxRateBps: 1000, // 10 %
      pricesIncludeTax: true,
      allowNegativeStock: false,
      receiptFooter: "Thank you for your visit! Freshly roasted, every week.",
      loyaltyEarnRate: 1, // 1 point per $1
      loyaltyPointValue: 1, // 1 point = 1 cent → 100 points = $1
      vipSpendThreshold: 100_000, // $1,000 in the last 365 days
      newCustomerDays: 30,
      inactiveAfterDays: 90,
    },
  });

  const main = await db.branch.create({
    data: { name: "Main Roastery", code: "MAIN", address: "12 Roastery Lane", phone: "+1 555 0100" },
  });
  const downtown = await db.branch.create({
    data: { name: "Downtown Kiosk", code: "DT", address: "4 Market Square", phone: "+1 555 0142" },
  });

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const users = [
    { name: "Olivia Owner", email: "owner@coffee.test", role: "OWNER", branchId: null },
    { name: "Marco Manager", email: "manager@coffee.test", role: "MANAGER", branchId: main.id },
    { name: "Sam Staff", email: "staff@coffee.test", role: "STAFF", branchId: main.id },
    { name: "Dana Downtown", email: "downtown@coffee.test", role: "STAFF", branchId: downtown.id },
  ];
  for (const u of users) await db.user.create({ data: { ...u, passwordHash } });

  console.log("Seeding categories…");
  const categories = ["Whole Beans", "Ground Coffee", "Capsules", "Equipment", "Drinks", "Accessories"];
  for (const [i, name] of categories.entries()) await db.category.create({ data: { name, sortOrder: i } });

  const expenseCategories = ["Rent", "Salaries", "Utilities", "Marketing", "Maintenance", "Supplies", "Other"];
  for (const name of expenseCategories) await db.expenseCategory.create({ data: { name } });

  const owner = await db.user.findUniqueOrThrow({ where: { email: "owner@coffee.test" } });
  await db.activityLog.create({
    data: { userId: owner.id, action: "system.seed", summary: "Sample data loaded" },
  });

  console.log(`Done. Log in with owner@coffee.test / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
