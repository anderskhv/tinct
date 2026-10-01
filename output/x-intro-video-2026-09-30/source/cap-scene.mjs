const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'fs';
// node cap-scene.mjs <dotLabel> <webm> <startSec> <frames> <outdir> [ui=0|1] [extra=open]
const [, , dot, webm, startSec, nFrames, outdir, ui = '0', extra = ''] = process.argv;
const S = process.env.FILM_WORK || process.cwd();
const OUT = `${S}/cap/${outdir}`; fs.mkdirSync(OUT, { recursive: true });
const FPS = 24, DT = 1000 / FPS;
const browser = await chromium.launch({ args: ['--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
await ctx.addInitScript({ path: S + '/vclock.js' });
const page = await ctx.newPage();
const key = webm.replace('.webm', '');
await page.route('**/assets/scenes/*.mp4*', async r => r.request().url().includes(key + '.mp4') ? r.continue({ url: `http://127.0.0.1:3002/${webm}` }) : r.abort());
await page.goto('http://127.0.0.1:3001/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
if (dot !== 'Feature Frankenstein') { await page.getByRole('button', { name: dot }).click(); }
await page.waitForTimeout(6500);
if (ui === '0') await page.addStyleTag({ content: `#header,.hero-copy,.hero-dots,#shelves,#notice,[aria-label='Open your librarian'],#librarian,.librarian-orb{visibility:hidden!important;opacity:0!important}` });
await page.mouse.move(1590, 880);
const st = await page.evaluate(() => { const v = document.querySelector('video'); return v && { src: v.currentSrc.slice(-40), rs: v.readyState, p: v.paused }; });
console.log(dot, 'video', JSON.stringify(st));
await page.evaluate(() => { window.__vc.freeze(); const v = document.querySelector('video'); if (v) v.pause(); });
const meta = { dot, webm, startSec: +startSec, fps: FPS, frames: +nFrames };
if (ui === '1') { meta.readBox = await page.locator('#read-featured').boundingBox(); }
const seekTo = sec => page.evaluate(async sec => { const v = document.querySelector('video'); if (!v || !v.duration) return 'nov'; const t = sec % v.duration; await new Promise(res => { const d = () => res(); v.addEventListener('seeked', d, { once: true }); v.currentTime = t; setTimeout(d, 2000); }); return v.currentTime; }, sec);
let clickAt = -1, mouseFrom = null, mouseTo = null;
if (extra === 'cover') { clickAt = +(process.env.COVER_AT || 130); meta.clickAt = clickAt; }
if (extra === 'open') { clickAt = 40; mouseFrom = { x: 1400, y: 880 }; const b = meta.readBox; mouseTo = { x: b.x + b.width * 0.42, y: b.y + b.height * 0.55 }; meta.cursorFrom = mouseFrom; meta.cursorTo = mouseTo; meta.clickAt = clickAt; }
let vtime = -DT;
for (let f = 0; f < +nFrames; f++) {
  if (extra === 'open' && f >= 18 && f <= 30) { const k = (f - 18) / 12, e = 1 - Math.pow(1 - k, 3); await page.mouse.move(mouseFrom.x + (mouseTo.x - mouseFrom.x) * e, mouseFrom.y + (mouseTo.y - mouseFrom.y) * e); }
  if (f === clickAt && extra === 'cover') { await page.evaluate(() => document.getElementById('hero-book').click()); await page.evaluate(() => new Promise(r => setTimeout(r, 60))); }
  else if (f === clickAt) { await page.mouse.down(); await page.mouse.up(); await page.evaluate(() => new Promise(r => setTimeout(r, 60))); }
  if (extra === 'open' && f === 70) { meta.beginBox = await page.locator('#begin-reading').boundingBox(); const b = meta.beginBox; meta.beginTarget = { x: b.x + b.width * 0.3, y: b.y + b.height * 0.55 }; }
  if (extra === 'open' && f >= 72 && f <= 84) { const k = (f - 72) / 12, e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; const a = mouseTo, b = meta.beginTarget; await page.mouse.move(a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e); }
  // optional speed ramp: SPEED_RAMP="a:b:k" eases playback from 1x (frame a) to k x (frame b)
  let k = 1;
  if (process.env.SPEED_RAMP) { const [ra, rb, rk] = process.env.SPEED_RAMP.split(':').map(Number); const u = Math.min(1, Math.max(0, (f - ra) / (rb - ra))); k = 1 + (rk - 1) * (0.5 - 0.5 * Math.cos(Math.PI * u)); }
  vtime += DT * k;
  await seekTo(+startSec + vtime / 1000);
  await page.evaluate(ms => window.__vc.step(ms), DT * k);
  await page.evaluate(() => new Promise(r => setTimeout(r, 25)));
  await page.screenshot({ path: `${OUT}/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 94 });
}
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta, null, 1));
console.log('done', outdir);
await browser.close();
