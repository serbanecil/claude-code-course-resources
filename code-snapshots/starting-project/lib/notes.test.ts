import { beforeEach, describe, expect, it } from 'vitest';
import { getDb, run } from './db';
import {
  createNote,
  deleteNote,
  generateSlug,
  getNote,
  getPublicNote,
  listNotes,
  updateNote,
} from './notes';

const doc = (text: string) =>
  JSON.stringify({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  });

beforeEach(() => {
  getDb();
  run('DELETE FROM notes');
  run('DELETE FROM user');
  for (const id of ['alice', 'bob']) {
    run('INSERT INTO user (id, name, email) VALUES (?, ?, ?)', [id, id, `${id}@example.com`]);
  }
});

describe('generateSlug', () => {
  it('returns 22 URL-safe chars and is unique', () => {
    const slugs = new Set(Array.from({ length: 50 }, generateSlug));
    expect(slugs.size).toBe(50);
    for (const slug of slugs) expect(slug).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });
});

describe('createNote', () => {
  it('applies defaults for a private note', () => {
    const note = createNote('alice', {});
    expect(note).toMatchObject({
      userId: 'alice',
      title: 'Untitled note',
      isPublic: false,
      publicSlug: null,
    });
    expect(JSON.parse(note.contentJson)).toEqual({ type: 'doc', content: [] });
  });

  it('generates a slug for a public note', () => {
    const note = createNote('alice', { title: 'Hi', contentJson: doc('x'), isPublic: true });
    expect(note.isPublic).toBe(true);
    expect(note.publicSlug).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(note.contentJson).toBe(doc('x'));
  });
});

describe('ownership scoping', () => {
  it('getNote returns only the owner’s note', () => {
    const note = createNote('alice', { title: 'A' });
    expect(getNote('alice', note.id)?.title).toBe('A');
    expect(getNote('bob', note.id)).toBeUndefined();
  });

  it('listNotes returns only the user’s notes, most recently updated first', () => {
    const first = createNote('alice', { title: 'first' });
    const second = createNote('alice', { title: 'second' });
    createNote('bob', { title: 'other' });
    run('UPDATE notes SET updated_at = ? WHERE id = ?', ['2020-01-01T00:00:00.000Z', first.id]);
    run('UPDATE notes SET updated_at = ? WHERE id = ?', ['2021-01-01T00:00:00.000Z', second.id]);
    expect(listNotes('alice').map((n) => n.title)).toEqual(['second', 'first']);
  });

  it('updateNote and deleteNote refuse non-owners', () => {
    const note = createNote('alice', { title: 'A' });
    const data = { title: 'hacked', contentJson: doc('x'), isPublic: false };
    expect(updateNote('bob', note.id, data)).toBe(false);
    expect(deleteNote('bob', note.id)).toBe(false);
    expect(getNote('alice', note.id)?.title).toBe('A');
  });
});

describe('updateNote', () => {
  const data = (isPublic: boolean) => ({ title: 'T', contentJson: doc('new'), isPublic });

  it('updates fields and falls back to the default title', () => {
    const note = createNote('alice', { title: 'old' });
    expect(updateNote('alice', note.id, { ...data(false), title: '' })).toBe(true);
    expect(getNote('alice', note.id)).toMatchObject({
      title: 'Untitled note',
      contentJson: doc('new'),
    });
  });

  it('returns false for a missing note', () => {
    expect(updateNote('alice', 'missing', data(false))).toBe(false);
  });

  it('creates a slug when a note becomes public', () => {
    const note = createNote('alice', {});
    updateNote('alice', note.id, data(true));
    expect(getNote('alice', note.id)?.publicSlug).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });

  it('keeps the slug while it stays public', () => {
    const note = createNote('alice', { isPublic: true });
    updateNote('alice', note.id, data(true));
    expect(getNote('alice', note.id)?.publicSlug).toBe(note.publicSlug);
  });

  it('clears is_public and the slug when made private', () => {
    const note = createNote('alice', { isPublic: true });
    updateNote('alice', note.id, data(false));
    expect(getNote('alice', note.id)).toMatchObject({ isPublic: false, publicSlug: null });
  });

  it('refreshes updated_at via the trigger', () => {
    const note = createNote('alice', {});
    run('UPDATE notes SET updated_at = ? WHERE id = ?', ['2020-01-01T00:00:00.000Z', note.id]);
    updateNote('alice', note.id, data(false));
    expect(getNote('alice', note.id)!.updatedAt > '2020-01-01T00:00:00.000Z').toBe(true);
  });
});

describe('getPublicNote', () => {
  it('returns title, content and updatedAt only, with no owner info', () => {
    const note = createNote('alice', { title: 'Shared', contentJson: doc('x'), isPublic: true });
    const result = getPublicNote(note.publicSlug!);
    expect(Object.keys(result!).sort()).toEqual(['contentJson', 'title', 'updatedAt']);
    expect(result!.title).toBe('Shared');
  });

  it('returns undefined for unknown slugs', () => {
    expect(getPublicNote('nope')).toBeUndefined();
  });

  it('stops resolving once sharing is disabled', () => {
    const note = createNote('alice', { isPublic: true });
    updateNote('alice', note.id, { title: 'T', contentJson: doc('x'), isPublic: false });
    expect(getPublicNote(note.publicSlug!)).toBeUndefined();
  });
});

describe('deleteNote', () => {
  it('deletes the owner’s note', () => {
    const note = createNote('alice', {});
    expect(deleteNote('alice', note.id)).toBe(true);
    expect(getNote('alice', note.id)).toBeUndefined();
    expect(deleteNote('alice', note.id)).toBe(false);
  });
});
