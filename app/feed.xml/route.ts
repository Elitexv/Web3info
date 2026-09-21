import { prisma } from "@/lib/prisma";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const revalidate = 300;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  const items = articles
    .map(
      (a) => `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${SITE_URL}/article/${a.slug}</link>
      <guid>${SITE_URL}/article/${a.slug}</guid>
      <pubDate>${a.publishedAt?.toUTCString() ?? ""}</pubDate>
      <description>${escapeXml(a.excerpt)}</description>
      <author>${escapeXml(a.author.name)}</author>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
