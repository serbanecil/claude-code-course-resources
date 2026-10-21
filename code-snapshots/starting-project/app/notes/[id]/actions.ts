'use server';

import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { parseNoteForm, type NoteFormState } from '@/lib/note-form';
import { deleteNote, updateNote } from '@/lib/notes';
import { getCurrentUserId } from '@/lib/session';

export async function updateNoteAction(
  id: string,
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/');

  const parsed = parseNoteForm(formData);
  if (!parsed.ok) return parsed.state;

  const updated = updateNote(userId, id, parsed.data);
  if (!updated) notFound();

  revalidatePath('/dashboard');
  revalidatePath(`/notes/${id}`);
  redirect(`/notes/${id}`);
}

export async function deleteNoteAction(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/');
  if (!deleteNote(userId, id)) notFound();

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
