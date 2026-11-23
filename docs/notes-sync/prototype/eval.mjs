import fs from 'node:fs';
import path from 'node:path';
import { walk, buildIndex, search, payload, DEFAULT_W } from './notes-search.mjs';
import { QUESTIONS } from './questions.mjs';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), 'vault');
const EXCLUDE = ['Private', 'Daily'];
const verbose = process.argv.includes('-v');

function load(exclude) {
  const t0 = performance.now();
  const rels = walk(ROOT, exclude);
  const files = rels.map((r) => [r, fs.readFileSync(path.join(ROOT, r), 'utf8')]);
  return { files, readMs: performance.now() - t0 };
}

function evaluate(ix, opt) {
  let pSum = 0, pN = 0, rSum = 0, hit = 0, pos = 0, empty = 0, negAny = 0, negBad = 0, neg = 0, leaks = 0;
  const fails = [];
  for (const q of QUESTIONS) {
    const res = search(ix, q, opt);
    const got = res.map((r) => r.c.path);
    leaks += got.filter((g) => /^(Private|Daily)\//.test(g) || g.split('/').some((s) => s.startsWith('.'))).length;
    if (q.neg) {
      neg++;
      if (got.length) negAny++;
      const bad = got.filter((g) => !q.ok.includes(g));
      if (bad.length) { negBad++; fails.push(`Q${q.id} (none expected) attached ${bad.join(', ')}`); }
    } else {
      pos++;
      const good = got.filter((g) => q.rel.includes(g));
      const counted = got.filter((g) => !q.ok.includes(g) || q.rel.includes(g)); // acceptable notes are neutral
      if (!got.length) { empty++; fails.push(`Q${q.id} attached nothing`); }
      if (counted.length) { pSum += good.length / counted.length; pN++; }
      rSum += good.length / Math.min(q.rel.length, opt.k || 3);
      if (good.length) hit++;
      const bad = got.filter((g) => !q.rel.includes(g) && !q.ok.includes(g));
      if (bad.length) fails.push(`Q${q.id} wrong: ${bad.join(', ')}`);
      const missed = q.rel.filter((r) => !got.includes(r));
      if (missed.length && got.length) fails.push(`Q${q.id} missed: ${missed.join(', ')}`);
    }
    if (verbose) console.log(`Q${q.id}`, res.map((r) => `${r.c.path} [${r.score.toFixed(1)}/${r.gate.toFixed(1)}]`).join(' | ') || '—');
  }
  return { P3: pSum / (pN || 1), R: rSum / pos, hit: hit / pos, empty, negAny, negBad, neg, leaks, fails };
}

const fmt = (m) => `P@3 ${m.P3.toFixed(2)}  recall ${m.R.toFixed(2)}  hit@3 ${(m.hit * 100).toFixed(0)}%  pos-empty ${m.empty}/21  neg-any ${m.negAny}/${m.neg}  neg-wrong ${m.negBad}/${m.neg}  leaks ${m.leaks}`;

const { files, readMs } = load(EXCLUDE);
const VARIANTS = [
  { name: 'A concept (flat query, 800)', chunk: 800, opt: { mode: 'concept' } },
  { name: 'A0 concept, no field boosts', chunk: 800, w: { title: 1, heading: 1, tags: 1, links: 1 }, opt: { mode: 'concept' } },
  { name: 'B gated (weighted query, 800)', chunk: 800, opt: { mode: 'gated' } },
  { name: 'C gated, 400-char chunks', chunk: 400, opt: { mode: 'gated' } },
  { name: 'E gated + 2 terms + norm', chunk: 800, opt: { mode: 'gated', norm: 'q', minTerms: 2 }, ths: [0.2, 0.3, 0.4] },
  { name: 'E0 E without field boosts', chunk: 800, w: { title: 1, heading: 1, tags: 1, links: 1 }, opt: { mode: 'gated', norm: 'q', minTerms: 2 }, ths: [0.2, 0.3, 0.4] },
  { name: 'E4 E with 400-char chunks', chunk: 400, opt: { mode: 'gated', norm: 'q', minTerms: 2 }, ths: [0.2, 0.3, 0.4] },
  { name: 'D gated, normalised threshold', chunk: 800, opt: { mode: 'gated', norm: true }, ths: [0.2, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6] },
];
const out = {};
for (const v of VARIANTS) {
  const t0 = performance.now();
  const ix = buildIndex(files, { chunkSize: v.chunk, w: v.w || DEFAULT_W });
  const ms = performance.now() - t0;
  console.log(`\n== ${v.name}: ${files.length} notes, ${ix.N} chunks, index ${(ms + readMs).toFixed(0)} ms`);
  for (const th of v.ths || [0, 2, 3, 4, 5, 6, 7, 8, 10, 12]) {
    const m = evaluate(ix, { ...v.opt, minScore: th });
    console.log(`  min ${String(th).padStart(2)}: ${fmt(m)}`);
    out[`${v.name}@${th}`] = m;
  }
}
// pick
const pickV = process.env.PICK;
if (pickV) {
  const [name, th] = pickV.split('@');
  const v = VARIANTS.find((x) => x.name.startsWith(name));
  const ix = buildIndex(files, { chunkSize: v.chunk, w: v.w || DEFAULT_W });
  const m = evaluate(ix, { ...v.opt, minScore: +th });
  console.log(`\n### failures for ${v.name} @ ${th}\n` + m.fails.join('\n'));
}
// control: no exclusions -> would Private/Daily have matched?
{
  const all = load([]).files;
  const ix = buildIndex(all, {});
  const m = evaluate(ix, { mode: 'gated', minScore: +(process.env.CTRL || 5) });
  console.log(`\ncontrol (no exclusions, gated): ${all.length} notes; Private/Daily attachments: ${m.leaks}`);
}
