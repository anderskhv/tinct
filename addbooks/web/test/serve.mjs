// A local stand-in for tinct.app: serves the built page at /lab/addbook/, Tinct's fonts
// at /fonts/, sends production's Content-Security-Policy, and answers /api/chat and
// /api/lab-chat with a streamed reply in the Anthropic event format the Worker relays.
// Like the Worker, /api/chat accepts the last turn as text and image blocks (base64 PNG,
// JPEG or WebP, at most 4) and /api/lab-chat refuses pictures with images_unavailable.
// Every chat request body is kept for the tests at GET /__requests.
// /api/user-books (the reader's private copies in their account) is an in-memory stand-in
// for the Worker route: Bearer test-token / cloud-token / other-token are three accounts,
// files are checked by their bytes (PDF, or ZIP with an EPUB mimetype) and capped at 50 MB.
// Its state and a log of calls are at GET /__books.
// The Tinct reader is served from the app build (app/dist, `npm run build` in app/) at
// /reader, with its assets, so an EPUB opened here can be read in it (/reader?userBook=…).
//   node addbooks/web/test/serve.mjs [port]
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const REPO = join(fileURLToPath(import.meta.url), '../../../..');
const DIST = join(REPO, 'addbooks/web/dist/lab-addbook');
const FONTS = join(REPO, 'app/public/fonts');
const APP = join(REPO, 'app/dist');
// The shared internal-traffic flag (?internal=1) every tinct.app page loads.
const INTERNAL = join(REPO, 'app/public/lab/internal-traffic.js');
// Copied from app/src/worker/routes/seo.ts (SECURITY_HEADERS) so the tests run under the real policy.
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' http://127.0.0.1:47653/theme https://yazjyiqsxjystvpkyouk.supabase.co wss://yazjyiqsxjystvpkyouk.supabase.co https://api.stripe.com wss://api.x.ai; img-src 'self' data: blob:; media-src 'self' blob: mediastream:; frame-src 'self' https://js.stripe.com; frame-ancestors 'self'";
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.gz': 'application/gzip', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
export const requests = [];

const BOOK_USERS = { 'Bearer test-token': 'u-test', 'Bearer cloud-token': 'u-cloud', 'Bearer other-token': 'u-other' };
const BOOK_BYTES = 50 * 1024 * 1024;
export const books = { users: {}, log: [] };
const sendJson = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)) };
function sniff(buf) {
  // As the Worker (sniffBookType): a PDF starts with %PDF- and ends with its %%EOF marker.
  if (buf.subarray(0, 5).toString('latin1') === '%PDF-') return buf.subarray(Math.max(0, buf.length - 4096)).toString('latin1').includes('%%EOF') ? 'pdf' : null;
  if (buf.length > 38 && buf.readUInt32LE(0) === 0x04034b50 && buf.subarray(30, 38).toString('latin1') === 'mimetype') {
    const at = 30 + buf.readUInt16LE(26) + buf.readUInt16LE(28);
    if (buf.subarray(at, at + 20).toString('latin1') === 'application/epub+zip') return 'epub';
  }
  return null;
}
function userBooks(req, res, url) {
  const user = BOOK_USERS[req.headers.authorization || ''];
  const id = url.pathname.slice('/api/user-books/'.length) || null;
  books.log.push({ method: req.method, id, user: user || null });
  if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
  const mine = books.users[user] ||= [];
  if (!id && req.method === 'GET') return sendJson(res, 200, { books: mine.map(({ bytes, ...b }) => b) });
  if (!id && req.method === 'POST') {
    const parts = []; let size = 0;
    req.on('data', c => { size += c.length; if (size <= BOOK_BYTES) parts.push(c) });
    req.on('end', () => {
      if (size > BOOK_BYTES) return sendJson(res, 413, { error: 'file_too_large' });
      const buf = Buffer.concat(parts), type = sniff(buf);
      if (!type) return sendJson(res, 415, { error: 'unsupported_type' });
      const sha256 = createHash('sha256').update(buf).digest('hex');
      const same = mine.find(b => b.sha256 === sha256);
      if (same) { const { bytes, ...book } = same; return sendJson(res, 200, { book, existing: true }) }
      const h = n => { try { return decodeURIComponent(req.headers[n] || '') } catch { return '' } };
      const book = { id: randomBytes(16).toString('hex'), name: h('x-book-name'), title: h('x-book-title'), author: h('x-book-author'), type, size: buf.length, sha256, createdAt: new Date().toISOString() };
      mine.unshift({ ...book, bytes: buf });
      sendJson(res, 201, { book });
    });
    return;
  }
  const found = id && mine.find(b => b.id === id);
  if (!found) return sendJson(res, 404, { error: 'Not found' });
  if (req.method === 'GET') { res.writeHead(200, { 'Content-Type': found.type === 'pdf' ? 'application/pdf' : 'application/epub+zip', 'Content-Length': found.bytes.length, 'Cache-Control': 'no-store' }); res.end(found.bytes); return }
  if (req.method === 'DELETE') { mine.splice(mine.indexOf(found), 1); return sendJson(res, 200, { ok: true }) }
  sendJson(res, 405, { error: 'Method not allowed' });
}

