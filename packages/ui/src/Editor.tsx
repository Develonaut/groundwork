"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "./cn";
import "./styles/editor.css";

export interface EditorProps {
  content?: string;
  onUpdate?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function Editor({
  content,
  onUpdate,
  placeholder = "Start writing...",
  className,
  editable = true,
}: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder })],
    content: content ? JSON.parse(content) : undefined,
    editable,
    editorProps: {
      attributes: {
        class: "min-h-[8rem] w-full text-lg leading-relaxed focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(JSON.stringify(editor.getJSON()));
    },
  });

  return (
    <div
      className={cn(
        "border-2 border-black bg-white p-6 text-black transition-colors duration-150 focus-within:border-accent",
        className,
      )}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
