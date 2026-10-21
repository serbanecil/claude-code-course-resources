"use client";

import {
  EditorContent,
  useEditor,
  useEditorState,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

const EMPTY_DOC: JSONContent = { type: "doc", content: [] };

/** Rich text input; submits the TipTap JSON as the `content` form field. */
export function NoteEditor() {
  const [json, setJson] = useState<JSONContent>(EMPTY_DOC);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id: "content",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Content",
        class: "min-h-48 px-3 py-2 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => setJson(editor.getJSON()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      h1: editor?.isActive("heading", { level: 1 }) ?? false,
      h2: editor?.isActive("heading", { level: 2 }) ?? false,
      h3: editor?.isActive("heading", { level: 3 }) ?? false,
      paragraph: editor?.isActive("paragraph") ?? false,
      bulletList: editor?.isActive("bulletList") ?? false,
      code: editor?.isActive("code") ?? false,
      codeBlock: editor?.isActive("codeBlock") ?? false,
    }),
  });

  const run = () => editor?.chain().focus();

  return (
    <div className="rounded-md border border-foreground/20">
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex flex-wrap items-center gap-1 border-b border-foreground/20 p-2"
      >
        <ToolbarButton
          label="B"
          title="Bold (Ctrl+B)"
          pressed={active?.bold}
          className="font-bold"
          onClick={() => run()?.toggleBold().run()}
        />
        <ToolbarButton
          label="I"
          title="Italic (Ctrl+I)"
          pressed={active?.italic}
          className="italic"
          onClick={() => run()?.toggleItalic().run()}
        />
        <Divider />
        <ToolbarButton
          label="P"
          title="Normal text"
          pressed={active?.paragraph}
          onClick={() => run()?.setParagraph().run()}
        />
        <ToolbarButton
          label="H1"
          title="Heading 1"
          pressed={active?.h1}
          onClick={() => run()?.toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          label="H2"
          title="Heading 2"
          pressed={active?.h2}
          onClick={() => run()?.toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="H3"
          title="Heading 3"
          pressed={active?.h3}
          onClick={() => run()?.toggleHeading({ level: 3 }).run()}
        />
        <Divider />
        <ToolbarButton
          label="• List"
          title="Bullet list"
          pressed={active?.bulletList}
          onClick={() => run()?.toggleBulletList().run()}
        />
        <ToolbarButton
          label="</>"
          title="Inline code"
          pressed={active?.code}
          className="font-mono"
          onClick={() => run()?.toggleCode().run()}
        />
        <ToolbarButton
          label="Code block"
          title="Code block"
          pressed={active?.codeBlock}
          onClick={() => run()?.toggleCodeBlock().run()}
        />
        <ToolbarButton
          label="―"
          title="Horizontal rule"
          onClick={() => run()?.setHorizontalRule().run()}
        />
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name="content" value={JSON.stringify(json)} />
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-foreground/20" />;
}

function ToolbarButton({
  label,
  title,
  pressed,
  className = "",
  onClick,
}: {
  label: string;
  title: string;
  pressed?: boolean;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm hover:bg-foreground/10 aria-pressed:bg-foreground/20 ${className}`}
    >
      {label}
    </button>
  );
}
