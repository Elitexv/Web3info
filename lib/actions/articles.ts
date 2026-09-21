"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import readingTimeOf from "reading-time";
import { z } from "zod";

const articleSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  excerpt: z.string().min(10, "Excerpt is too short"),
  contentHtml: z.string().min(20, "Article body is too short"),
  categoryId: z.string().min(1, "Choose a category"),
  coverImage: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z.boolean().optional().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImage: z.string().optional(),
  tagNames: z.array(z.string()).optional().default([]),
  slug: z.string().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

async function uniqueSlug(base: string, ignoreId?: string) {
  const slugBase = slugify(base, { lower: true, strict: true });
  let slug = slugBase;
  let i = 1;
  while (
    await prisma.article.findFirst({
      where: { slug, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) },
    })
  ) {
    i += 1;
    slug = `${slugBase}-${i}`;
  }
  return slug;
}

async function upsertTags(tagNames: string[]) {
  const names = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))];
  const tags = await Promise.all(
    names.map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name, { lower: true, strict: true }) },
        update: {},
        create: {
          name,
          slug: slugify(name, { lower: true, strict: true }),
        },
      })
    )
  );
  return tags.map((t) => ({ id: t.id }));
}

export type ArticleFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createArticle(
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const user = await requireAdmin();

  const raw = {
    title: String(formData.get("title") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    contentHtml: String(formData.get("contentHtml") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    coverImage: String(formData.get("coverImage") ?? "") || undefined,
    status: String(formData.get("status") ?? "DRAFT") as "DRAFT" | "PUBLISHED",
    featured: formData.get("featured") === "on",
    seoTitle: String(formData.get("seoTitle") ?? "") || undefined,
    seoDescription: String(formData.get("seoDescription") ?? "") || undefined,
    ogImage: String(formData.get("ogImage") ?? "") || undefined,
    tagNames: String(formData.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  };

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const data = parsed.data;
  const slug = await uniqueSlug(data.title);
  const stats = readingTimeOf(data.contentHtml.replace(/<[^>]+>/g, " "));
  const tags = await upsertTags(data.tagNames);

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      contentHtml: data.contentHtml,
      coverImage: data.coverImage,
      status: data.status,
      featured: data.featured,
      readingTime: Math.max(1, Math.round(stats.minutes)),
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      authorId: user.id,
      categoryId: data.categoryId,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      ogImage: data.ogImage,
      tags: { connect: tags },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${article.id}/edit`);
}

export async function updateArticle(
  articleId: string,
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireAdmin();

  const existing = await prisma.article.findUnique({
    where: { id: articleId },
  });
  if (!existing) return { error: "Article not found." };

  const raw = {
    title: String(formData.get("title") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    contentHtml: String(formData.get("contentHtml") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    coverImage: String(formData.get("coverImage") ?? "") || undefined,
    status: String(formData.get("status") ?? "DRAFT") as "DRAFT" | "PUBLISHED",
    featured: formData.get("featured") === "on",
    seoTitle: String(formData.get("seoTitle") ?? "") || undefined,
    seoDescription: String(formData.get("seoDescription") ?? "") || undefined,
    ogImage: String(formData.get("ogImage") ?? "") || undefined,
    tagNames: String(formData.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  };

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const data = parsed.data;
  const slug =
    existing.title === data.title
      ? existing.slug
      : await uniqueSlug(data.title, existing.id);
  const stats = readingTimeOf(data.contentHtml.replace(/<[^>]+>/g, " "));
  const tags = await upsertTags(data.tagNames);

  await prisma.article.update({
    where: { id: articleId },
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      contentHtml: data.contentHtml,
      coverImage: data.coverImage,
      status: data.status,
      featured: data.featured,
      readingTime: Math.max(1, Math.round(stats.minutes)),
      publishedAt:
        data.status === "PUBLISHED"
          ? (existing.publishedAt ?? new Date())
          : null,
      categoryId: data.categoryId,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      ogImage: data.ogImage,
      tags: { set: tags },
    },
  });

  revalidatePath("/");
  revalidatePath(`/article/${slug}`);
  revalidatePath("/admin/articles");
  return {};
}

export async function deleteArticle(articleId: string) {
  await requireAdmin();
  await prisma.article.delete({ where: { id: articleId } });
  revalidatePath("/");
  revalidatePath("/admin/articles");
}
