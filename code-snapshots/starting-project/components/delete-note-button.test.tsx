import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { deleteNoteAction } = vi.hoisted(() => ({ deleteNoteAction: vi.fn() }));
vi.mock('@/app/notes/[id]/actions', () => ({ deleteNoteAction }));

import { DeleteNoteButton } from './delete-note-button';

const showModal = vi.fn();
const close = vi.fn();

beforeEach(() => {
  // Stub the modal methods so the tests don't depend on happy-dom's dialog support.
  HTMLDialogElement.prototype.showModal = showModal;
  HTMLDialogElement.prototype.close = close;
  deleteNoteAction.mockResolvedValue(undefined);
});

describe('DeleteNoteButton', () => {
  it('opens the confirmation dialog', async () => {
    render(<DeleteNoteButton id='n1' />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(showModal).toHaveBeenCalled();
    expect(deleteNoteAction).not.toHaveBeenCalled();
  });

  it('closes the dialog on cancel without deleting', async () => {
    render(<DeleteNoteButton id='n1' />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel', hidden: true }));
    expect(close).toHaveBeenCalled();
    expect(deleteNoteAction).not.toHaveBeenCalled();
  });

  it('deletes the note on confirm', async () => {
    render(<DeleteNoteButton id='n1' />);
    const [, confirm] = screen.getAllByRole('button', { name: 'Delete', hidden: true });
    await userEvent.click(confirm);
    expect(deleteNoteAction).toHaveBeenCalledWith('n1');
  });
});
