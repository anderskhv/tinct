import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './',
  testMatch: ['lab-reader-maximal-fill.spec.ts', 'lab-reader-quality-pass.spec.ts'],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    headless: true,
    screenshot: 'off',
    video: 'off',
  },
  projects: [{
    name: 'webkit',
    use: { browserName: 'webkit' },
  }],
})
