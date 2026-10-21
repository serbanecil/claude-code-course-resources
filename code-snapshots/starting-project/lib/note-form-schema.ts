import { z } from 'zod';
import { isValidNoteDoc } from './note-schema';

export const noteFormSchema = z.object({
  title: z.string().trim().max(200),
  content: z
    .string()
    .max(1_000_000)
    .transform((value, ctx) => {
      try {
        const doc: unknown = JSON.parse(value);
        if (isValidNoteDoc(doc)) return doc;
      } catch {}
      ctx.addIssue({ code: 'custom', message: 'Invalid note content' });
      return z.NEVER;
    }),
});
