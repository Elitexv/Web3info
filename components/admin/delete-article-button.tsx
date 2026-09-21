"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteArticle } from "@/lib/actions/articles";

export function DeleteArticleButton({
  articleId,
  title,
}: {
  articleId: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteArticle(articleId);
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-bearish"
      disabled={isPending}
      onClick={handleDelete}
      aria-label={`Delete ${title}`}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
