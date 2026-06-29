"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { CharacterCount } from "@tiptap/extension-character-count";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Plain text (blank-line paragraphs) -> HTML Tiptap can parse into separate paragraph nodes. */
function plainTextToEditorHtml(text: string): string {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) return "<p></p>";
  return blocks.map((b) => `<p>${escapeHtml(b)}</p>`).join("");
}

export function ContentEditor({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (plainText: string, wordCount: number) => void;
  className?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bold: false,
        italic: false,
        strike: false,
        underline: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        link: false,
      }),
      Placeholder.configure({
        placeholder: "Write the article here. Each paragraph break becomes a new paragraph for readers.",
      }),
      CharacterCount,
    ],
    content: plainTextToEditorHtml(value),
    onUpdate: ({ editor }) => {
      const text = editor.getText({ blockSeparator: "\n\n" });
      onChange(text, editor.storage.characterCount.words());
    },
  });

  // Keep the editor in sync if `value` changes from outside (e.g. autosave
  // restoring a draft, or switching articles) without fighting normal typing.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getText({ blockSeparator: "\n\n" });
    if (current !== value) {
      editor.commands.setContent(plainTextToEditorHtml(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  return (
    <div className={cn("rounded-md border border-input bg-transparent", className)}>
      <EditorContent
        editor={editor}
        className="max-w-none px-3 py-2 min-h-[320px] text-[0.95rem] leading-relaxed focus:outline-none [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:my-3 [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0"
      />
      {editor && (
        <div className="flex justify-end gap-3 border-t border-border px-3 py-1.5 text-xs text-muted-foreground">
          <span>{editor.storage.characterCount.words()} words</span>
          <span>{editor.storage.characterCount.characters()} characters</span>
        </div>
      )}
    </div>
  );
}
