'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { noteFormSchema } from '@/lib/note-form-schema';
import { createNote } from '@/lib/notes';
import { getCurrentUserId } from '@/lib/session';

export type NoteFormState = { error?: string; title?: string } | null;

export async function createNoteAction(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/');

  const title = String(formData.get('title') ?? '');
  const parsed = noteFormSchema.safeParse({
    title,
    content: formData.get('content'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, title };
  }

  createNote(userId, {
    title: parsed.data.title,
    contentJson: JSON.stringify(parsed.data.content),
    isPublic: formData.get('isPublic') === 'on',
  });

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
