import { defineConfig } from '@playwright/test'

/**
 * Modern English edition of an added book in the reader (`reader-modern-edition.spec.ts`),
 * at phone and desktop size. Chromium only: set PW_CHROMIUM_EXECUTABLE
 * (e.g. /opt/pw-browsers/chromium); never run `playwright install` for this.
 * BASE_URL is a running `vite` dev server. Every outside request is stubbed.
 */
const executablePath = process.env.PW_CHROMIUM_EXECUTABLE || undefined
const launchOptions = executablePath ? { executablePath } : {}

export default defineConfig({
  testDir: './',
  testMatch: ['reader-modern-edition.spec.ts'],
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
    // The reader's service worker would answer edition requests itself, past the stubs.
    serviceWorkers: 'block',
    launchOptions: { ...launchOptions, args: ['--mute-audio'] },
  },
  projects: [
    { name: 'phone', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
  ],
})
