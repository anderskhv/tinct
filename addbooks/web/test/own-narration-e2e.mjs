// Read-aloud of an own book, end to end in headless Chromium (muted), with the speech
// provider never reached: /api/narration/voices and /api/narration/own/* are mocked here.
//   node addbooks/web/test/own-narration-e2e.mjs
// Needs both builds: `npm run build` in app/ and `node addbooks/web/scripts/build.mjs`.
// Checks: Listen shows only when the server offers own books; Play sends the chapter's
// text and the book's hex to the own-book route only; the private signed audio link is
// what plays; the book id never reaches any other request.
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { start } from './serve.mjs';
import { makeEpub } from './make-epub.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(HERE, '../../..');
const require = createRequire(join(REPO, 'app/package.json'));
const { chromium } = require('@playwright/test');
const OUT = join(HERE, 'output'); mkdirSync(OUT, { recursive: true });
const PORT = 4731, ORIGIN = `http://127.0.0.1:${PORT}`, BASE = `${ORIGIN}/lab/addbook/`;
const EXEC = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const SESSION_KEY = 'sb-yazjyiqsxjystvpkyouk-auth-token';
const READER_URL = /\/reader\?userBook=[0-9a-f]{24}$/;
const EPUB = join(OUT, 'own-narration.epub');
writeFileSync(EPUB, makeEpub({ title: 'Listening Notebook' }));
const HEX = createHash('sha256').update(makeEpub({ title: 'Listening Notebook' })).digest('hex').slice(0, 24);

