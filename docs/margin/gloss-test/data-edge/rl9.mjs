import { ctx, sleep } from './lib.mjs';
for (const [name, ub] of [['rl', '2dd0d71d9ee883fbeb99f9b8'], ['resnet', '1e0651b6810ecba34a3dbc5b']]) {
  const c = await ctx(); const p = c.pages()[0] || await c.newPage();
  const t0 = Date.now(); await p.goto('https://tinct.app/lab/addbook/?userBook=' + ub, { waitUntil: 'domcontentloaded', timeout: 60000 });
  let canvas = 0, text = 0; for (let i = 0; i < 240; i++) { if (!canvas && await p.evaluate(() => document.querySelectorAll('canvas').length)) canvas = Date.now() - t0; if (!text && await p.evaluate(() => document.querySelectorAll('.text-layer span').length > 20)) text = Date.now() - t0; if (canvas && text) break; await sleep(100); }
  console.log(name, 'reopen: page drawn', canvas, 'ms; text selectable', text, 'ms'); await c.close();
}
