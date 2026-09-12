// Drives the real worker module against the real dist/ as its ASSETS binding,
// so /mission and /about are checked by request, not by reading the source.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = '/home/user/tinct/.claude/worktrees/agent-ad133867ad345be02/app/dist';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain' };

const ASSETS = {
  async fetch(request) {
    const url = new URL(request.url);
    let p = join(DIST, decodeURIComponent(url.pathname));
    // Cloudflare assets html_handling: /x serves x.html, /x.html canonicalises to /x.
    if (p.endsWith('.html') && existsSync(p)) {
      return new Response(null, { status: 307, headers: { Location: url.pathname.replace(/\.html$/, '') } });
    }
    if (!existsSync(p) && existsSync(p + '.html')) p = p + '.html';
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
    if (!existsSync(p)) return new Response('not found', { status: 404 });
    return new Response(readFileSync(p), { status: 200, headers: { 'Content-Type': types[extname(p)] || 'application/octet-stream' } });
  },
};

const worker = (await import('/home/user/tinct/.claude/worktrees/agent-ad133867ad345be02/app/src/worker.ts')).default;
const ctx = { waitUntil() {}, passThroughOnException() {} };
const env = { ASSETS };

for (const path of ['/mission', '/mission/', '/about', '/about/', '/about.html', '/privacy', '/privacy-policy']) {
  const resp = await worker.fetch(new Request('https://tinct.app' + path), env, ctx);
  const body = resp.status === 200 ? await resp.text() : '';
  console.log(
    path.padEnd(16),
    resp.status,
    (resp.headers.get('Location') || '').padEnd(28),
    resp.status === 200 ? `${body.length} bytes, story-root: ${body.includes('story-root')}, canonical: ${(body.match(/rel="canonical" href="([^"]+)"/) || [])[1] || '-'}` : '',
  );
}
