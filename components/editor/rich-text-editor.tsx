"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { upload } from "@vercel/blob/client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  LinkIcon,
  ImageIcon,
  Undo,
  Redo,
} from "lucide-react";

const lowlight = createLowlight(common);

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("size-8", active && "bg-muted text-primary")}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function insertImage(file: File) {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
    });
    editor.chain().focus().setImage({ src: blob.url }).run();
  }

  function setLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1.5">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) insertImage(file);
        }}
      />
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Ordered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
        <LinkIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Image" onClick={() => fileRef.current?.click()}>
        <ImageIcon className="size-4" />
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="size-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TiptapImage,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Write the story… paste images, drop links, go deep.",
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: defaultValue ?? "",
    editorProps: {
      attributes: {
        class:
          "prose-article min-h-80 max-w-none focus:outline-none px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = editor.getHTML();
      }
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-border bg-background">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        defaultValue={defaultValue ?? ""}
      />
    </div>
  );
}
