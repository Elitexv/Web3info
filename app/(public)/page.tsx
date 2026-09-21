import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame } from "lucide-react";
import {
  getFeaturedArticle,
  getLatestArticles,
  getTrendingArticles,
} from "@/lib/queries";
import { ArticleCard } from "@/components/site/article-card";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, trending] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles({ take: 9 }),
    getTrendingArticles(5),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {featured && (
        <Link
          href={`/article/${featured.slug}`}
          className="group relative mb-12 block overflow-hidden rounded-2xl border border-border"
        >
          <div className="relative aspect-[16/8] w-full bg-muted sm:aspect-[16/6]">
            {featured.coverImage && (
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                priority
                sizes="100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <Badge className="mb-3 bg-primary text-primary-foreground">
              {featured.category.name}
            </Badge>
            <h1 className="font-display max-w-3xl text-2xl font-bold leading-tight text-white sm:text-4xl">
              {featured.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
              {featured.excerpt}
            </p>
            <p className="mt-4 text-xs text-white/60">
              {featured.publishedAt && formatDate(featured.publishedAt)} ·{" "}
              {featured.readingTime} min read
            </p>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Latest</h2>
            <Link
              href="/search"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Browse all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <div className="glow-border rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Flame className="size-4 text-accent" />
              <h3 className="font-display font-semibold">Trending now</h3>
            </div>
            <div className="space-y-4">
              {trending.map((article, i) => (
                <div key={article.id} className="flex gap-3">
                  <span className="font-display text-lg font-bold text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <ArticleCard article={article} variant="compact" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
