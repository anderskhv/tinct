// A local stand-in for tinct.app: serves the built page at /lab/addbook/, Tinct's fonts
// at /fonts/, sends production's Content-Security-Policy, and answers /api/chat and
// /api/lab-chat with a streamed reply in the Anthropic event format the Worker relays.
// Like the Worker, /api/chat accepts the last turn as text and image blocks (base64 PNG,
// JPEG or WebP, at most 4) and /api/lab-chat refuses pictures with images_unavailable.
// Every chat request body is kept for the tests at GET /__requests.
//   node addbooks/web/test/serve.mjs [port]
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(fileURLToPath(import.meta.url), '../../../..');
const DIST = join(REPO, 'addbooks/web/dist/lab-addbook');
const FONTS = join(REPO, 'app/public/fonts');
// Copied from app/src/worker/routes/seo.ts (SECURITY_HEADERS) so the tests run under the real policy.
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' http://127.0.0.1:47653/theme https://yazjyiqsxjystvpkyouk.supabase.co wss://yazjyiqsxjystvpkyouk.supabase.co https://api.stripe.com wss://api.x.ai; img-src 'self' data:; media-src 'self' blob: mediastream:; frame-src 'self' https://js.stripe.com; frame-ancestors 'self'";
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.gz': 'application/gzip', '.woff2': 'font/woff2', '.txt': 'text/plain' };
export const requests = [];

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
        if (!json?.companion?.context?.paragraphs || !json?.messages?.length) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end('{"error":"Invalid request"}'); return }
        const last = json.messages.at(-1).content;
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
    if (url.pathname === '/__requests') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(requests)); return }
    let file = null;
    if (url.pathname.startsWith('/lab/addbook/')) file = join(DIST, normalize(decodeURIComponent(url.pathname.slice('/lab/addbook/'.length) || 'index.html')));
    else if (url.pathname === '/lab/addbook') { res.writeHead(301, { Location: '/lab/addbook/' }); res.end(); return }
    else if (url.pathname.startsWith('/fonts/')) file = join(FONTS, normalize(decodeURIComponent(url.pathname.slice(7))));
    if (file && existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!file || !existsSync(file) || (!file.startsWith(DIST) && !file.startsWith(FONTS))) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
    res.end(readFileSync(file));
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || 4720);
  start(port).then(() => console.log(`http://127.0.0.1:${port}/lab/addbook/`));
}
