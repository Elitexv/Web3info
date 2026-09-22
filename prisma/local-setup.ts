import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { seedDemoContent } from "../lib/demo-seed.ts";

const DATA_DIR = path.join(process.cwd(), ".pglite-data");
const SCHEMA_SQL = path.join(process.cwd(), "prisma", "pglite-schema.sql");

async function applySchemaIfNeeded(client: PGlite) {
  const exists = await client.query(
    `SELECT to_regclass('public."User"') as reg;`
  );
  const already = (exists.rows[0] as { reg: string | null }).reg !== null;
  if (already) {
    console.log("[local-setup] Schema already applied, skipping.");
    return;
  }
  console.log("[local-setup] Applying schema...");
  const sql = fs.readFileSync(SCHEMA_SQL, "utf8");
  await client.exec(sql);
  console.log("[local-setup] Schema applied.");
}

async function main() {
  const isFresh = !fs.existsSync(DATA_DIR);
  const client = new PGlite(DATA_DIR);
  await applySchemaIfNeeded(client);

  const adapter = new PrismaPGlite(client);
  const prisma = new PrismaClient({ adapter });

  const result = await seedDemoContent(prisma);

  console.log(`[local-setup] Admin: ${result.adminEmail} / ${result.adminPassword}`);
  console.log(`[local-setup] Articles: ${result.articleCount}`);
  console.log(
    `[local-setup] Local PGlite database ready${isFresh ? " (freshly created)" : ""} at ${DATA_DIR}`
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
