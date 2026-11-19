import { open } from './th.mjs'; import { sleep } from './lib.mjs';
const { c, p } = await open({ width: 390, height: 844 });
await p.locator('button[aria-label="Menu"]').first().tap(); await sleep(900);
await p.getByText('Librarian', { exact: true }).first().tap(); await sleep(2500); await p.screenshot({ path: 'ph-yw5/20-librarian.png' });
const t0 = Date.now(); await p.keyboard.type('Who is Jennie and how does she treat the narrator?', { delay: 5 }); await p.keyboard.press('Enter');
let last = '', at = 0; while (Date.now() - t0 < 60000) { const t = await p.evaluate(() => { const els = [...document.querySelectorAll('.mr-answer, [class*=answer], [class*=message], [class*=msg]')].filter(e => e.innerText.length > 40); return els.length ? els[els.length - 1].innerText : ''; }); if (t !== last) { last = t; at = Date.now() - t0; } else if (last && Date.now() - t0 - at > 5000) break; await sleep(400); }
await p.screenshot({ path: 'ph-yw5/21-librarian-answer.png' }); console.log(at, last.slice(0, 1200)); await c.close();
