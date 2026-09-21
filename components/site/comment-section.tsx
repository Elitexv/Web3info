"use client";

import { useActionState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { postComment } from "@/lib/actions/public";
import { formatDate } from "@/lib/format";

type Comment = {
  id: string;
  walletAddress: string;
  content: string;
  createdAt: Date;
};

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function CommentSection({
  articleId,
  comments,
}: {
  articleId: string;
  comments: Comment[];
}) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [state, formAction, pending] = useActionState(postComment, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.error) formRef.current?.reset();
  }, [state]);

  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-semibold">
        Discussion ({comments.length})
      </h3>

      {isConnected && address ? (
        <form ref={formRef} action={formAction} className="space-y-3">
          <input type="hidden" name="articleId" value={articleId} />
          <input type="hidden" name="walletAddress" value={address} />
          <Textarea
            name="content"
            required
            placeholder="Share your take, anon…"
            className="min-h-24"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Posting as {shortAddress(address)}
            </p>
            <Button type="submit" disabled={pending} size="sm">
              {pending ? "Posting…" : "Post comment"}
            </Button>
          </div>
          {state?.error && (
            <p className="text-sm text-bearish">{state.error}</p>
          )}
        </form>
      ) : (
        <Button variant="outline" onClick={() => openConnectModal?.()}>
          Connect wallet to comment
        </Button>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="font-mono text-sm font-medium">
                {shortAddress(c.walletAddress)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(c.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-sm">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No comments yet — be the first to weigh in.
          </p>
        )}
      </div>
    </div>
  );
}
