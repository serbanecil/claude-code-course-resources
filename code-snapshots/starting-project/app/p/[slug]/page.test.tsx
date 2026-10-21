import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ notFound: vi.fn(), getPublicNote: vi.fn() }));

vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('@/lib/notes', () => ({ getPublicNote: mocks.getPublicNote }));
vi.mock('@/components/note-renderer', () => ({
  NoteRenderer: ({ doc }: { doc: unknown }) => <pre data-testid='doc'>{JSON.stringify(doc)}</pre>,
}));

import PublicNotePage from './page';

beforeEach(() => {
  mocks.notFound.mockImplementation(() => {
    throw new Error('NEXT_NOT_FOUND');
  });
});

describe('PublicNotePage', () => {
  it('calls notFound for an unknown or private slug', async () => {
    mocks.getPublicNote.mockReturnValue(undefined);
    await expect(PublicNotePage({ params: Promise.resolve({ slug: 'x' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
    expect(mocks.getPublicNote).toHaveBeenCalledWith('x');
  });

  it('renders the title and parsed content', async () => {
    mocks.getPublicNote.mockReturnValue({
      title: 'Shared',
      contentJson: '{"type":"doc"}',
      updatedAt: 'x',
    });
    render(await PublicNotePage({ params: Promise.resolve({ slug: 's' }) }));
    expect(screen.getByRole('heading', { name: 'Shared' })).toBeInTheDocument();
    expect(screen.getByTestId('doc')).toHaveTextContent('{"type":"doc"}');
  });
});
