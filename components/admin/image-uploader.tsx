"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";

export function ImageUploader({
  name,
  defaultValue,
  label,
}: {
  name: string;
  defaultValue?: string | null;
  label: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setUrl(blob.url);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {url ? (
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted">
          <Image src={url} alt="" fill className="object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 size-7"
            onClick={() => setUrl("")}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-video w-full max-w-md flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted"
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <ImagePlus className="size-6" />
          )}
          <span className="text-sm">
            {uploading ? "Uploading…" : "Click to upload image"}
          </span>
        </button>
      )}
      {error && <p className="text-sm text-bearish">{error}</p>}
    </div>
  );
}
