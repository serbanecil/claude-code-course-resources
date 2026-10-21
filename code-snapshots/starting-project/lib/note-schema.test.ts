import { describe, expect, it } from 'vitest';
import { isValidNoteDoc } from './note-schema';

const para = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });

describe('isValidNoteDoc', () => {
  it('accepts a doc with an empty paragraph', () => {
    expect(isValidNoteDoc({ type: 'doc', content: [{ type: 'paragraph' }] })).toBe(true);
  });

  it('rejects a doc with no blocks', () => {
    expect(isValidNoteDoc({ type: 'doc', content: [] })).toBe(false);
  });

  it('accepts paragraphs and headings up to level 3', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Hi' }] },
        para('body'),
      ],
    };
    expect(isValidNoteDoc(doc)).toBe(true);
  });

  it('rejects unknown node types', () => {
    expect(isValidNoteDoc({ type: 'doc', content: [{ type: 'script' }] })).toBe(false);
  });

  it('rejects a non-doc root', () => {
    expect(isValidNoteDoc(para('x'))).toBe(false);
  });

  it.each([null, undefined, 'text', 42, []])('rejects %j', (value) => {
    expect(isValidNoteDoc(value)).toBe(false);
  });
});
