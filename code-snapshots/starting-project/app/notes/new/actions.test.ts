import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
  createNote: vi.fn(),
  getCurrentUserId: vi.fn(),
}));

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/lib/notes', () => ({ createNote: mocks.createNote }));
vi.mock('@/lib/session', () => ({ getCurrentUserId: mocks.getCurrentUserId }));

import { createNoteAction } from './actions';

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
  mocks.getCurrentUserId.mockResolvedValue('u1');
});

describe('createNoteAction', () => {
  it('redirects to / when unauthenticated, without writing', async () => {
    mocks.getCurrentUserId.mockResolvedValue(null);
    await expect(createNoteAction(null, form({ title: 'T', content }))).rejects.toThrow(
      'NEXT_REDIRECT:/',
    );
    expect(mocks.createNote).not.toHaveBeenCalled();
  });

  it('returns an error state for invalid content, without writing', async () => {
    const state = await createNoteAction(null, form({ title: 'T', content: 'bad' }));
    expect(state).toEqual({ error: 'Invalid note content', title: 'T' });
    expect(mocks.createNote).not.toHaveBeenCalled();
  });

  it('creates the note, revalidates and redirects to the dashboard', async () => {
    await expect(
      createNoteAction(null, form({ title: 'T', content, isPublic: 'on' })),
    ).rejects.toThrow('NEXT_REDIRECT:/dashboard');
    expect(mocks.createNote).toHaveBeenCalledWith('u1', {
      title: 'T',
      contentJson: content,
      isPublic: true,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/dashboard');
  });
});
