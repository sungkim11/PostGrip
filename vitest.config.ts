import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/live/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/renderer/index.tsx', 'src/preload/index.ts'],
    },
    setupFiles: ['tests/setup.ts'],
    environment: 'node',
  },
  resolve: {
    conditions: ['node'],
  },
});
