import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock('@/lib/auth-client', () => ({
  authClient: { signIn: { email: mocks.signIn }, signUp: { email: mocks.signUp } },
}));

import { AuthForm } from './auth-form';

async function submit(button: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), 'a@b.co');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: button }));
}

beforeEach(() => {
  mocks.signIn.mockResolvedValue({ error: null });
  mocks.signUp.mockResolvedValue({ error: null });
});

describe('AuthForm', () => {
  it('signs in and navigates to the dashboard', async () => {
    render(<AuthForm mode='signin' />);
    await submit('Sign in');
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/dashboard'));
    expect(mocks.signIn).toHaveBeenCalledWith({ email: 'a@b.co', password: 'password123' });
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it('signs up with an empty name', async () => {
    render(<AuthForm mode='signup' />);
    await submit('Create account');
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/dashboard'));
    expect(mocks.signUp).toHaveBeenCalledWith({
      name: '',
      email: 'a@b.co',
      password: 'password123',
    });
  });

  it('shows the server error and does not navigate', async () => {
    mocks.signIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    render(<AuthForm mode='signin' />);
    await submit('Sign in');
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('falls back to a generic error message', async () => {
    mocks.signIn.mockResolvedValue({ error: {} });
    render(<AuthForm mode='signin' />);
    await submit('Sign in');
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
  });
});
