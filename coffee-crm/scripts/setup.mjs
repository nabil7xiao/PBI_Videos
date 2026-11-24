// One-command setup:  npm run setup
// 1. creates .env from .env.example (if missing)
// 2. creates the data folder
// 3. builds the database tables (applies migrations)
// 4. loads sample data if the database is empty
// Safe to run again: it never deletes data.
import { existsSync, copyFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  console.log("Created .env from .env.example");
}
mkdirSync("data/uploads", { recursive: true });
mkdirSync("data/backups", { recursive: true });

run("npx prisma generate");
run("npx prisma migrate deploy");
run("npx prisma db seed");

console.log("\nAll set. Start the app with:  npm run dev   then open http://localhost:3000");
