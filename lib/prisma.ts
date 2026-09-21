import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import ws from "ws";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const rawUrl = process.env.DATABASE_URL ?? "";
// Falls back to a local, zero-config PGlite database when no real Postgres
// connection string is configured yet — lets the app run immediately without
// a Neon account. Set a real DATABASE_URL/DIRECT_URL to switch to Neon.
const useLocalPGlite = !rawUrl || rawUrl.includes("user:password@host");

function createAdapter() {
  if (useLocalPGlite && process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not set. Production needs a real Postgres (e.g. Neon) connection string — the local PGlite fallback is dev-only."
    );
  }

  if (useLocalPGlite) {
    const dataDir = path.join(process.cwd(), ".pglite-data");
    const client = new PGlite(dataDir);
    return new PrismaPGlite(client);
  }

  neonConfig.webSocketConstructor = ws;
  return new PrismaNeon({ connectionString: rawUrl });
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

if (useLocalPGlite && process.env.NODE_ENV !== "production") {
  console.warn(
    "[db] No real DATABASE_URL configured — using a local PGlite database at .pglite-data/. Run `npm run db:local-setup` to create it, or set DATABASE_URL/DIRECT_URL to a real Neon database."
  );
}
