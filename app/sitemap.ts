import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, tags] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.tag.findMany({ select: { slug: true } }),
  ]);

  return [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    ...articles.map((a) => ({
      url: `${SITE_URL}/article/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...tags.map((t) => ({
      url: `${SITE_URL}/tag/${t.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
