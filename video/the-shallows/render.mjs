// Render THE SHALLOWS frame-by-frame: node render.mjs [--stills 0,5,12] [--fps 30] [--out file.mp4]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.resolve(HERE, '../../app/public');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || 'playwright');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const FPS = +(opt('--fps') || 30), DUR = 48;
const stills = opt('--stills');
const OUT = opt('--out') || path.join(HERE, 'out/frames.mp4');
fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  let f;
  if (u === '/' || u === '/film.html') f = path.join(HERE, 'film.html');
  else if (u.startsWith('/fonts/')) f = path.join(PUB, u);
  else if (u.startsWith('/app-assets/')) f = path.join(PUB, 'assets', u.slice('/app-assets/'.length));
  if (!f || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;

const covers = fs.readdirSync(path.join(PUB, 'assets/about-v20/assets/collection')).filter(f => f.endsWith('.jpg')).sort();
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => { console.error('[pageerror]', e.message); process.exit(1); });
await page.addInitScript(c => { window.COVERS = c; }, covers);
await page.goto(`http://127.0.0.1:${port}/film.html`, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  const fams = ["500 92px 'Playfair Display'", "italic 500 92px 'Playfair Display'", "700 92px 'Playfair Display'", "600 92px 'Playfair Display'", "italic 400 60px 'EB Garamond'", "400 25px 'EB Garamond'", "400 20px 'IBM Plex Mono'", "600 20px 'IBM Plex Mono'", "600 30px 'IBM Plex Sans'", "700 30px 'IBM Plex Sans'", "400 20px 'IBM Plex Sans'"];
  await Promise.all(fams.map(f => document.fonts.load(f, 'AaZz’—300 ↓')));
  await document.fonts.ready;
  const urls = new Set();
  document.querySelectorAll('[style*="background-image"]').forEach(el => { const m = el.style.backgroundImage.match(/url\("?([^")]+)"?\)/); if (m) urls.add(m[1]); });
  await Promise.all([...urls].map(u => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = u; })));
});

async function frameAt(t, i) { await page.evaluate(([t, i]) => window.seek(t, i), [t, i]); return page.screenshot({ type: 'jpeg', quality: 93 }); }

if (stills) {
  for (const s of stills.split(',')) {
    const t = +s; const buf = await frameAt(t, Math.round(t * FPS));
    fs.writeFileSync(path.join(HERE, `out/still-${t.toFixed(2)}.jpg`), buf);
    console.log('still', t);
  }
} else {
  const N = Math.round(DUR * FPS);
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const buf = await frameAt(i / FPS, i);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', OUT);
}
await browser.close(); server.close();
