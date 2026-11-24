import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page in this CRM shows live, per-user data (stock, sales, ...), so we
  // use the classic "always render fresh on each request" model instead of
  // Cache Components. See docs/DECISIONS.md.
  cacheComponents: false,
  // The SQLite driver is a native module; keep it out of the server bundle.
  serverExternalPackages: ["better-sqlite3"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
