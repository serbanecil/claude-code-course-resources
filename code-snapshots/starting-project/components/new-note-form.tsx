"use client";

import { useActionState } from "react";
import { createNoteAction } from "@/app/notes/new/actions";
import { NoteEditor } from "./note-editor";

export function NewNoteForm() {
  const [state, action, isPending] = useActionState(createNoteAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={200}
          placeholder="Untitled note"
          defaultValue={state?.title}
          className="rounded-md border border-foreground/20 bg-transparent px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="content" className="text-sm font-medium">
          Content
        </label>
        <NoteEditor />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Create note"}
      </button>
    </form>
  );
}
