// Throwaway prototype: local BM25F-lite over Markdown chunks. No dependencies.
import fs from 'node:fs';
import path from 'node:path';

const STOP = new Set(('a an and are as at be been but by can could did do does doing for from had has have he her his how i if in into is it its just me my not of on or our out she so than that the their them then there these they this to too was we were what when where which who whom why will with would you your about after again all also am any because before being both each few further here more most other over own same should some such through under until very while up down off once only few nor yet thing things really mean means think thou thee thy thyself shall upon one also say says said tell use get got make made like way').split(' '));
// tiny Danish stoplist so Danish notes are not dominated by function words
for (const w of 'og i at det en den til er som på de med han af for ikke der var mig sig men et har om vi min havde ham hun nu over da fra du ud sin dem os op man hans hvor eller hvad skal selv her alle vil blev kunne ind når være dog noget ville jo deres efter ned skulle denne end dette mit også under have dig anden hende mine alt meget sit sine vor mod disse hvis din nogle hos blive mange ad bliver hendes været thi jer sådan'.split(' ')) STOP.add(w);

export function stem(w) {
  if (w.length <= 3) return w;
  if (w.endsWith("'s") || w.endsWith('’s')) w = w.slice(0, -2);
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('ly') && w.length > 5) return w.slice(0, -2);
  if (w.endsWith('es') && /(ss|x|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && !w.endsWith('is')) return w.slice(0, -1);
  return w;
}
export function tokens(s) {
  return (s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(/[\p{L}\p{N}]+/gu) || [])
    .filter((t) => t.length > 1 && !STOP.has(t)).map(stem);
}

