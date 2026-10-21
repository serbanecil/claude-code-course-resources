import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteNoteButton } from '@/components/delete-note-button';
import { NoteRenderer } from '@/components/note-renderer';
import { getNote } from '@/lib/notes';
import { requireSession } from '@/lib/session';

const dateTimeFormat = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const note = getNote(session.user.id, id);
  if (!note) notFound();
  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8'>
      <Link href='/dashboard' className='text-sm underline'>
        ← Back to dashboard
      </Link>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-semibold'>{note.title}</h1>
          <p className='flex flex-wrap gap-x-4 text-sm opacity-70'>
            <span>
              Created{' '}
              <time dateTime={note.createdAt}>
                {dateTimeFormat.format(new Date(note.createdAt))}
              </time>
            </span>
            {note.updatedAt !== note.createdAt && (
              <span>
                Updated{' '}
                <time dateTime={note.updatedAt}>
                  {dateTimeFormat.format(new Date(note.updatedAt))}
                </time>
              </span>
            )}
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <Link
            href={`/notes/${note.id}/edit`}
            className='rounded-md border border-foreground/20 px-3 py-1.5 text-sm'
          >
            Edit
          </Link>
          <DeleteNoteButton id={note.id} />
        </div>
      </div>
      {note.isPublic && note.publicSlug && (
        <p className='text-sm'>
          Shared publicly:{' '}
          <Link href={`/p/${note.publicSlug}`} className='underline'>
            /p/{note.publicSlug}
          </Link>
        </p>
      )}
      <NoteRenderer doc={JSON.parse(note.contentJson)} />
    </main>
  );
}
