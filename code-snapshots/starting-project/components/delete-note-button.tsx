"use client";

import { useRef, useTransition } from "react";
import { deleteNoteAction } from "@/app/notes/[id]/actions";

export function DeleteNoteButton({ id }: { id: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-md border border-red-600/50 px-3 py-1.5 text-sm text-red-600 dark:text-red-400"
      >
        Delete
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-title"
        className="m-auto max-w-sm rounded-md bg-background p-6 text-foreground backdrop:bg-black/50"
      >
        <h2 id="delete-title" className="text-lg font-semibold">
          Delete this note?
        </h2>
        <p className="mt-2 text-sm opacity-70">This can&apos;t be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            disabled={isPending}
            onClick={() => dialogRef.current?.close()}
            className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => deleteNoteAction(id))}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
