// Re-apply the v21 about-page changes on top of a freshly imported Sites export.
//
// The story's editable source lives in the private Sites project, not in this
// repo. After `node scripts/import-about-story.mjs <dist/client>` overwrites
// about.html, the bootstrap payload, the story chunk and the audio iframe, run
//
//   node scripts/patch-about-story.mjs
//
// to restore the conversion, trust and scene fixes described in
// docs/about-story-release-2026-09-11.md. Every edit is anchored on exact text
// and is idempotent: already-applied edits are skipped, and an anchor that no
// longer exists fails loudly so a changed export gets looked at instead of
// silently shipping without a fix. The override stylesheet
// (assets/about-v20/about-v21.css) is a checked-in file the import leaves alone.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const about = join(publicDir, 'assets/about-v20');
const chunks = join(about, '_next/static/chunks');
const only = (dir, re) => {
  const hits = readdirSync(dir).filter(n => re.test(n));
  if (hits.length !== 1) throw new Error(`expected one ${re} in ${dir}, found ${hits.length}`);
  return join(dir, hits[0]);
};

const files = {
  html: join(publicDir, 'about.html'),
  payload: only(about, /^bootstrap-[a-f0-9]{12}\.js$/),
  story: only(chunks, /^scroll-story-[A-Za-z0-9_-]+\.js$/),
  iframe: join(about, 'audio-journey.html'),
};
if (!existsSync(join(about, 'about-v21.css'))) throw new Error('assets/about-v20/about-v21.css is missing');

const FOOTER_HTML =
  '<a class="floating-read" href="/read">Start reading</a>' +
  '<footer class="about-footer"><span class="about-footer-mark">Tinct</span>' +
  '<nav aria-label="Footer"><a href="/read">Start reading</a><a href="/privacy">Privacy</a>' +
  '<a href="mailto:anders@tinct.app">Contact</a></nav></footer>';
const FOOTER_ROWS =
  ',["$","a",null,{"className":"floating-read","href":"/read","children":"Start reading"}]' +
  ',["$","footer",null,{"className":"about-footer","children":[' +
  '["$","span",null,{"className":"about-footer-mark","children":"Tinct"}],' +
  '["$","nav",null,{"aria-label":"Footer","children":[' +
  '["$","a",null,{"href":"/read","children":"Start reading"}],' +
  '["$","a",null,{"href":"/privacy","children":"Privacy"}],' +
  '["$","a",null,{"href":"mailto:anders@tinct.app","children":"Contact"}]]}]]}]';
// The payload is JSON inside a JS string literal, so every quote is escaped.
const esc = s => s.replaceAll('"', '\\"');