function sse(res, text) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  send('message_start', { type: 'message_start', message: { id: 'msg_test', role: 'assistant', content: [] } });
  send('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
  const parts = text.match(/.{1,24}/gs) || [];
  let i = 0;
  const tick = () => {
    if (i < parts.length) { send('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: parts[i++] } }); setTimeout(tick, 15); return }
    send('content_block_stop', { type: 'content_block_stop', index: 0 });
    send('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn' } });
    send('message_stop', { type: 'message_stop' });
    res.end();
  };
  tick();
}

export function start(port = 4720) {
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'POST' && (url.pathname === '/api/chat' || url.pathname === '/api/lab-chat')) {
      let body = '';
      req.setEncoding('utf8');
      req.on('data', c => { body += c });
      req.on('end', () => {
        let json = null; try { json = JSON.parse(body) } catch {}
        const auth = req.headers.authorization || null;
        requests.push({ path: url.pathname, auth, body: json });
        if (url.pathname === '/api/chat' && auth === 'Bearer expired-token') { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end('{"error":"Unauthorized"}'); return }
        const selection = ['explain', 'define'].includes(json?.companion?.intent) ? json.companion.selection : null;
        if (!json?.companion?.context?.paragraphs || (!json?.messages?.length && !selection)) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end('{"error":"Invalid request"}'); return }
        const last = selection ? `${json.companion.intent}: ${selection}` : json.messages.at(-1).content;
        const blocks = Array.isArray(last) ? last : null;
        const images = blocks ? blocks.filter(b => b?.type === 'image') : [];
        if (blocks && url.pathname === '/api/lab-chat' && images.length) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end('{"error":"images_unavailable"}'); return }
        const imageOk = b => b?.source?.type === 'base64' && ['image/png', 'image/jpeg', 'image/webp'].includes(b.source.media_type) && /^[A-Za-z0-9+/]+={0,2}$/.test(b.source.data || '') && b.source.data.length * 0.75 <= 1572864;
        if (blocks && (images.length > 4 || !images.every(imageOk) || !blocks.every(b => b?.type === 'image' || (b?.type === 'text' && typeof b.text === 'string')))) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end('{"error":"image_rejected"}'); return }
        const ask = blocks ? blocks.filter(b => b.type === 'text').map(b => b.text).join('\n') : last;
        const seen = images.length ? ` [${images.length} image${images.length > 1 ? 's' : ''}]` : '';
        const reply = /reply with only JSON/i.test(ask) ? '{"title": "Mock stretch", "summary": "A mock summary of these pages."}' : `MOCK ANSWER (${url.pathname})${seen}. You asked: ${ask.slice(0, 60)}`;
        sse(res, reply);
      });
      return;
    }
    // The Tinct reader asks what narration offers. Answered like the Worker with the narration
    // pilot off (app/src/worker/routes/narration.ts handleVoices; settings and versions left
    // out): no Listen, and no own-book narration. own-narration-e2e.mjs mocks the "on" case.
    if (req.method === 'GET' && url.pathname === '/api/narration/voices') {
      const voice = (key, label, persona) => ({ key, label, persona, cacheIdentity: createHash('sha256').update('stand-in:' + key).digest('hex') });
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ enabled: false, reason: 'pilot_off', provider: 'grok', model: 'grok-tts-v1', voices: [voice('f', 'Ara', 'female'), voice('m', 'Helios', 'male'), voice('orion', 'Orion', 'male'), voice('eve', 'Eve', 'female')], ownBooks: false }));
      return;
    }
    if (url.pathname === '/api/user-books' || url.pathname.startsWith('/api/user-books/')) return userBooks(req, res, url);
    // Reading time (social ship 1) is off here, as the Worker answers with the flag off.
    if (req.method === 'GET' && url.pathname === '/api/reading-time/status') return sendJson(res, 200, { enabled: false });
    // The library is not served here: a stand-in page marks where own books' back arrows land (My shelf).
    if (url.pathname === '/library') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': CSP }); res.end('<!doctype html><meta charset="utf-8"><title>Library</title><p>Library stand-in</p>'); return }
    // The library's My shelf "+" pop-up, stood in: it adds a file with Add a book's engine (shelf-add.js).
    if (url.pathname === '/__shelf-add') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': CSP, 'Cache-Control': 'no-store' }); res.end('<!doctype html><meta charset="utf-8"><title>My shelf</title><input type="file" id="file" accept="application/pdf,.pdf,application/epub+zip,.epub"><p id="status"></p><script src="/lab/addbook/js/tinct-api.js"></script><script src="/lab/addbook/js/epub.js"></script><script src="/lab/addbook/js/add-engine.js"></script><script src="/__shelf-add.js"></script>'); return }
    if (url.pathname === '/__shelf-add.js') { res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Content-Security-Policy': CSP, 'Cache-Control': 'no-store' }); res.end(readFileSync(join(REPO, 'addbooks/web/test/shelf-add.js'))); return }
    if (url.pathname === '/__books') { sendJson(res, 200, { users: Object.fromEntries(Object.entries(books.users).map(([u, list]) => [u, list.map(({ bytes, ...b }) => b)])), log: books.log }); return }
    if (url.pathname === '/__requests') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(requests)); return }
    let file = null;
    if (url.pathname.startsWith('/lab/addbook/')) file = join(DIST, normalize(decodeURIComponent(url.pathname.slice('/lab/addbook/'.length) || 'index.html')));
    else if (url.pathname === '/lab/addbook') { res.writeHead(301, { Location: '/lab/addbook/' }); res.end(); return }
    else if (url.pathname.startsWith('/fonts/')) file = join(FONTS, normalize(decodeURIComponent(url.pathname.slice(7))));
    else if (url.pathname === '/lab/internal-traffic.js') file = INTERNAL;
    else if (url.pathname === '/reader') file = join(APP, 'app.html');
    else if (!url.pathname.startsWith('/api/')) file = join(APP, normalize(decodeURIComponent(url.pathname)));
    if (file && existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!file || !existsSync(file) || (!file.startsWith(DIST) && !file.startsWith(FONTS) && !file.startsWith(APP + '/') && file !== INTERNAL)) { res.writeHead(404, { 'Content-Type': url.pathname.startsWith('/api/') ? 'application/json' : 'text/plain' }); res.end(url.pathname.startsWith('/api/') ? '{"error":"Not found"}' : 'Not found'); return }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
    res.end(readFileSync(file));
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || 4720);
  start(port).then(() => console.log(`http://127.0.0.1:${port}/lab/addbook/`));
}
