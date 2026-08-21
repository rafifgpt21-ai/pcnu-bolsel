"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";

type Props = {
  content: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
};

export function TiptapEditor({ content, onChange, readOnly = false }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      Placeholder.configure({ placeholder: "Mulai tulis isi post…" }),
    ],
    content,
    immediatelyRender: false,
    editable: !readOnly,
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    onFocus: () => setIsFocused(true),
    onBlur: () => window.setTimeout(() => setIsFocused(false), 120),
    editorProps: {
      attributes: {
        class: "tiptap-editor prose prose-slate max-w-none min-h-48 p-4 sm:p-5 font-body text-base leading-relaxed text-primary focus:outline-none prose-headings:text-primary prose-a:text-secondary prose-blockquote:text-on-surface-variant",
      },
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === content) return;
    editor.commands.setContent(content, { emitUpdate: false });
  }, [content, editor]);

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  if (!editor) return <div className="h-48 animate-pulse rounded-xl bg-surface-container-low" />;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("URL tautan", previous || "https://");
    if (href === null) return;
    if (!href.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  const toolbar: Array<{ icon: string; label: string; active: boolean; action: () => unknown; disabled?: boolean }> = [
    { icon: "undo", label: "Urungkan", active: false, action: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo() },
    { icon: "redo", label: "Ulangi", active: false, action: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo() },
    { icon: "format_bold", label: "Tebal", active: editor.isActive("bold"), action: () => editor.chain().focus().toggleBold().run() },
    { icon: "format_italic", label: "Miring", active: editor.isActive("italic"), action: () => editor.chain().focus().toggleItalic().run() },
    { icon: "title", label: "Judul tingkat 2", active: editor.isActive("heading", { level: 2 }), action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: "format_list_bulleted", label: "Daftar simbol", active: editor.isActive("bulletList"), action: () => editor.chain().focus().toggleBulletList().run() },
    { icon: "format_list_numbered", label: "Daftar angka", active: editor.isActive("orderedList"), action: () => editor.chain().focus().toggleOrderedList().run() },
    { icon: "format_quote", label: "Kutipan", active: editor.isActive("blockquote"), action: () => editor.chain().focus().toggleBlockquote().run() },
    { icon: "link", label: "Tautan", active: editor.isActive("link"), action: setLink },
    { icon: "format_align_left", label: "Rata kiri", active: editor.isActive({ textAlign: "left" }), action: () => editor.chain().focus().setTextAlign("left").run() },
    { icon: "format_align_center", label: "Rata tengah", active: editor.isActive({ textAlign: "center" }), action: () => editor.chain().focus().setTextAlign("center").run() },
    { icon: "format_align_justify", label: "Rata kiri kanan", active: editor.isActive({ textAlign: "justify" }), action: () => editor.chain().focus().setTextAlign("justify").run() },
  ];

  return (
    <div className="mt-2 overflow-visible rounded-xl border border-outline-variant/30 bg-surface-container-lowest/50 transition focus-within:border-secondary/50 focus-within:ring-2 focus-within:ring-secondary/10">
      {!readOnly && (
        <div
          className={`${isFocused ? "sticky bottom-[calc(env(safe-area-inset-bottom)+0.25rem)] z-40 shadow-xl md:static md:shadow-none" : "relative"} flex max-w-full gap-1 overflow-x-auto border-b border-outline-variant/25 bg-surface-container-lowest/95 p-2 backdrop-blur-xl`}
          role="toolbar"
          aria-label="Format teks"
        >
          {toolbar.map((item) => (
            <button
              key={item.label}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={item.action}
              disabled={item.disabled}
              aria-label={item.label}
              title={item.label}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition disabled:opacity-30 ${item.active ? "bg-secondary text-on-secondary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
            >
              <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
            </button>
          ))}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
