/**
 * The single database connection used by the whole app.
 *
 * Moving to PostgreSQL later: change `provider` in prisma/schema.prisma,
 * swap the adapter below for `PrismaPg` from "@prisma/adapter-pg", and set
 * DATABASE_URL to the Postgres connection string. Nothing else changes.
 */
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

// In development Next.js reloads modules often; reuse one client so we don't
// open a new database connection on every reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/** A database handle that is either the main client or an open transaction. */
export type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;
