import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

const { getSessionCookie } = vi.hoisted(() => ({ getSessionCookie: vi.fn() }));
vi.mock('better-auth/cookies', () => ({ getSessionCookie }));

import { config, proxy } from './proxy';

const request = new NextRequest('http://localhost:3000/dashboard');

describe('proxy', () => {
  it('redirects to / without a session cookie', () => {
    getSessionCookie.mockReturnValue(null);
    const response = proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('continues when a session cookie exists', () => {
    getSessionCookie.mockReturnValue('token');
    const response = proxy(request);
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('only guards dashboard and notes routes', () => {
    expect(config.matcher).toEqual(['/dashboard/:path*', '/notes/:path*']);
  });
});
