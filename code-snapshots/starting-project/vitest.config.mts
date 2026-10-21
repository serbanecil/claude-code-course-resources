import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
  test: {
    setupFiles: ['./vitest.setup.ts'],
    projects: [
      { extends: true, test: { name: 'node', environment: 'node', include: ['**/*.test.ts'] } },
      {
        extends: true,
        test: { name: 'dom', environment: 'happy-dom', include: ['**/*.test.tsx'] },
      },
    ],
    exclude: ['node_modules', '.next'],
  },
});
