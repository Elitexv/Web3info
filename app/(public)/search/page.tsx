import { searchArticles } from "@/lib/queries";
import { ArticleCard } from "@/components/site/article-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default async function SearchPage(props: PageProps<"/search">) {
  const params = await props.searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const results = q ? await searchArticles(q) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Search</h1>
      <form className="mt-6 flex max-w-lg gap-2">
        <Input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search articles…"
          autoFocus
        />
        <Button type="submit">Search</Button>
      </form>

      {q && (
        <p className="mt-6 text-sm text-muted-foreground">
          {results.length} result{results.length === 1 ? "" : "s"} for
          &ldquo;{q}&rdquo;
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
