import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  revalidatePath: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  getCurrentUserId: vi.fn(),
}));

vi.mock('next/navigation', () => ({ redirect: mocks.redirect, notFound: mocks.notFound }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/lib/notes', () => ({ updateNote: mocks.updateNote, deleteNote: mocks.deleteNote }));
vi.mock('@/lib/session', () => ({ getCurrentUserId: mocks.getCurrentUserId }));

import { deleteNoteAction, updateNoteAction } from './actions';

const content = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  mocks.redirect.mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  });
  mocks.notFound.mockImplementation(() => {
    throw new Error('NEXT_NOT_FOUND');
  });
  mocks.getCurrentUserId.mockResolvedValue('u1');
});

describe('updateNoteAction', () => {
  it('redirects to / when unauthenticated', async () => {
    mocks.getCurrentUserId.mockResolvedValue(null);
    await expect(updateNoteAction('n1', null, form({ title: 'T', content }))).rejects.toThrow(
      'NEXT_REDIRECT:/',
    );
    expect(mocks.updateNote).not.toHaveBeenCalled();
  });

  it('returns an error state for invalid content', async () => {
    const state = await updateNoteAction('n1', null, form({ title: 'T', content: '{' }));
    expect(state).toEqual({ error: 'Invalid note content', title: 'T' });
    expect(mocks.updateNote).not.toHaveBeenCalled();
  });

  it('calls notFound when the note is missing or not owned', async () => {
    mocks.updateNote.mockReturnValue(false);
    await expect(updateNoteAction('n1', null, form({ title: 'T', content }))).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('updates, revalidates and redirects to the note', async () => {
    mocks.updateNote.mockReturnValue(true);
    await expect(updateNoteAction('n1', null, form({ title: 'T', content }))).rejects.toThrow(
      'NEXT_REDIRECT:/notes/n1',
    );
    expect(mocks.updateNote).toHaveBeenCalledWith('u1', 'n1', {
      title: 'T',
      contentJson: content,
      isPublic: false,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/notes/n1');
  });
});

describe('deleteNoteAction', () => {
  it('redirects to / when unauthenticated', async () => {
    mocks.getCurrentUserId.mockResolvedValue(null);
    await expect(deleteNoteAction('n1')).rejects.toThrow('NEXT_REDIRECT:/');
    expect(mocks.deleteNote).not.toHaveBeenCalled();
  });

  it('calls notFound when nothing was deleted', async () => {
    mocks.deleteNote.mockReturnValue(false);
    await expect(deleteNoteAction('n1')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('deletes, revalidates and redirects to the dashboard', async () => {
    mocks.deleteNote.mockReturnValue(true);
    await expect(deleteNoteAction('n1')).rejects.toThrow('NEXT_REDIRECT:/dashboard');
    expect(mocks.deleteNote).toHaveBeenCalledWith('u1', 'n1');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/dashboard');
  });
});
