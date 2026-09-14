import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

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
      if (WORKER_ROUTES.has(match[1])) continue;
      const path = match[1].split('?')[0];
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

test('the supplied reveal composition replaces the separate screen overlays', () => {
  const story = readFileSync(publicDir + 'assets/about-v20/_next/static/chunks/scroll-story-BQLclMWW.js', 'utf8');
  assert.match(story, /className:`brand-devices`,style:\{opacity:Q\(u,\.08,\.28\)/);
  assert.ok(story.includes('/assets/about-v20/assets/introducing-tinct-20260914-v2.png'));
  assert.ok(existsSync(publicDir + 'assets/about-v20/assets/introducing-tinct-20260914-v2.png'));
  assert.match(css, /\.brand-ensemble \.device-canvas>img\.lit-screen\{display:none\}/);
});

test('joke sequence runs once across scene remounts and scroll reversals', () => {
  const js = readFileSync(publicDir + 'assets/about-v20/about-v21.js', 'utf8');
  const source = js.slice(js.indexOf('var jokeStarted = false;'), js.indexOf('  function update()'));
  let active = true;
  const timers = [], states = [];
  const context = {
    document: { querySelector: () => ({ getBoundingClientRect: () => ({ bottom: 500 }), getAttribute: () => active ? 'true' : 'false' }) },
    root: { setAttribute: (_, value) => states.push(value) },
    setTimeout: (fn, delay) => timers.push({ fn, delay }),
  };
  runInNewContext(source + '; updateJoke();', context);
  assert.deepEqual(timers.map(t => t.delay), [1700, 2400, 3000]);
  assert.deepEqual(states, []);
  timers[0].fn();
  active = false;
  runInNewContext('updateJoke()', context);
  active = true;
  runInNewContext('updateJoke()', context);
  assert.equal(timers.length, 3);
  timers[1].fn(); timers[2].fn();
  assert.deepEqual(states, ['1', '2', '3']);
});

test('better-reading statements switch discretely and reverse with scroll', () => {
  const js = readFileSync(publicDir + 'assets/about-v20/about-v21.js', 'utf8');
  const source = js.slice(js.indexOf('  function updateBetter()'), js.indexOf('  function update()'));
  let progress = 0, state;
  const scene = { style: { getPropertyValue: () => String(progress) }, getAttribute: () => state, setAttribute: (_, value) => { state = value; } };
  const context = { document: { querySelectorAll: () => [scene] } };
  runInNewContext(source, context);
  for (const [p, expected] of [[0,'0'],[.18,'1'],[.43,'1'],[.44,'2'],[.7,'3'],[.3,'1'],[0,'0']]) {
    progress = p; runInNewContext('updateBetter()', context); assert.equal(state, expected);
  }
});
