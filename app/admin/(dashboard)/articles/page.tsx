import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { Plus } from "lucide-react";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Articles", robots: { index: false } };

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
      views: true,
      category: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Articles</h1>
        <Link href="/admin/articles/new" className={buttonVariants()}>
          <Plus className="size-4" />
          New article
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.map((a) => (
              <tr key={a.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/articles/${a.id}/edit`}>{a.title}</Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {a.category.name}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={a.status === "PUBLISHED" ? "default" : "secondary"}>
                    {a.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{a.views}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(a.updatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteArticleButton articleId={a.id} title={a.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No articles yet.
          </p>
        )}
      </div>
    </div>
  );
}
