import { noteFormSchema } from './note-form-schema';

export type NoteFormState = { error?: string; title?: string } | null;

export type ParsedNoteForm =
  | { ok: true; data: { title: string; contentJson: string; isPublic: boolean } }
  | { ok: false; state: NonNullable<NoteFormState> };

/** Validates the note form submission shared by the create and update actions. */
export function parseNoteForm(formData: FormData): ParsedNoteForm {
  const title = String(formData.get('title') ?? '');
  const parsed = noteFormSchema.safeParse({ title, content: formData.get('content') });
  if (!parsed.success) {
    return { ok: false, state: { error: parsed.error.issues[0].message, title } };
  }
  return {
    ok: true,
    data: {
      title: parsed.data.title,
      contentJson: JSON.stringify(parsed.data.content),
      isPublic: formData.get('isPublic') === 'on',
    },
  };
}
