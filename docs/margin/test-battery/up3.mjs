import { ctx, sleep } from './lib.mjs';
const [file, tag] = process.argv.slice(2);
const c = await ctx(); const p = c.pages()[0] || await c.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200))); p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url().slice(0, 140)); });
await p.goto('https://tinct.app/library#my-shelf', { waitUntil: 'domcontentloaded', timeout: 60000 }); await sleep(5000);
await p.getByRole('button', { name: 'Add a book' }).first().click(); await sleep(1200);
const t0 = Date.now();
await p.locator('input[type=file]').first().setInputFiles(file); await sleep(1500);
await p.screenshot({ path: `p3/${tag}-1.png` });
if (await p.locator('input[type=checkbox]').count()) { await p.locator('input[type=checkbox]').last().check(); }
if (await p.getByRole('button', { name: 'Continue' }).count()) await p.getByRole('button', { name: 'Continue' }).click();
let opened = 0;
for (let i = 0; i < 600; i++) { await sleep(500); if (/addbook/.test(p.url())) { opened = Date.now() - t0; break; } }
console.log('URL', p.url(), 'navigated', opened, 'ms');
// time to first painted page canvas
for (let i = 0; i < 240; i++) { const n = await p.evaluate(() => document.querySelectorAll('canvas').length); if (n) { console.log('first canvas', Date.now() - t0, 'ms'); break; } await sleep(250); }
await sleep(8000); await p.screenshot({ path: `p3/${tag}-2.png` });
console.log('TEXT', (await p.evaluate(() => document.body.innerText)).slice(0, 800).replace(/\n+/g, ' | '));
console.log('errors', errs.slice(0, 12)); await c.close();
