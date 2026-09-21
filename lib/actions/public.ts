"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const emailSchema = z.string().email();

export type NewsletterState = { message?: string; error?: string };

export async function subscribeToNewsletter(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  try {
    await prisma.subscriber.create({ data: { email } });
  } catch {
    return { message: "You're already on the list." };
  }

  return { message: "Subscribed! Check your inbox for confirmation." };
}

const commentSchema = z.object({
  articleId: z.string().min(1),
  walletAddress: z.string().min(4),
  content: z.string().min(2).max(2000),
});

export async function postComment(
  _prevState: { error?: string },
  formData: FormData
) {
  const parsed = commentSchema.safeParse({
    articleId: formData.get("articleId"),
    walletAddress: formData.get("walletAddress"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: "Connect your wallet and write a comment first." };
  }

  const article = await prisma.article.findUnique({
    where: { id: parsed.data.articleId },
    select: { slug: true },
  });
  if (!article) return { error: "Article not found." };

  await prisma.comment.create({ data: parsed.data });
  revalidatePath(`/article/${article.slug}`);
  return {};
}

export async function toggleReaction(
  articleId: string,
  walletAddress: string,
  type: "LIKE" | "BULLISH" | "BEARISH" = "LIKE"
) {
  if (!walletAddress) return { error: "Connect a wallet first." };

  const existing = await prisma.reaction.findUnique({
    where: {
      articleId_walletAddress_type: { articleId, walletAddress, type },
    },
  });

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { articleId, walletAddress, type } });
  }

  if (article) revalidatePath(`/article/${article.slug}`);
  return { reacted: !existing };
}

export async function recordView(articleId: string) {
  await prisma.article.update({
    where: { id: articleId },
    data: { views: { increment: 1 } },
  });
}
