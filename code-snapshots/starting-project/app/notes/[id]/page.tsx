import Link from "next/link";
import { notFound } from "next/navigation";
import { NoteRenderer } from "@/components/note-renderer";
import { getNote } from "@/lib/notes";
import { requireSession } from "@/lib/session";

export default async function NotePage({
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
      <Link href="/dashboard" className="text-sm underline">
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-semibold">{note.title}</h1>
      <NoteRenderer doc={JSON.parse(note.contentJson)} />
    </main>
  );
}
