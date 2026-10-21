import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSessionApi, redirect } = vi.hoisted(() => ({
  getSessionApi: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('next/headers', () => ({ headers: vi.fn(async () => new Headers({ cookie: 'a=b' })) }));
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('./auth', () => ({ auth: { api: { getSession: getSessionApi } } }));

import { getCurrentUserId, getSession, requireSession } from './session';

beforeEach(() => {
  redirect.mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  });
});

describe('session helpers', () => {
  it('getSession forwards request headers to better-auth', async () => {
    getSessionApi.mockResolvedValue(null);
    await getSession();
    const { headers } = getSessionApi.mock.calls[0][0];
    expect(headers.get('cookie')).toBe('a=b');
  });

  it('requireSession redirects to / when unauthenticated', async () => {
    getSessionApi.mockResolvedValue(null);
    await expect(requireSession()).rejects.toThrow('NEXT_REDIRECT:/');
  });

  it('requireSession returns the session when authenticated', async () => {
    const session = { user: { id: 'u1' } };
    getSessionApi.mockResolvedValue(session);
    await expect(requireSession()).resolves.toBe(session);
  });

  it('getCurrentUserId returns the user id or null', async () => {
    getSessionApi.mockResolvedValue({ user: { id: 'u1' } });
    expect(await getCurrentUserId()).toBe('u1');
    getSessionApi.mockResolvedValue(null);
    expect(await getCurrentUserId()).toBeNull();
  });
});
