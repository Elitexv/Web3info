import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "change-me-now";
  const name = process.env.ADMIN_NAME ?? "Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash, role: "ADMIN" },
  });

  const categories = [
    { name: "DeFi", slug: "defi" },
    { name: "NFTs", slug: "nfts" },
    { name: "Regulation", slug: "regulation" },
    { name: "Markets", slug: "markets" },
    { name: "Technology", slug: "technology" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const defi = await prisma.category.findUniqueOrThrow({
    where: { slug: "defi" },
  });

  const existing = await prisma.article.findUnique({
    where: { slug: "welcome-to-webinfo" },
  });

  if (!existing) {
    await prisma.article.create({
      data: {
        title: "Welcome to Webinfo",
        slug: "welcome-to-webinfo",
        excerpt:
          "Your new home for Web3 news, market moves, and on-chain analysis — built for speed and built to be found.",
        contentHtml:
          "<p>This is your first article. Head to <strong>/admin</strong> to edit or publish new stories.</p>",
        status: "PUBLISHED",
        featured: true,
        readingTime: 1,
        publishedAt: new Date(),
        authorId: admin.id,
        categoryId: defi.id,
        seoTitle: "Welcome to Webinfo",
        seoDescription:
          "Your new home for Web3 news, market moves, and on-chain analysis.",
      },
    });
  }

  console.log(`Seeded admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
