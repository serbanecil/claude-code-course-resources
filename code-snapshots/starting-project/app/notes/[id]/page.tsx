import { notFound } from "next/navigation";
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
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{note.title}</h1>
    </main>
  );
}
