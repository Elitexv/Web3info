import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Webinfo";
export const SITE_DESCRIPTION =
  "Breaking Web3, crypto, and blockchain news, market moves, and deep dives — updated around the clock.";

type ArticleSeoInput = {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  authorName?: string;
};

export function buildArticleMetadata(article: ArticleSeoInput): Metadata {
  const url = `${SITE_URL}/article/${article.slug}`;
  const image = article.image ?? `${SITE_URL}/og-default.png`;

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: url },
    authors: article.authorName ? [{ name: article.authorName }] : undefined,
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.description,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
      publishedTime: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      modifiedTime: article.updatedAt
        ? new Date(article.updatedAt).toISOString()
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [image],
    },
  };
}

export function buildArticleJsonLd(article: {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  authorName: string;
}) {
  const url = `${SITE_URL}/article/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    image: article.image ? [article.image] : undefined,
    datePublished: article.publishedAt
      ? new Date(article.publishedAt).toISOString()
      : undefined,
    dateModified: article.updatedAt
      ? new Date(article.updatedAt).toISOString()
      : undefined,
    author: [{ "@type": "Person", name: article.authorName }],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}
