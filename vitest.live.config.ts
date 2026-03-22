import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/live/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    environment: 'node',
  },
  resolve: {
    conditions: ['node'],
  },
});
