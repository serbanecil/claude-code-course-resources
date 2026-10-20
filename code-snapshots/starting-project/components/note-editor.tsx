"use client";

import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
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

  function handleBold() {
    editor?.chain().focus().toggleBold().run();
  }
  function handleItalic() {
    editor?.chain().focus().toggleItalic().run();
  }
  function handleBulletList() {
    editor?.chain().focus().toggleBulletList().run();
  }

  return (
    <div className="rounded-md border border-foreground/20">
      <div className="flex gap-2 border-b border-foreground/20 p-2">
        <ToolbarButton label="Bold" onClick={handleBold} />
        <ToolbarButton label="Italic" onClick={handleItalic} />
        <ToolbarButton label="Bullet list" onClick={handleBulletList} />
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name="content" value={JSON.stringify(json)} />
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded px-2 py-1 text-sm hover:bg-foreground/10"
    >
      {label}
    </button>
  );
}
