import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./note-editor', () => ({ NoteEditor: () => <div data-testid='editor' /> }));

import { NoteForm } from './note-form';

describe('NoteForm', () => {
  it('renders initial values and a cancel link', () => {
    render(
      <NoteForm
        action={vi.fn()}
        initialTitle='Hello'
        initialIsPublic
        submitLabel='Save'
        cancelHref='/dashboard'
      />,
    );
    expect(screen.getByLabelText('Title')).toHaveValue('Hello');
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('omits the cancel link by default', () => {
    render(<NoteForm action={vi.fn()} submitLabel='Create' />);
    expect(screen.queryByRole('link', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('submits through the action and shows the returned error', async () => {
    const action = vi.fn().mockResolvedValue({ error: 'Invalid note content', title: 'Kept' });
    render(<NoteForm action={action} submitLabel='Save' />);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid note content');
    expect(action).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Title')).toHaveValue('Kept');
  });
});
