import { defineConfig } from '@playwright/test'

/**
 * Add to Tinct in the library (`library-add-to-tinct.spec.ts`): search groups and
 * My shelf, at phone and desktop size, internal flag on and off. Chromium only:
 * set PW_CHROMIUM_EXECUTABLE (e.g. /opt/pw-browsers/chromium); never run
 * `playwright install` for this. BASE_URL is a running `vite` dev server.
 */
const executablePath = process.env.PW_CHROMIUM_EXECUTABLE || undefined
const launchOptions = executablePath ? { executablePath } : {}

export default defineConfig({
  testDir: './',
  testMatch: ['library-add-to-tinct.spec.ts'],
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
    launchOptions: { ...launchOptions, args: ['--mute-audio'] },
  },
  projects: [
    { name: 'phone', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
  ],
})
