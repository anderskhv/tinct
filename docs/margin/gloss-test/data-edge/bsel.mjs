// select a phrase anywhere in the document body (across text nodes); returns true if selected via mouse drag
import { sleep } from './lib.mjs';
export async function bselect(p, ph, root = 'body') {
  const r = await p.evaluate(([ph, root]) => {
    const norm = s => s.replace(/\s+/g, ' ');
    const w = document.createTreeWalker(document.querySelector(root), NodeFilter.SHOW_TEXT); let n, nodes = [], txt = '';
    while ((n = w.nextNode())) { if (!n.parentElement.offsetParent) continue; nodes.push([n, txt.length]); txt += n.textContent; }
    let flat = '', map = []; for (let k = 0; k < txt.length; k++) { const ch = /\s/.test(txt[k]) ? ' ' : txt[k]; if (ch === ' ' && flat.endsWith(' ')) continue; flat += ch; map.push(k); }
    const at = flat.indexOf(norm(ph)); if (at < 0) return null;
    const s = map[at], e = map[at + norm(ph).length - 1] + 1;
    const find = off => { for (let q = nodes.length - 1; q >= 0; q--) if (nodes[q][1] <= off) return [nodes[q][0], off - nodes[q][1]]; };
    const [sn, so] = find(s), [en, eo] = find(e - 1);
    const rg = document.createRange(); rg.setStart(sn, so); rg.setEnd(en, eo + 1);
    const rects = [...rg.getClientRects()].filter(x => x.width > 1); if (!rects.length) return { hidden: true };
    const a = rects[0], z = rects[rects.length - 1];
    return { x1: a.left + 1, y1: a.top + a.height / 2, x2: z.right - 1, y2: z.top + z.height / 2 };
  }, [ph, root]);
  if (!r || !r.x1) return false;
  await p.mouse.move(r.x1, r.y1); await p.mouse.down(); await p.mouse.move(r.x2, r.y2, { steps: 12 }); await p.mouse.up(); await sleep(900);
  return true;
}
