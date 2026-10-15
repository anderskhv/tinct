import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
export const SPKI = 'PS48cX347wDVcRynzq+DFqswl2PLNE1sG6uQvxMCOS0=';
export async function ctx(viewport = { width: 1440, height: 900 }, opts = {}) {
  return chromium.launchPersistentContext(process.env.PROFILE || '/tmp/claude-0/-home-user-tinct/1997e058-3432-5517-b2af-8c632de4a039/scratchpad/cmp/profile', {
    viewport, deviceScaleFactor: 1, proxy: { server: process.env.HTTPS_PROXY },
    args: ['--ignore-certificate-errors-spki-list=' + SPKI], permissions: ['clipboard-read', 'clipboard-write'], ...opts });
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
