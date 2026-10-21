import { describe, expect, it } from 'vitest';
import { noteFormSchema } from './note-form-schema';

const doc = { type: 'doc', content: [{ type: 'paragraph' }] };
const content = JSON.stringify(doc);

describe('noteFormSchema', () => {
  it('trims the title and parses content into an object', () => {
    const result = noteFormSchema.parse({ title: '  Hello  ', content });
    expect(result).toEqual({ title: 'Hello', content: doc });
  });

  it('allows an empty title', () => {
    expect(noteFormSchema.safeParse({ title: '', content }).success).toBe(true);
  });

  it('rejects titles over 200 characters', () => {
    expect(noteFormSchema.safeParse({ title: 'a'.repeat(201), content }).success).toBe(false);
  });

  it('rejects content that is not JSON', () => {
    const result = noteFormSchema.safeParse({ title: 'x', content: 'not json' });
    expect(result.error?.issues[0].message).toBe('Invalid note content');
  });

  it('rejects JSON that is not a valid note doc', () => {
    const bad = JSON.stringify({ type: 'doc', content: [{ type: 'nope' }] });
    expect(noteFormSchema.safeParse({ title: 'x', content: bad }).success).toBe(false);
  });

  it('rejects content over 1,000,000 characters', () => {
    expect(noteFormSchema.safeParse({ title: 'x', content: ' '.repeat(1_000_001) }).success).toBe(
      false,
    );
  });

  it('rejects missing content', () => {
    expect(noteFormSchema.safeParse({ title: 'x', content: null }).success).toBe(false);
  });
});
