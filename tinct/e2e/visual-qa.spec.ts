/**
 * Visual QA Screenshot Script — Tinct
 *
 * Takes screenshots of the reader at different states and viewports.
 * Run with: npx playwright test e2e/visual-qa.spec.ts --reporter=list
 *
 * Environment variables:
 *   BASE_URL   — dev server URL (default: http://localhost:5173)
 *   QA_PAGES   — comma-separated page keys (default: all)
 *               Valid: reader, translation, chat, dark-mode, light-mode
 */

import { test, expect, type Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
];

const ALL_PAGE_KEYS = ['reader', 'translation', 'chat', 'dark-mode', 'light-mode'];
const selectedPages = process.env.QA_PAGES
  ? process.env.QA_PAGES.split(',').map(s => s.trim())
  : ALL_PAGE_KEYS;

let screenshotCount = 0;

function shouldRun(key: string): boolean {
  return selectedPages.includes(key);
}

async function takeScreenshot(page: Page, name: string) {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  screenshotCount++;
}

test.beforeAll(async () => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  const existing = fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png'));
  for (const f of existing) {
    fs.unlinkSync(path.join(SCREENSHOT_DIR, f));
  }
});

test.afterAll(async () => {
  console.log(`\n=== Visual QA Summary ===`);
  console.log(`Screenshots taken: ${screenshotCount}`);
  console.log(`Saved to: ${SCREENSHOT_DIR}`);
  console.log(`=========================\n`);
});

// --- Main Reader (light mode, Butler translation — default state) ---
for (const vp of VIEWPORTS) {
  test(`reader-${vp.name}-${vp.width}`, async ({ browser }) => {
    if (!shouldRun('reader')) return test.skip();
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500); // wait for text to load
    await takeScreenshot(page, `reader-light-butler-${vp.name}-${vp.width}`);
    await context.close();
  });
}

// --- Translation Toggle (switch to Pope) ---
for (const vp of VIEWPORTS) {
  test(`translation-pope-${vp.name}-${vp.width}`, async ({ browser }) => {
    if (!shouldRun('translation')) return test.skip();
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Look for translation toggle/select in the header
    // The Header component has onTranslationChange — find the control
    const translationBtn = page.locator('button:has-text("Pope"), select, [data-translation]').first();
    if (await translationBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await translationBtn.click();
      await page.waitForTimeout(1000);
    } else {
      // Try finding any select element or dropdown that might control translation
      const select = page.locator('select').first();
      if (await select.isVisible({ timeout: 2000 }).catch(() => false)) {
        await select.selectOption({ label: /pope/i }).catch(() => {});
        await page.waitForTimeout(1000);
      }
    }

    await takeScreenshot(page, `reader-pope-${vp.name}-${vp.width}`);
    await context.close();
  });
}

// --- Chat Panel with a Message ---
for (const vp of VIEWPORTS) {
  test(`chat-panel-${vp.name}-${vp.width}`, async ({ browser }) => {
    if (!shouldRun('chat')) return test.skip();
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // The side panel with chat should be open by default (panelOpen = true)
    // Find the chat input and type a message
    const chatInput = page.locator('textarea, input[type="text"]').last();
    if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chatInput.fill('What is the significance of Odysseus leaving Calypso?');
      await page.waitForTimeout(500);
    }

    await takeScreenshot(page, `chat-panel-${vp.name}-${vp.width}`);
    await context.close();
  });
}

// --- Dark Mode ---
for (const vp of VIEWPORTS) {
  test(`dark-mode-${vp.name}-${vp.width}`, async ({ browser }) => {
    if (!shouldRun('dark-mode')) return test.skip();
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Find and click the dark mode toggle
    // Header has onToggleDarkMode
    const darkToggle = page.locator('button:has-text("Dark"), button:has-text("dark"), [data-theme-toggle], button[aria-label*="dark" i], button[aria-label*="theme" i]').first();
    if (await darkToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await darkToggle.click();
      await page.waitForTimeout(500);
    } else {
      // Fallback: set dark mode via DOM
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });
      await page.waitForTimeout(500);
    }

    await takeScreenshot(page, `dark-mode-${vp.name}-${vp.width}`);
    await context.close();
  });
}

// --- Light Mode (explicit — same as reader but labeled for clarity) ---
for (const vp of VIEWPORTS) {
  test(`light-mode-${vp.name}-${vp.width}`, async ({ browser }) => {
    if (!shouldRun('light-mode')) return test.skip();
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Ensure light mode is active
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.waitForTimeout(300);

    await takeScreenshot(page, `light-mode-${vp.name}-${vp.width}`);
    await context.close();
  });
}
