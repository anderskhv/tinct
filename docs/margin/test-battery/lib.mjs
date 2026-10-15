import { chromium } from 'playwright';
// Persistent browser profile (keeps the test account signed in). PROFILE overrides; one profile per parallel run.
export async function ctx(viewport = { width: 1440, height: 900 }, opts = {}) {
  const extra = process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(' ') : [];
  return chromium.launchPersistentContext(process.env.PROFILE || new URL('./profile', import.meta.url).pathname, {
    viewport, deviceScaleFactor: 1, ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {}),
    args: extra, permissions: ['clipboard-read', 'clipboard-write'], ...opts });
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
