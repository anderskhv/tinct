import { ctx, sleep } from './lib.mjs';
process.env.PROFILE = '/tmp/claude-0/-home-user-tinct/1997e058-3432-5517-b2af-8c632de4a039/scratchpad/cmp/gprofile';
const [file, tag, wait = '240'] = process.argv.slice(2);
const c = await ctx(); const p = c.pages()[0] || await c.newPage();
await p.goto('https://www.usegloss.io/', { waitUntil: 'networkidle', timeout: 60000 }); await sleep(2000);
const t0 = Date.now();
const [chooser] = await Promise.all([p.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null), p.getByText('Open a PDF').first().click()]);
await chooser.setFiles(file);
let lastTxt = '';
for (let i = 0; i < Number(wait) * 2; i++) { await sleep(500); const t = await p.evaluate(() => document.body.innerText.slice(0, 300).replace(/\n+/g, ' | ')); if (t !== lastTxt && i % 4 === 0) { console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', p.url().slice(0, 80), t.slice(0, 160)); lastTxt = t; } const n = await p.evaluate(() => (document.querySelector('main') || document.body).innerText.length); if (/\/read\//.test(p.url()) && n > 3000) break; }
console.log('opened', p.url(), (Date.now() - t0) / 1000, 's');
await sleep(4000); await p.screenshot({ path: `p3/g-${tag}.png` });
console.log((await p.evaluate(() => document.body.innerText)).slice(0, 1200).replace(/\n+/g, ' | '));
await c.close();
