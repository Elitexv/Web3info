import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArticlesByTag } from "@/lib/queries";
import { ArticleCard } from "@/components/site/article-card";
import { SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(
  props: PageProps<"/tag/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return {};

  return {
    title: `#${tag.name}`,
    description: `Articles tagged #${tag.name}.`,
    alternates: { canonical: `${SITE_URL}/tag/${slug}` },
  };
}

export default async function TagPage(props: PageProps<"/tag/[slug]">) {
  const { slug } = await props.params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) notFound();

  const articles = await getArticlesByTag(slug, 24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">#{tag.name}</h1>
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
          No stories tagged with this yet.
        </p>
      )}
    </div>
  );
}
