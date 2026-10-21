'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseNoteForm, type NoteFormState } from '@/lib/note-form';
import { createNote } from '@/lib/notes';
import { getCurrentUserId } from '@/lib/session';

export type { NoteFormState };

export async function createNoteAction(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/');

  const parsed = parseNoteForm(formData);
  if (!parsed.ok) return parsed.state;

  createNote(userId, parsed.data);

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
