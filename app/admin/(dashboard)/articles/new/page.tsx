import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";
import { createArticle } from "@/lib/actions/articles";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New article", robots: { index: false } };

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-bold">New article</h1>
      <ArticleForm
        categories={categories}
        action={createArticle}
        submitLabel="Create article"
      />
    </div>
  );
}
