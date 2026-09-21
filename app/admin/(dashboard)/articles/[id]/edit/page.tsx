import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";
import { updateArticle } from "@/lib/actions/articles";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit article", robots: { index: false } };

export default async function EditArticlePage(
  props: PageProps<"/admin/articles/[id]/edit">
) {
  const { id } = await props.params;

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: { tags: { select: { name: true } } },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!article) notFound();

  const boundAction = updateArticle.bind(null, article.id);

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-bold">Edit article</h1>
      <ArticleForm
        categories={categories}
        action={boundAction}
        submitLabel="Save changes"
        defaultValues={{
          title: article.title,
          excerpt: article.excerpt,
          contentHtml: article.contentHtml,
          categoryId: article.categoryId,
          coverImage: article.coverImage,
          status: article.status,
          featured: article.featured,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          ogImage: article.ogImage,
          tags: article.tags.map((t) => t.name).join(", "),
        }}
      />
    </div>
  );
}
