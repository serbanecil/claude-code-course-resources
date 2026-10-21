import { describe, expect, it } from 'vitest';
import { parseNoteForm } from './note-form';

const content = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe('parseNoteForm', () => {
  it('returns normalized data', () => {
    expect(parseNoteForm(form({ title: ' T ', content }))).toEqual({
      ok: true,
      data: { title: 'T', contentJson: content, isPublic: false },
    });
  });

  it('treats isPublic=on as public and anything else as private', () => {
    const on = parseNoteForm(form({ title: 'T', content, isPublic: 'on' }));
    const other = parseNoteForm(form({ title: 'T', content, isPublic: 'true' }));
    expect(on.ok && on.data.isPublic).toBe(true);
    expect(other.ok && other.data.isPublic).toBe(false);
  });

  it('returns an error state that keeps the title on invalid content', () => {
    expect(parseNoteForm(form({ title: 'Keep me', content: '{' }))).toEqual({
      ok: false,
      state: { error: 'Invalid note content', title: 'Keep me' },
    });
  });

  it('fails when content is missing', () => {
    expect(parseNoteForm(form({ title: 'T' })).ok).toBe(false);
  });
});
