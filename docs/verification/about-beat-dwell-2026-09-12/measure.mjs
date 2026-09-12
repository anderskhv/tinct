import { chromium } from '/home/user/tinct/app/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const label = process.argv[2] || 'run';
const outDir = process.argv[3];
const port = process.argv[4] || '4209';
const step = Number(process.argv[5] || 50);
mkdirSync(outDir, { recursive: true });

const probeFn = () => {
  const eff = el => { let o = 1, n = el; while (n && n.nodeType === 1) { const s = getComputedStyle(n); o *= parseFloat(s.opacity); if (s.visibility === 'hidden' || s.display === 'none') return 0; n = n.parentElement; } return o; };
  const inView = el => { const r = el.getBoundingClientRect(); if (!r.height) return 0; const top = Math.max(0, r.top), bot = Math.min(innerHeight, r.bottom); return Math.max(0, bot - top) / r.height; };
  // A scene frame counts as on stage when it is not inert, is opaque, and fills the viewport.
  const frames = [...document.querySelectorAll('.scene-frame')].filter(f => f.getAttribute('aria-hidden') !== 'true' && eff(f) > 0.5 && inView(f) > 0.9);
  const stage = frames[0] || null;
  const rj = stage ? stage.querySelector('.reading-journey') : null;
  const probe = sel => { const el = stage && stage.querySelector(sel); if (!el) return null; return { op: +eff(el).toFixed(3), vis: +inView(el).toFixed(2) }; };
  const beat = rj ? rj.dataset.beat : null;
  const scene = stage ? stage.dataset.scene : null;
  return {
    y: Math.round(window.scrollY),
    key: scene ? scene + (beat ? ':' + beat : '') : 'none',
    sp: stage ? +(+getComputedStyle(stage).getPropertyValue('--scene-progress')).toFixed(4) : null,
    bridge: probe('.reading-bridge'),
    talkPanel: probe('.book-conversation'),
    talkAnswer: probe('.book-conversation > p:not(.book-question)'),
    stopH: probe('.scene-copy h2'),
    stopOr: probe('.question-or'),
  };
};

const viewports = [ { name: 'phone-393x852', width: 393, height: 852 }, { name: 'desktop-1440x900', width: 1440, height: 900 } ];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'no-preference', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/about.html`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const samples = [];
  for (let y = 0; y <= total - vp.height; y += step) {
    await page.evaluate(yy => window.scrollTo(0, yy), y);
    await page.evaluate(() => new Promise(r => { let n = 0; const t = () => (++n < 12 ? requestAnimationFrame(t) : r()); requestAnimationFrame(t); }));
    samples.push(await page.evaluate(probeFn));
  }
  writeFileSync(`${outDir}/${label}-${vp.name}.json`, JSON.stringify({ label, vp, total, step, samples }, null, 0));
  console.log(vp.name, 'scrollHeight', total, 'samples', samples.length);
  await ctx.close();
}
await browser.close();
