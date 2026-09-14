import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const html = readFileSync(publicDir + 'about.html', 'utf8');
const iframe = readFileSync(publicDir + 'assets/about-v20/audio-journey.html', 'utf8');

test('published story is the approved bookshelf variant, not the reader', () => {
  assert.match(html.replace(/<[^>]*>/g, ' '), /We live in the\s+age of/);
  assert.match(html, /cinematic/);
  assert.match(html, /https:\/\/tinct.app\/about/);
  assert.doesNotMatch(html, /noindex|noarchive|nofollow/);
  assert.doesNotMatch(html, /assets\/index-/);
});

test('parent and audio iframe comply with script-src self', () => {
  for (const document of [html, iframe]) {
    for (const script of document.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      assert.match(script[1], /src=/);
      assert.equal(script[2].trim(), '');
    }
  }
});

const WORKER_ROUTES = new Set(['/library']);

test('all HTML asset references resolve inside the isolated namespace', () => {
  for (const document of [html, iframe]) {
    for (const match of document.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
      // Workers static assets serve /privacy from privacy.html (html_handling), so
      // accept an extensionless page link when its .html file exists. A few
      // public URLs are worker routes with no file of their own: /library is
      // served from /lab/ by src/worker/routes/seo.ts.
      const path = match[1].split('?')[0];
      if (WORKER_ROUTES.has(path)) continue;
      assert.ok(existsSync(publicDir + path) || existsSync(publicDir + path + '.html'), match[1]);
    }
  }
  assert.ok(existsSync(publicDir + 'about.rsc'));
});

// Phone fixes (docs/about-phone-fixes-2026-09-11.md): the ground under the story, the pill's home on phones, and
// the reading scenes' unit system are checkable from the files.
const css = readFileSync(publicDir + 'assets/about-v20/about-v21.css', 'utf8');
// The rules of the first `query` block that mentions `needle` (the stylesheet has several blocks per media query).
const block = (source, query, needle) => {
  for (let start = source.indexOf(query); start !== -1; start = source.indexOf(query, start + 1)) {
    let depth = 0, i = source.indexOf('{', start);
    for (; i < source.length; i++) { if (source[i] === '{') depth++; else if (source[i] === '}' && --depth === 0) break; }
    const found = source.slice(start, i + 1);
    if (found.includes(needle)) return found;
  }
  assert.fail(`${query} block containing ${needle}`);
};

test('every layer under the story is the story ground, and Safari is told the same colour', () => {
  assert.match(css, /(^|\n)html,body,\.journey\.story-root\[data-bookshelf=true\]\{background:#191411\}/);
  assert.match(html, /<meta name="theme-color" content="#191411"\/>/);
});

test('on phones the pill is anchored to the bottom, clear of the toolbar, and hidden over the closing button', () => {
  const phone = block(css, '@media (max-width:760px)', '.floating-read{');
  assert.match(phone, /\.floating-read\{[^}]*top:auto/);
  assert.match(phone, /\.floating-read\{[^}]*bottom:calc\(14px \+ env\(safe-area-inset-bottom,0px\)\)/);
  const js = readFileSync(publicDir + 'assets/about-v20/about-v21.js', 'utf8');
  assert.match(js, /'\.final-read-link'/);
});

test('phone reading scenes place headline and page in the same unit system (no vh)', () => {
  const phone = block(css, '@media (max-width:1024px)', '.reading-object-stage{');
  assert.doesNotMatch(phone, /\d+vh/);
  assert.match(phone, /\.reading-object-stage\{[^}]*bottom:var\(--page-foot\)[^}]*height:var\(--page-h\)/);
  assert.match(phone, /\.reading-narration\{[^}]*bottom:calc\(var\(--page-foot\) \+ var\(--page-h\) \+ 32px\)/);
});

test('the reveal lights every screen before the devices are fully visible', () => {
  const story = readFileSync(publicDir + 'assets/about-v20/_next/static/chunks/scroll-story-BQLclMWW.js', 'utf8');
  assert.match(story, /className:`brand-devices`,style:\{opacity:Q\(u,\.08,\.28\)/);
  assert.match(story, /lit-screen[^;]*opacity:Q\(u,e\.kind===`desktop`\?\.1:e\.kind===`eink`\?\.14:\.18,e\.kind===`desktop`\?\.2:e\.kind===`eink`\?\.24:\.28\)/);
});

test('middle skips repeated sections while preserving the bookshelf index and incoming scene', () => {
  const story = readFileSync(publicDir + 'assets/about-v20/_next/static/chunks/scroll-story-BQLclMWW.js', 'utf8');
  assert.doesNotMatch(html, /id="chapter-(better|effortless)"/);
  assert.match(story, /t&&\(n===4\|\|n===6\|\|n>=9&&n<=13\)\?null:/);
  assert.match(story, /o\(nextSceneIndex,0,100\*\(1-r.travel\),!0\)/);
  const expression = story.match(/nextSceneIndex=([^;]+);\(0,c.useEffect/)[1];
  for (const [a, expected] of [[3,5],[5,7],[7,8]]) {
    assert.equal(runInNewContext(expression, {t:true,a}), expected);
  }
});

test('removing the bridge preserves the absolute duration of every product demonstration', () => {
  const story = readFileSync(publicDir + 'assets/about-v20/_next/static/chunks/scroll-story-BQLclMWW.js', 'utf8');
  const source = story.match(/function no\(e\)\{.*?\}\}/)[0];
  const locate = runInNewContext(`(${source})`);
  assert.equal(locate(0).index, 5, 'Tinct appears immediately after the overview');
  const oldEdges = [0,.09756,.16585,.37724,.49675,.61626,.75285,1];
  const order = [5,2,1,3,0,4];
  for (let i = 0; i < order.length; i++) {
    const oldStart = oldEdges[i+1], oldEnd = oldEdges[i+2];
    const progress = ((oldStart+oldEnd)/2-.09756)/(1-.09756);
    assert.equal(locate(progress).index, order[i]);
    assert.ok(Math.abs(locate(progress).progress-.5)<1e-8);
    assert.ok(Math.abs((oldEnd-oldStart)*2460-(oldEnd-oldStart)/(1-.09756)*2220)<.02);
  }
  assert.equal(locate(1).index, 4);
});

test('the new stylesheet and module entry use one cache version', () => {
  assert.match(html, /about-v21\.css\?v=copy-20260914/);
  assert.match(html, /index-D9hLDidQ\.js\?v=copy-20260914/);
  const entry = readFileSync(publicDir + 'assets/about-v20/_next/static/chunks/index-D9hLDidQ.js', 'utf8');
  assert.match(entry, /scroll-story-BQLclMWW\.js\?v=copy-20260914/);
});