// [file, label, anchor, replacement, expectedCount, alreadyAppliedMarker]
const edits = [
  // Conversion: every CTA goes into the product; the wordmark keeps pointing home.
  ['html', 'read-link -> /read', 'class="read-link" href="https://tinct.app"', 'class="read-link" href="/read"', 1],
  ['html', 'story CTAs -> /read', '<a class="primary-link final-read-link" href="https://tinct.app"', '<a class="primary-link final-read-link" href="/read"', null],
  ['html', 'pick up the thread -> /read', '<a href="https://tinct.app">Pick up the thread', '<a href="/read">Pick up the thread', null],
  ['payload', 'read-link -> /read', esc('"className":"read-link","href":"https://tinct.app"'), esc('"className":"read-link","href":"/read"'), 1],
  ['story', 'CTAs -> /read', 'href:`https://tinct.app`', 'href:`/read`', null],
  // Trust: no named competitor, qualified e-reader claim, share image, no cover preload storm.
  ['html', 'competitor name', 'BOOK SUMMARY · BLINKIST', 'BOOK SUMMARY', null],
  ['story', 'competitor name', 'BOOK SUMMARY · BLINKIST', 'BOOK SUMMARY', null],
  ['iframe', 'e-reader copy', '<em>On your favourite<br>e-reader.</em>', '<em>On compatible<br>e-readers.</em>', 1],
  ['html', 'og:image + twitter card', '<meta property="og:type" content="website"/>',
    '<meta property="og:type" content="website"/>' +
    '<meta property="og:image" content="https://tinct.app/og-image.png"/>' +
    '<meta name="twitter:card" content="summary_large_image"/>' +
    '<meta name="twitter:title" content="Tinct · Read something great"/>' +
    '<meta name="twitter:description" content="A beautiful reading app for the world’s greatest books. Read, listen, ask, and pick up the thread when life gets in the way."/>' +
    '<meta name="twitter:image" content="https://tinct.app/og-image.png"/>', 1, 'property="og:image"'],
  ['html', 'override stylesheet', 'data-precedence="vite-rsc/importer-resources"/>',
    'data-precedence="vite-rsc/importer-resources"/><link rel="stylesheet" href="/assets/about-v20/about-v21.css"/>', 1, 'about-v21.css'],
  // Context early: a quiet tagline in the header.
  ['html', 'tagline', 'aria-label="Tinct home">Tinct.</a>',
    'aria-label="Tinct home">Tinct.</a><span class="site-tagline">A reading platform for the greatest books.</span>', 1, 'site-tagline'],
  ['payload', 'tagline', esc('"aria-label":"Tinct home","children":"Tinct."}],'),
    esc('"aria-label":"Tinct home","children":"Tinct."}],["$","span",null,{"className":"site-tagline","children":"A reading platform for the greatest books."}],'), 1, 'site-tagline'],
  // Persistent exit + footer, mirrored in HTML and the server payload so hydration stays clean.
  ['html', 'footer + floating CTA', '</main>', FOOTER_HTML + '</main>', 1, 'about-footer'],
  ['payload', 'footer + floating CTA', esc('{"cinematic":true,"bookshelf":true}]]}]'),
    esc('{"cinematic":true,"bookshelf":true}]') + esc(FOOTER_ROWS) + esc(']}]'), 1, 'about-footer'],
  // Overview scene: sequenced highlights paired with the questions.
  ['story', 'passage steps param', 'function ro({modern:e=!1,highlight:t=``,audio:n=!1,onCharacter:r})',
    'function ro({modern:e=!1,highlight:t=``,audio:n=!1,onCharacter:r,steps:k=null})', 1],
  ['story', 'pass steps in overview', 'highlight:t?``:d<1||n.index===2||n.index===3?g:``,audio:n.index===4&&d>0})',
    'highlight:t?``:d<1||n.index===2||n.index===3?g:``,audio:n.index===4&&d>0,steps:t?[Q(u,.12,.24),Q(u,.32,.44),Q(u,.52,.64)]:null})', 1],
  ['story', 'headline + name marks, modern label',
    '(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(`h3`,{children:`Scene IV.`}),(0,_.jsx)(`p`,{children:(0,_.jsx)(`i`,{children:`Hamlet.`})}),e?',
    '(0,_.jsxs)(_.Fragment,{children:[e?(0,_.jsx)(`p`,{className:`edition-label`,children:`Tinct · Modern translation`}):null,' +
    '(0,_.jsx)(`h3`,{children:(0,_.jsx)(`mark`,{className:`ask-mark`,style:{"--k":k?k[0]:0},children:`Scene IV.`})}),' +
    '(0,_.jsx)(`p`,{children:(0,_.jsx)(`i`,{children:(0,_.jsx)(`mark`,{className:`ask-mark`,style:{"--k":k?k[2]:0},children:`Hamlet.`})})}),e?', 1, 'edition-label'],
  ['story', 'sentence mark',
    '(0,_.jsx)(`span`,{className:t===`language`||t===`voice`||n?`word-target`:``,children:`More honoured in the breach than the observance.`})',
    '(0,_.jsx)(`span`,{className:(t===`language`||t===`voice`||n?`word-target`:``)+(k?` ask-mark`:``),style:k?{"--k":k[1]}:void 0,children:`More honoured in the breach than the observance.`})', 1],
  ['story', 'overview questions', '[`Where was I?`,`What does this mean?`,`Who is this again?`].map',
    '[`What happened before this?`,`I have no idea what this means.`,`Who is this?`].map', 1],
];

const text = Object.fromEntries(Object.entries(files).map(([k, p]) => [k, readFileSync(p, 'utf8')]));
let applied = 0, skipped = 0;
for (const [file, label, anchor, replacement, expected, marker] of edits) {
  const done = marker ? text[file].includes(marker) : text[file].includes(replacement) && !text[file].includes(anchor);
  if (done) { skipped++; continue; }
  const count = text[file].split(anchor).length - 1;
  if (count === 0 || (expected !== null && count !== expected)) {
    throw new Error(`${file}: "${label}" expected ${expected ?? 'one or more'} anchor(s), found ${count}. The export changed; update this script.`);
  }
  text[file] = text[file].replaceAll(anchor, replacement);
  applied++;
  console.log(`applied  ${file}: ${label} (${count})`);
}
// Cover-collection preloads are removed by pattern; nothing to anchor on.
const preloads = text.html.match(/<link rel="preload" as="image" href="\/assets\/about-v20\/assets\/collection\/[^"]+"\/>/g) || [];
if (preloads.length) { text.html = text.html.replaceAll(/<link rel="preload" as="image" href="\/assets\/about-v20\/assets\/collection\/[^"]+"\/>/g, ''); applied++; console.log(`applied  html: removed ${preloads.length} cover preloads`); } else skipped++;

for (const [k, p] of Object.entries(files)) writeFileSync(p, text[k]);
console.log(`done: ${applied} edit(s) applied, ${skipped} already in place`);
