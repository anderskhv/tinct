import { defineConfig } from '@playwright/test'

// The phone's vertical swipe (Anders, 12 Nov 2026), in Chromium mobile
// emulation and in WebKit, both iPhone-sized with touch. Needs a dev server
// with VITE_SHARED_READER_DEFAULT=1 at BASE_URL.
export default defineConfig({
  testDir: './',
  testMatch: ['lab-mobile-reader.spec.ts'],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 90_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    headless: true,
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' }, grep: /phone vertical swipe/ },
    { name: 'webkit', use: { browserName: 'webkit' }, grep: /phone vertical swipe/ },
  ],
})
