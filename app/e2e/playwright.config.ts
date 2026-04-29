import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  // Run all *.spec.ts in this folder by default. Previously only matched
  // visual-qa.spec.ts, which silently excluded position-persistence,
  // column-bleed, interactive-tests, and ulysses-qa from the standard run.
  testMatch: '*.spec.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 60000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    headless: true,
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
