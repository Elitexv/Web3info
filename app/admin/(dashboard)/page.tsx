import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function AdminDashboardPage() {
  const [published, drafts, subscribers, recent] = await Promise.all([
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.subscriber.count(),
    prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
  ]);

  const stats = [
    { label: "Published", value: published },
    { label: "Drafts", value: drafts },
    { label: "Subscribers", value: subscribers },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <Link href="/admin/articles/new" className={buttonVariants()}>
          <Plus className="size-4" />
          New article
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Recently updated</h2>
        <div className="divide-y divide-border rounded-lg border border-border">
          {recent.map((a) => (
            <Link
              key={a.id}
              href={`/admin/articles/${a.id}/edit`}
              className="flex flex-col gap-1 px-4 py-3 hover:bg-muted sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <span className="min-w-0 truncate font-medium">{a.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {a.status} · {formatDate(a.updatedAt)}
              </span>
            </Link>
          ))}
          {recent.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No articles yet. Create your first one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
