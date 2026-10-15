import { ctx, sleep } from './lib.mjs'; import fs from 'fs';
const out = {}; const log = m => { console.log(m); };
const c = await ctx(); const p = c.pages()[0] || await c.newPage();
const ocrLog = []; p.on('response', r => { if (/\/ocr\//.test(r.url())) ocrLog.push(r.request().method() + ' ' + r.status()); });
await p.goto('https://tinct.app/library#my-shelf', { waitUntil: 'domcontentloaded', timeout: 60000 }); await sleep(5000);
await p.getByRole('button', { name: 'Add a book' }).first().click(); await sleep(1200);
await p.locator('input[type=file]').first().setInputFiles('p3/gan-scan2.pdf'); await sleep(1500);
if (await p.locator('input[type=checkbox]').count()) await p.locator('input[type=checkbox]').last().check();
if (await p.getByRole('button', { name: 'Continue' }).count()) await p.getByRole('button', { name: 'Continue' }).click();
for (let i = 0; i < 240; i++) { await sleep(500); if (/addbook|reader/.test(p.url())) break; }
out.url = p.url(); log('URL ' + p.url());
let offer = '', t0 = Date.now();
for (let i = 0; i < 40; i++) { await sleep(500); offer = await p.evaluate(() => document.querySelector('.byob-ocr')?.innerText || ''); if (offer) break; }
out.firstOpenOffer = offer; out.toasts = await p.evaluate(() => document.body.innerText.match(/can.t be read aloud[^\n]*/)?.[0] || ''); log('first-open offer: ' + JSON.stringify(offer) + ' toast: ' + out.toasts);
await p.screenshot({ path: 'p3/r2-scan-first.png' });
const btn = p.locator('[data-ocr="start"]');
if (await btn.count()) { await btn.click(); const ts = Date.now(); for (let i = 0; i < 200; i++) { await sleep(2000); const t = await p.evaluate(() => document.querySelector('.byob-ocr')?.innerText || ''); if (/ready/i.test(t)) { out.ocrSec = (Date.now() - ts) / 1000; break; } } log('ocr s ' + out.ocrSec); }
await sleep(5000); out.urlAfter = p.url(); out.spans = await p.evaluate(() => document.querySelectorAll('.text-layer span').length);
log('after: ' + p.url() + ' text spans ' + out.spans); await p.screenshot({ path: 'p3/r2-scan-after.png' });
out.ocrLog = ocrLog; fs.writeFileSync('p3/r2-scan.json', JSON.stringify(out, null, 1)); await c.close();
