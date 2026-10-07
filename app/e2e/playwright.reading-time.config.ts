import { defineConfig } from '@playwright/test'

/**
 * Reading time (social ship 1, `reading-time.spec.ts`): the account sheet with
 * the SOCIAL_READING_TIME switch off and on, signed in and out, and the Your
 * reading page, at phone and desktop size. Every /api/reading-time call is
 * mocked; nothing reaches a database. Chromium only: set
 * PW_CHROMIUM_EXECUTABLE (e.g. /opt/pw-browsers/chromium); never run
 * `playwright install` for this. BASE_URL is a running `vite` dev server
 * started with VITE_SUPABASE_URL=<BASE_URL>/sb (a placeholder the spec
 * answers itself) so a signed-in session can be seeded.
 */
const executablePath = process.env.PW_CHROMIUM_EXECUTABLE || undefined
const launchOptions = executablePath ? { executablePath } : {}

export default defineConfig({
  testDir: './',
  testMatch: ['reading-time.spec.ts'],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 120_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:5287',
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
