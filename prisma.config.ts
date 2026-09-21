import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --experimental-strip-types prisma/seed.ts",
  },
  datasource: {
    // Prisma CLI (db push, migrate, studio) connects directly, bypassing the pooler.
    // Falls back so `prisma generate` (run on every install) never fails when unset.
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
