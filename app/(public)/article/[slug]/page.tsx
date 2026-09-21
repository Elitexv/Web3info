import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles } from "@/lib/queries";
import { buildArticleJsonLd, buildArticleMetadata, SITE_URL } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Reactions } from "@/components/site/reactions";
import { CommentSection } from "@/components/site/comment-section";
import { ShareButtons } from "@/components/site/share-buttons";
import { ArticleCard } from "@/components/site/article-card";
import { ViewTracker } from "@/components/site/view-tracker";

export const revalidate = 60;

export async function generateMetadata(props: PageProps<"/article/[slug]">) {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return buildArticleMetadata({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    slug: article.slug,
    image: article.ogImage || article.coverImage,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: article.author.name,
  });
}

export default async function ArticlePage(props: PageProps<"/article/[slug]">) {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.category.slug, article.id, 3);

  const reactionCounts = { LIKE: 0, BULLISH: 0, BEARISH: 0 };
  for (const r of article.reactions) {
    reactionCounts[r.type] = (reactionCounts[r.type] ?? 0) + 1;
  }

  const jsonLd = buildArticleJsonLd({
    title: article.title,
    description: article.seoDescription || article.excerpt,
    slug: article.slug,
    image: article.ogImage || article.coverImage,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: article.author.name,
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <ViewTracker articleId={article.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={`/category/${article.category.slug}`}
        className="text-sm font-medium text-primary hover:underline"
      >
        {article.category.name}
      </Link>
      <h1 className="font-display mt-3 text-3xl font-bold leading-tight sm:text-4xl">
        {article.title}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
        <div className="text-sm">
          <p className="font-medium">{article.author.name}</p>
          <p className="text-muted-foreground">
            {article.publishedAt && formatDate(article.publishedAt)} ·{" "}
            {article.readingTime} min read · {article.views} views
          </p>
        </div>
        <ShareButtons
          url={`${SITE_URL}/article/${article.slug}`}
          title={article.title}
        />
      </div>

      {article.coverImage && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div
        className="prose-article mt-8"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <Link key={tag.slug} href={`/tag/${tag.slug}`}>
            <Badge variant="outline">#{tag.name}</Badge>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Reactions
          articleId={article.id}
          counts={reactionCounts}
          initialReactedTypes={[]}
        />
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display mb-6 text-xl font-bold">
            Related stories
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {related.map((r) => (
              <ArticleCard key={r.id} article={r} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 border-t border-border pt-10">
        <CommentSection articleId={article.id} comments={article.comments} />
      </section>
    </article>
  );
}
