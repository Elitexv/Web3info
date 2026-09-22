import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import ws from "ws";
import path from "node:path";
import { pgliteSchemaSql } from "@/lib/pglite-schema";
import { seedDemoContent } from "@/lib/demo-seed";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaReady: Promise<void> | undefined;
};

const rawUrl = process.env.DATABASE_URL ?? "";
// Falls back to PGlite (embedded Postgres, via WASM) whenever no real
// connection string is configured yet. Set DATABASE_URL/DIRECT_URL (e.g. to
// Neon or Supabase) to switch over — no code changes needed.
const useLocalPGlite = !rawUrl || rawUrl.includes("user:password@host");

// On Vercel there's no writable project directory to persist a PGlite data
// file to, and no guarantee the same instance serves the next request — so
// run fully in-memory there and seed demo content on first use instead.
// Locally, PGlite persists to .pglite-data/ via `npm run db:local-setup`.
const isEphemeralFilesystem = Boolean(process.env.VERCEL);

const logLevels: ("error" | "warn")[] =
  process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

function buildClient(): { client: PrismaClient; ready: Promise<void> } {
  if (!useLocalPGlite) {
    neonConfig.webSocketConstructor = ws;
    const client = new PrismaClient({
      adapter: new PrismaNeon({ connectionString: rawUrl }),
      log: logLevels,
    });
    return { client, ready: Promise.resolve() };
  }

  if (!isEphemeralFilesystem) {
    const dataDir = path.join(process.cwd(), ".pglite-data");
    const client = new PrismaClient({
      adapter: new PrismaPGlite(new PGlite(dataDir)),
      log: logLevels,
    });
    console.warn(
      "[db] No real DATABASE_URL configured — using a local PGlite database at .pglite-data/. Run `npm run db:local-setup` to create/seed it, or set DATABASE_URL/DIRECT_URL to a real Postgres database (Neon, Supabase, ...)."
    );
    return { client, ready: Promise.resolve() };
  }

  // Deployed with no database configured: spin up an in-memory demo database
  // for this instance, seeded with sample content, so the site is fully
  // browsable rather than erroring on every DB-backed page.
  const pglite = new PGlite();
  const client = new PrismaClient({
    adapter: new PrismaPGlite(pglite),
    log: logLevels,
  });
  const ready = (async () => {
    await pglite.exec(pgliteSchemaSql);
    await seedDemoContent(client);
    console.warn(
      "[db] No DATABASE_URL configured in this deployment — serving an in-memory demo database seeded with sample articles. Set DATABASE_URL/DIRECT_URL (Neon, Supabase, ...) for real, persistent data."
    );
  })();
  return { client, ready };
}

/**
 * Wraps a Prisma client so every model method (`prisma.article.findMany`,
 * `prisma.user.upsert`, ...) and top-level method (`prisma.$disconnect`)
 * waits for `ready` before running. A no-op once `ready` has resolved.
 * Only supports the flat `prisma.<model>.<method>(...)` shape this codebase
 * actually uses — not Prisma's fluent relation chaining.
 */
function withReady<T extends object>(target: T, ready: Promise<void>): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);
      if (typeof value === "function") {
        return (...args: unknown[]) => ready.then(() => value.apply(obj, args));
      }
      if (value && typeof value === "object") {
        return withReady(value, ready);
      }
      return value;
    },
  }) as T;
}

let client: PrismaClient;
let ready: Promise<void>;

if (globalForPrisma.prisma && globalForPrisma.prismaReady) {
  client = globalForPrisma.prisma;
  ready = globalForPrisma.prismaReady;
} else {
  ({ client, ready } = buildClient());
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaReady = ready;
  }
}

export const prisma = withReady(client, ready);
