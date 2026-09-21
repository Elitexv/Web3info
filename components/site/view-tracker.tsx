"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/actions/public";

export function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    recordView(articleId).catch(() => {});
  }, [articleId]);

  return null;
}
