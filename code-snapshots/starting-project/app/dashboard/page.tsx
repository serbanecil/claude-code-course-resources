import Link from "next/link";
import { listNotes } from "@/lib/notes";
import { requireSession } from "@/lib/session";

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default async function DashboardPage() {
  const session = await requireSession();
  const notes = listNotes(session.user.id);
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link
          href="/notes/new"
          className="rounded-md bg-foreground px-3 py-2 font-medium text-background"
        >
          New Note
        </Link>
      </div>
      {notes.length === 0 ? (
        <p>You have no notes yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className="flex items-baseline justify-between gap-4 rounded-md border border-foreground/25 px-4 py-3 hover:bg-foreground/5"
              >
                <span className="font-medium">{note.title}</span>
                <time dateTime={note.updatedAt} className="text-sm opacity-70">
                  {dateFormat.format(new Date(note.updatedAt))}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
