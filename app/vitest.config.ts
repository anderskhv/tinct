import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Position-sync invariant tests intentionally use plain assertions and
    // fake timers; we don't need jsdom for them. If a future test needs DOM,
    // override the environment per-file with `// @vitest-environment jsdom`.
  },
})
