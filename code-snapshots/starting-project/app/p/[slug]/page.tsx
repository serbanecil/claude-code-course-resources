import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NoteRenderer } from '@/components/note-renderer';
import { getPublicNote } from '@/lib/notes';

// Always read the DB so turning sharing off takes effect immediately.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { robots: { index: false } };

export default async function PublicNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getPublicNote(slug);
  if (!note) notFound();
  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8'>
      <h1 className='text-2xl font-semibold'>{note.title}</h1>
      <NoteRenderer doc={JSON.parse(note.contentJson)} />
    </main>
  );
}
