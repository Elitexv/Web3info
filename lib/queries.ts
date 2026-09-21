import { prisma } from "@/lib/prisma";

const publishedArticleSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  readingTime: true,
  views: true,
  category: { select: { name: true, slug: true } },
  author: { select: { name: true } },
} as const;

export async function getFeaturedArticle() {
  return prisma.article.findFirst({
    where: { status: "PUBLISHED", featured: true },
    orderBy: { publishedAt: "desc" },
    select: publishedArticleSelect,
  });
}

export async function getLatestArticles(opts: {
  take?: number;
  skip?: number;
  excludeId?: string;
} = {}) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(opts.excludeId ? { NOT: { id: opts.excludeId } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: opts.take ?? 12,
    skip: opts.skip ?? 0,
    select: publishedArticleSelect,
  });
}

export async function getTrendingArticles(take = 5) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { views: "desc" },
    take,
    select: publishedArticleSelect,
  });
}

export async function getArticlesByCategory(slug: string, take = 12, skip = 0) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", category: { slug } },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: publishedArticleSelect,
  });
}

export async function getArticlesByTag(slug: string, take = 12, skip = 0) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", tags: { some: { slug } } },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: publishedArticleSelect,
  });
}

export async function searchArticles(query: string, take = 20) {
  if (!query.trim()) return [];
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: publishedArticleSelect,
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true, image: true } },
      category: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
      comments: { orderBy: { createdAt: "desc" } },
      reactions: true,
    },
  });
}

export async function getRelatedArticles(categorySlug: string, excludeId: string, take = 3) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      category: { slug: categorySlug },
      NOT: { id: excludeId },
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: publishedArticleSelect,
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export type PublishedArticleCard = Awaited<
  ReturnType<typeof getLatestArticles>
>[number];
