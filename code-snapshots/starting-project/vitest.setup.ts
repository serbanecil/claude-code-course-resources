import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

process.env.DATABASE_PATH = ':memory:';

vi.mock('server-only', () => ({}));

afterEach(cleanup);
