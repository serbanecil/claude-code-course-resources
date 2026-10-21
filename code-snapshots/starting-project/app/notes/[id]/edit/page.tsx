import { notFound } from "next/navigation";
import { updateNoteAction } from "@/app/notes/[id]/actions";
import { NoteForm } from "@/components/note-form";
import { getNote } from "@/lib/notes";
import { requireSession } from "@/lib/session";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const note = getNote(session.user.id, id);
  if (!note) notFound();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Edit Note</h1>
      <NoteForm
        action={updateNoteAction.bind(null, id)}
        initialTitle={note.title}
        initialContent={JSON.parse(note.contentJson)}
        submitLabel="Save changes"
        cancelHref={`/notes/${id}`}
      />
    </main>
  );
}
