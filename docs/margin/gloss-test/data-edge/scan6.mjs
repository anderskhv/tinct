import { ctx, sleep } from './lib.mjs';
const c = await ctx(); const p = c.pages()[0] || await c.newPage();
await p.goto('https://tinct.app/lab/addbook/?userBook=779637623228a5d17d129344&pages', { waitUntil: 'domcontentloaded', timeout: 60000 });
await sleep(10000); await p.mouse.click(1000, 500); const t0 = Date.now(); await p.keyboard.press('b');
let txt = ''; for (let k = 0; k < 160; k++) { await sleep(500); txt = await p.evaluate(() => document.querySelector('.mr-primer')?.innerText || ''); if (txt.length > 150 && !/Thinking|loading|Reading/i.test(txt.slice(0, 200))) break; }
console.log(((Date.now() - t0) / 1000).toFixed(1) + 's'); console.log(txt.slice(0, 1500)); await p.screenshot({ path: 'p3/scan-primer.png' });
await c.close();
