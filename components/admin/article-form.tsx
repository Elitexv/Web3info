"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { ArticleFormState } from "@/lib/actions/articles";

type Category = { id: string; name: string };

type ArticleFormValues = {
  title: string;
  excerpt: string;
  contentHtml: string;
  categoryId: string;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  tags: string;
};

export function ArticleForm({
  categories,
  defaultValues,
  action,
  submitLabel,
}: {
  categories: Category[];
  defaultValues?: Partial<ArticleFormValues>;
  action: (
    state: ArticleFormState,
    formData: FormData
  ) => Promise<ArticleFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-4xl space-y-8">
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO & metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6 pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={defaultValues?.title}
              className="text-lg font-medium"
            />
            {state.fieldErrors?.title && (
              <p className="text-sm text-bearish">{state.fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              required
              defaultValue={defaultValues?.excerpt}
              className="min-h-20"
            />
            {state.fieldErrors?.excerpt && (
              <p className="text-sm text-bearish">{state.fieldErrors.excerpt}</p>
            )}
          </div>

          <ImageUploader
            name="coverImage"
            label="Cover image"
            defaultValue={defaultValues?.coverImage}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Category</Label>
              <Select name="categoryId" defaultValue={defaultValues?.categoryId}>
                <SelectTrigger id="categoryId" className="w-full">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.fieldErrors?.categoryId && (
                <p className="text-sm text-bearish">
                  {state.fieldErrors.categoryId}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={defaultValues?.tags}
                placeholder="defi, ethereum, layer2"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Body</Label>
            <RichTextEditor
              name="contentHtml"
              defaultValue={defaultValues?.contentHtml}
            />
            {state.fieldErrors?.contentHtml && (
              <p className="text-sm text-bearish">
                {state.fieldErrors.contentHtml}
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6 pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input
              id="seoTitle"
              name="seoTitle"
              defaultValue={defaultValues?.seoTitle ?? ""}
              placeholder="Defaults to the article title"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seoDescription">Meta description</Label>
            <Textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={defaultValues?.seoDescription ?? ""}
              placeholder="Defaults to the excerpt"
              className="min-h-20"
            />
          </div>
          <ImageUploader
            name="ogImage"
            label="Social share image (Open Graph)"
            defaultValue={defaultValues?.ogImage}
          />
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border p-4">
        <div className="flex items-center gap-2">
          <Switch
            id="featured"
            name="featured"
            defaultChecked={defaultValues?.featured}
          />
          <Label htmlFor="featured">Feature on homepage</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={defaultValues?.status ?? "DRAFT"}>
            <SelectTrigger id="status" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {state.error && <p className="text-sm text-bearish">{state.error}</p>}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
