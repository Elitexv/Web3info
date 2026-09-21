import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { PublishedArticleCard } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function ArticleCard({
  article,
  variant = "default",
}: {
  article: PublishedArticleCard;
  variant?: "default" | "compact" | "horizontal";
}) {
  if (variant === "compact") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group flex items-start gap-3"
      >
        <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          {article.coverImage && (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
            {article.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {article.publishedAt && formatDate(article.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group flex flex-col gap-4 sm:flex-row"
      >
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-64">
          {article.coverImage && (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="256px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="flex-1">
          <Badge variant="secondary" className="mb-2">
            {article.category.name}
          </Badge>
          <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary">
            {article.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {article.publishedAt && formatDate(article.publishedAt)} ·{" "}
            {article.readingTime} min read
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`} className="group flex flex-col">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-105"
            )}
          />
        )}
      </div>
      <Badge variant="secondary" className="mt-3 w-fit">
        {article.category.name}
      </Badge>
      <h3 className="font-display mt-2 text-base font-semibold leading-snug group-hover:text-primary">
        {article.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {article.excerpt}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {article.publishedAt && formatDate(article.publishedAt)} ·{" "}
        {article.readingTime} min read
      </p>
    </Link>
  );
}