// ---- parse + chunk one Markdown file ----
export function parseNote(rel, raw, chunkSize = 800) {
  let body = raw, tags = [];
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    body = raw.slice(fm[0].length);
    const t = fm[1].match(/tags:\s*\[([^\]]*)\]/) || fm[1].match(/tags:\s*\n((?:\s*-\s*.+\n?)+)/);
    if (t) tags = t[1].split(/[,\n]/).map((x) => x.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
  }
  for (const m of body.matchAll(/(?:^|\s)#([\p{L}][\w/-]*)/gu)) tags.push(m[1]);
  const links = [...body.matchAll(/\[\[([^\]|#]+)/g)].map((m) => m[1]);
  const h1 = body.match(/^#\s+(.+)$/m);
  const title = h1 ? h1[1] : path.basename(rel, '.md');
  // split into sections at headings, then pack paragraphs up to chunkSize
  const chunks = [];
  let heading = title, buf = '';
  const flush = () => { if (buf.trim()) chunks.push({ heading, text: buf.trim() }); buf = ''; };
  const paras = [];
  for (const block of body.split(/\n\s*\n/)) {
    for (const line of block.split('\n')) {
      const h = line.match(/^#{1,6}\s+(.+)$/);
      if (h) { paras.push({ h: h[1] }); } else if (line.trim()) {
        if (paras.length && typeof paras[paras.length - 1] === 'string') paras[paras.length - 1] += '\n' + line; else paras.push(line);
      }
    }
    paras.push(null); // paragraph break
  }
  for (const p of paras) {
    if (p === null) continue;
    if (typeof p === 'object') { flush(); heading = p.h; continue; }
    const pieces = p.length > chunkSize ? p.match(new RegExp(`[\\s\\S]{1,${chunkSize}}(?:[.!?]\\s|$)|[\\s\\S]{1,${chunkSize}}`, 'g')) : [p];
    for (const piece of pieces) {
      if (buf.length + piece.length > chunkSize) flush();
      buf += (buf ? '\n\n' : '') + piece;
    }
  }
  flush();
  return chunks.map((c, i) => ({ path: rel, title, heading: c.heading, text: c.text, tags, links, i }));
}

// ---- walk the folder: .md only, skip dot-folders and excluded paths ----
export function walk(root, exclude = []) {
  const out = [];
  (function rec(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name), rel = path.relative(root, full).split(path.sep).join('/');
      if (exclude.some((x) => rel === x || rel.startsWith(x.replace(/\/?$/, '/')))) continue;
      if (e.isDirectory()) rec(full); else if (e.name.toLowerCase().endsWith('.md')) out.push(rel);
    }
  })(root);
  return out;
}

export const DEFAULT_W = { title: 3, heading: 1.5, tags: 2, links: 1.5 };
export function buildIndex(files, { chunkSize = 800, w = DEFAULT_W } = {}) {
  const chunks = [], df = new Map();
  for (const [rel, raw] of files) for (const c of parseNote(rel, raw, chunkSize)) {
    const tf = new Map();
    const add = (s, wt) => { for (const t of tokens(s)) tf.set(t, (tf.get(t) || 0) + wt); };
    add(c.text, 1);
    add(c.title + ' ' + path.basename(rel, '.md'), w.title);
    if (c.heading !== c.title) add(c.heading, w.heading);
    add(c.tags.join(' '), w.tags);
    add(c.links.join(' '), w.links);
    c.tf = tf; c.len = tokens(c.text).length || 1;
    for (const t of tf.keys()) df.set(t, (df.get(t) || 0) + 1);
    chunks.push(c);
  }
  const avg = chunks.reduce((s, c) => s + c.len, 0) / (chunks.length || 1);
  return { chunks, df, N: chunks.length, avg };
}

const K1 = 1.2, B = 0.75;
function bm25(ix, c, qmap) {
  let s = 0;
  for (const [t, qw] of qmap) {
    const f = c.tf.get(t); if (!f) continue;
    const idf = Math.log(1 + (ix.N - ix.df.get(t) + 0.5) / (ix.df.get(t) + 0.5));
    s += qw * idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * c.len / ix.avg));
  }
  return s;
}
function qmapOf(parts) { // parts: [[text, weight]]
  const m = new Map();
  for (const [txt, wt] of parts) for (const t of tokens(txt || '')) m.set(t, Math.max(m.get(t) || 0, wt));
  return m;
}

// mode 'concept': one flat query (question + title + author + selection), threshold on total score.
// mode 'gated': same ranking terms but weighted; the threshold applies only to the score of question+selection terms,
//               so the book title/author can reorder but never attach a note on its own.
export function search(ix, { question, selection = '', title = '', author = '' }, opt = {}) {
  const { mode = 'concept', minScore = 4, k = 3, perNote = 1, wSel = 0.5, wBook = 0.35 } = opt;
  const full = mode === 'concept'
    ? qmapOf([[question, 1], [selection, 1], [title, 1], [author, 1]])
    : qmapOf([[question, 1], [selection, wSel], [title, wBook], [author, wBook]]);
  const gate = mode === 'concept' ? full : qmapOf([[question, 1], [selection, wSel]]);
  // norm: divide the gate score by the query's idf mass (terms unknown to the vault count at max idf),
  // so the threshold means "share of the question's information matched" and does not drift with vault size
  let mass = 1;
  if (opt.norm) { mass = 0; for (const [t, qw] of (opt.norm === 'q' ? qmapOf([[question, 1]]) : gate)) mass += qw * Math.log(1 + (ix.N - (ix.df.get(t) || 0) + 0.5) / ((ix.df.get(t) || 0) + 0.5)); mass = mass || 1; }
  const scored = [];
  for (const c of ix.chunks) {
    const g = bm25(ix, c, gate) / mass; if (g < minScore) continue;
    if (opt.minTerms) { let m = 0; for (const t of gate.keys()) if (c.tf.has(t)) m++; if (m < opt.minTerms) continue; }
    scored.push({ c, score: mode === 'concept' ? g : bm25(ix, c, full), gate: g });
  }
  scored.sort((a, b) => b.score - a.score);
  const out = [], per = new Map();
  for (const s of scored) {
    if ((per.get(s.c.path) || 0) >= perNote) continue;
    per.set(s.c.path, (per.get(s.c.path) || 0) + 1);
    out.push(s); if (out.length >= k) break;
  }
  return out;
}

// payload: ≤3 passages, each ≤1200 chars, ≤2400 chars (~600 tokens) total
export function payload(results, { per = 1200, total = 2400 } = {}) {
  let left = total; const notes = [];
  for (const { c } of results) {
    const head = c.heading && c.heading !== c.title ? `${c.title} › ${c.heading}\n` : `${c.title}\n`;
    let text = (head + c.text).slice(0, Math.min(per, left));
    if (text.length < 40) break;
    left -= text.length; notes.push({ path: c.path, text });
  }
  return notes;
}
