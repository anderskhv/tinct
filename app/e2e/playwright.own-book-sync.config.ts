import { defineConfig } from '@playwright/test'

/**
 * Own books across two devices (`own-book-sync.spec.ts`): two browser profiles
 * of one account. Chromium only: set PW_CHROMIUM_EXECUTABLE (e.g.
 * /opt/pw-browsers/chromium); never run `playwright install` for this.
 * BASE_URL is a running `vite` dev server with a dummy Supabase project.
 */
const executablePath = process.env.PW_CHROMIUM_EXECUTABLE || undefined

export default defineConfig({
  testDir: './',
  testMatch: ['own-book-sync.spec.ts'],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 120_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    headless: true,
    screenshot: 'off',
    video: 'off',
    launchOptions: { ...(executablePath ? { executablePath } : {}), args: ['--mute-audio'] },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
})
