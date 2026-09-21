import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/seo";

export const alt = "Article cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      title: true,
      category: { select: { name: true } },
    },
  });

  const title = article?.title ?? SITE_NAME;
  const category = article?.category?.name ?? "Web3";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #08080f 0%, #150f2e 100%)",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 32,
            fontWeight: 700,
            color: "#8b6bff",
            letterSpacing: -0.5,
          }}
        >
          {SITE_NAME}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "rgba(139, 107, 255, 0.15)",
              color: "#8b6bff",
              padding: "8px 20px",
              borderRadius: 999,
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {category}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              color: "#f2f2f7",
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
