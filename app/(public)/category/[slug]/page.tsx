import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArticlesByCategory } from "@/lib/queries";
import { ArticleCard } from "@/components/site/article-card";
import { SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(
  props: PageProps<"/category/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};

  return {
    title: `${category.name} News`,
    description: `The latest ${category.name} news, analysis, and market moves.`,
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
  };
}

export default async function CategoryPage(
  props: PageProps<"/category/[slug]">
) {
  const { slug } = await props.params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const articles = await getArticlesByCategory(slug, 24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">{category.name}</h1>
      <p className="mt-2 text-muted-foreground">
        {articles.length} {articles.length === 1 ? "story" : "stories"}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="mt-10 text-muted-foreground">
          No stories published in this category yet.
        </p>
      )}
    </div>
  );
}
