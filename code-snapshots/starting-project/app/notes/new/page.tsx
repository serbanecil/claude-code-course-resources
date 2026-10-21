import { createNoteAction } from "@/app/notes/new/actions";
import { NoteForm } from "@/components/note-form";
import { requireSession } from "@/lib/session";

export default async function NewNotePage() {
  await requireSession();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">New Note</h1>
      <NoteForm action={createNoteAction} submitLabel="Create note" />
    </main>
  );
}