/** A silent MP3 (MPEG-1 Layer III frame headers, 128 kb/s, 44.1 kHz): about 2 s, no provider. */
function silentMp3(frames = 80) {
  const bytes = Buffer.alloc(frames * 417);
  for (let i = 0; i < frames; i++) bytes.set([0xff, 0xfb, 0x90, 0x00], i * 417);
  return bytes;
}

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + JSON.stringify(detail).slice(0, 300) : ''}`) };

async function run(browser, { ownBooks }) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });
  await ctx.route(/^https:\/\/[a-z0-9]+\.supabase\.co\//, route => {
    const req = route.request();
    if (!/\/auth\/v1\/token\?grant_type=refresh_token/.test(req.url())) return route.abort();
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'test-token', refresh_token: 'refresh-test-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'u-test', aud: 'authenticated', email: 'reader@example.com' } }) });
  });
  const seen = [], ensures = [], audioFetches = [];
  await ctx.route(`${ORIGIN}/api/narration/**`, async route => {
    const req = route.request(), url = new URL(req.url());
    if (url.pathname === '/api/narration/voices') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ enabled: true, provider: 'grok', model: 'grok-tts-v1', voices: [{ key: 'f', label: 'Ara', persona: 'female', cacheIdentity: 'a'.repeat(64) }], ownBooks }) });
    }
    if (url.pathname === '/api/narration/own/ensure') {
      const body = JSON.parse(req.postData() || '{}');
      ensures.push({ body, auth: req.headers().authorization });
      const paragraphs = body.paragraphs.map(({ index, text }) => {
        const spoken = text.replace(/\s+/g, ' ').trim(), tokens = spoken.split(' ');
        const hash = createHash('sha256').update(`${index}:${spoken}`).digest('hex');
        const duration = 2;
        const words = tokens.map((token, i) => ({ text: token, start: i * duration / tokens.length, end: (i + 1) * duration / tokens.length }));
        const link = `/api/narration/own/audio?u=u-test&b=${HEX}&h=${hash}&e=9999999999999&s=${'0'.repeat(64)}`;
        return { paragraph: index, status: 'ready', textHash: createHash('sha256').update(spoken).digest('hex'), chunkCount: 1, readyChunks: 1,
          chunks: [{ index: 0, wordFrom: 0, wordTo: tokens.length, ready: true, hash, url: link, duration, words, alignment: { expectedWords: tokens.length, heardWords: tokens.length, matchedWords: tokens.length, matchRatio: 1 }, timingsUsable: true }],
          duration, words, timingsUsable: true };
      });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ voice: 'f', model: 'grok-tts-v1', mode: body.mode, paragraphs }) });
    }
    if (url.pathname === '/api/narration/own/audio') {
      audioFetches.push(url.search);
      return route.fulfill({ status: 200, contentType: 'audio/mpeg', headers: { 'Cache-Control': 'private, max-age=60', 'Accept-Ranges': 'bytes' }, body: silentMp3() });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"Not found"}' });
  });
  const p = await ctx.newPage();
  p.on('request', r => seen.push({ url: r.url(), body: r.postData() || '' }));
  await p.goto(BASE);
  await p.evaluate(([key]) => localStorage.setItem(key, JSON.stringify({ access_token: 'test-token', refresh_token: 'refresh-test-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'u-test', email: 'reader@example.com' } })), [SESSION_KEY]);
  await p.reload();
  await p.waitForSelector('#doorOwn');
  const chooser = p.waitForEvent('filechooser');
  await p.click('#abDrop');
  await (await chooser).setFiles(EPUB);
  await Promise.race([p.waitForSelector('#attestBox', { timeout: 30000 }), p.waitForURL(READER_URL, { timeout: 30000 })]);
  if (!READER_URL.test(p.url()) && await p.$('#attestBox')) {
    const copy = await p.evaluate(() => document.querySelector('#attestBox').closest('label').textContent.trim());
    if (ownBooks) check('the rights checkbox covers listening and responsibility', /read and listen to it in Tinct/.test(copy) && /responsible for what I upload and share/.test(copy), { copy });
    await p.check('#attestBox'); await p.click('#attestOk');
  }
  await p.waitForURL(READER_URL, { timeout: 30000 });
  await p.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true' && document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]').length > 1, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  const play = await p.$('[data-testid="lab-v2-play"]');
  if (!ownBooks) {
    check('Listen stays hidden when the server does not offer own books', !play);
    check('nothing asks for own-book narration', ensures.length === 0 && audioFetches.length === 0);
  } else {
    check('Listen shows for a signed-in owner when the server offers own books', !!play);
    await play.click();
    for (let i = 0; i < 60 && audioFetches.length === 0; i++) await p.waitForTimeout(250);
    const first = ensures[0];
    const chapterText = await p.evaluate(() => [...document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]')].map(w => w.textContent).join(' '));
    check('Play sends the book hex and the chapter text to the own-book route, signed in', first && first.body.book === `${HEX}` && first.auth === 'Bearer test-token'
      && first.body.paragraphs.length > 0 && first.body.paragraphs.every(item => typeof item.text === 'string' && item.text.length > 0), { first: first && { book: first.body.book, paragraphs: first.body.paragraphs.map(item => item.text) }, chapterText: chapterText.slice(0, 80) });
    check('the private signed link is what plays', audioFetches.length > 0, { audioFetches: audioFetches.length });
    await p.waitForTimeout(1500);
    const state = await p.evaluate(() => ({ playing: document.querySelector('[data-testid="lab-v2-play"]')?.getAttribute('aria-label'), error: document.querySelector('[data-testid="lab-narration-error"]')?.textContent || null }));
    check('playback starts without a narration error', !state.error, state);
    await p.screenshot({ path: join(OUT, 'own-narration-playing.png') });
  }
  const leaks = seen.filter(r => !r.url.includes('/api/narration/own/') && (r.url.includes('userbook-') || r.body.includes('userbook-') || r.url.includes(HEX) || r.body.includes(HEX)) && !r.url.includes('/reader?userBook=') && !r.url.includes('/api/user-books'));
  check(`${ownBooks ? 'on' : 'off'}: the book id never reaches another request`, leaks.length === 0, leaks.map(r => r.url));
  const shared = seen.filter(r => /\/api\/narration\/(ensure|listen|chapter|prepare)|\/covers\/v2\/userbook/.test(r.url));
  check(`${ownBooks ? 'on' : 'off'}: no shared narration route, listen report or cover request`, shared.length === 0, shared.map(r => r.url));
  await ctx.close();
}

const server = await start(PORT);
const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
try {
  await run(browser, { ownBooks: false });
  await run(browser, { ownBooks: true });
} finally {
  await browser.close();
  server.close();
}
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
