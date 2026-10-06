import { defineConfig } from '@playwright/test'

/**
 * Account surfaces on an iPhone-sized screen (`auth-phone-zoom.spec.ts`):
 * WebKit at 390×844 with isMobile and touch.
 *
 * Where WebKit is not installed, set PW_CHROMIUM_EXECUTABLE to a Chromium
 * binary (e.g. /opt/pw-browsers/chromium) to run the same checks in Chromium's
 * mobile emulation. Never run `playwright install` for this.
 */
const chromium = process.env.PW_CHROMIUM_EXECUTABLE

const phone = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
}

export default defineConfig({
  testDir: './',
  testMatch: ['auth-phone-zoom.spec.ts'],
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
  projects: [chromium
    ? { name: 'chromium-phone', use: { browserName: 'chromium', launchOptions: { executablePath: chromium }, ...phone } }
    : { name: 'webkit-phone', use: { browserName: 'webkit', ...phone } }],
})
