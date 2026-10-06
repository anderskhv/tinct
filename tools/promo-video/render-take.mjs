// Renders a device screen recording onto the 3D phone as ONE continuous shot:
// the recording plays at real speed (its audio stays in sync), the camera follows
// a single smooth spline through take.json's keyframes, and the end pulls back
// into the end card. No cuts.
//
//   node render-take.mjs --video path/to/ScreenRecording.mov
//   node render-take.mjs --preview          # 540x675 @ 30 fps for a quick look
//
// Frames are extracted once to out/take/frames (60 fps, upscaled to 1170 px wide).
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { launch, serve, ROOT, OUT } from './lib.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const preview = argv.includes('--preview');
const [W, H] = arg('--size', preview ? '540x676' : '1080x1350').split('x').map(Number);
const FPS = Number(arg('--fps', preview ? 30 : 60));
const SS = Number(arg('--ss', preview ? 1 : 1.5));
const WORKERS = Number(arg('--workers', 2));
const take = JSON.parse(fs.readFileSync(path.join(ROOT, arg('--take', 'take.json')), 'utf8'));
const DIR = path.join(OUT, take.dir || 'take'); // working folder for this take's source + frames
const out = path.resolve(arg('--out', path.join(OUT, preview ? 'tinct-take-preview.mp4' : `tinct-take-${W}x${H}.mp4`)));

// ---- source frames (60 fps, constant rate) ----
const video = arg('--video', take.video && path.resolve(ROOT, take.video));
const SRC = path.join(DIR, fs.existsSync(path.join(DIR, 'source.mp4')) ? 'source.mp4' : 'source.mov');
fs.mkdirSync(path.join(DIR, 'frames'), { recursive: true });
if (video && path.resolve(video) !== SRC) fs.copyFileSync(video, SRC);
if (!fs.readdirSync(path.join(DIR, 'frames')).length) {
  console.log('Extracting frames…');
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', SRC, '-vf', 'fps=60,scale=1170:-2:flags=lanczos,unsharp=5:5:0.5:5:5:0',
    '-q:v', '2', path.join(DIR, 'frames/f%05d.jpg')], { stdio: 'inherit' });
  if (r.status) process.exit(r.status);
}
const srcCount = fs.readdirSync(path.join(DIR, 'frames')).filter((f) => f.endsWith('.jpg')).length;
const srcDur = srcCount / 60;
const srcFrame = (s) => `/out/${take.dir || 'take'}/frames/f${String(Math.min(srcCount, Math.max(1, Math.round(s * 60) + 1))).padStart(5, '0')}.jpg`;

// ---- timeline ----
const total = srcDur + take.endHold;
const frameCount = Math.round(total * FPS);
const smooth = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

// Camera: cubic Hermite through keyframes with Catmull-Rom tangents (time-aware), so
// velocity is continuous everywhere and only the first and last keys come to rest.
// fov: lens (smaller = longer lens), shift: vertical framing offset, dof: lens blur
// strength (0 = none), fz: focus point along the phone (defaults to the look-at point).
const DEFAULTS = { lx: 0, lz: 0, fov: 30, shift: 0.045, dof: 0 };
const keys = take.camera.map((k) => ({ ...DEFAULTS, fz: k.lz ?? 0, ...k, t: k.t === 'end' ? total : k.t }));
const PARAMS = ['az', 'el', 'd', 'lx', 'lz', 'fov', 'shift', 'dof', 'fz'];
function camAt(t) {
  t = Math.max(keys[0].t, Math.min(keys.at(-1).t, t));
  let i = keys.findIndex((k, j) => j < keys.length - 1 && t <= keys[j + 1].t);
  if (i < 0) i = keys.length - 2;
  const a = keys[i], b = keys[i + 1], dt = b.t - a.t, u = (t - a.t) / dt;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  const tangent = (j, p) => (j === 0 || j === keys.length - 1) ? 0
    : (keys[j + 1][p] - keys[j - 1][p]) / (keys[j + 1].t - keys[j - 1].t);
  const cam = {};
  for (const p of PARAMS) cam[p] = h00 * a[p] + h10 * dt * tangent(i, p) + h01 * b[p] + h11 * dt * tangent(i + 1, p);
  return cam;
}

function frameParams(i) {
  const t = i / FPS;
  const s = Math.min(t, srcDur - 1 / 60);
  // Blank moments in the recording (page loads) dissolve from the last good frame to the next.
  const blank = take.dissolve.find(([a, b]) => s > a && s < b);
  const screen = blank ? { screenSrc: srcFrame(blank[0]), screenSrcB: srcFrame(blank[1]), mix: smooth((s - blank[0]) / (blank[1] - blank[0])) }
    : { screenSrc: srcFrame(s) };
  const cap = take.captions.find((c) => t >= c.from && t <= c.to);
  return {
    ...screen,
    cam: camAt(t),
    caption: cap?.text || '',
    captionOpacity: cap ? Math.min(smooth((t - cap.from) / 0.5), smooth((cap.to - t) / 0.5)) : 0,
    endcard: smooth((t - take.endcard.from) / (take.endcard.to - take.endcard.from)),
  };
}
console.log(`One take: ${total.toFixed(1)}s, ${frameCount} frames at ${W}x${H}@${FPS} (supersample ${SS}x)`);

// ---- render ----
const { server, url } = await serve();
const browser = await launch();
const tmp = path.join(OUT, 'segments');
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
const per = Math.ceil(frameCount / WORKERS);
let done = 0;
const t0 = Date.now();
async function worker(w) {
  const a = w * per, b = Math.min(frameCount, a + per);
  if (a >= b) return null;
  const seg = path.join(tmp, `seg-${w}.mp4`);
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => console.error('[stage]', e.message));
  await page.goto(`${url}/stage.html?ss=${SS}`);
  await page.evaluate(() => window.stageReady);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a; i < b; i++) {
    await page.evaluate((p) => window.renderFrame(p), frameParams(i));
    const jpg = await page.screenshot({ type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
    if (++done % 60 === 0) {
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`\r${done}/${frameCount} frames  ${el.toFixed(0)}s elapsed, ~${((frameCount - done) * el / done).toFixed(0)}s left   `);
    }
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await page.close();
  return seg;
}
const segs = (await Promise.all(Array.from({ length: WORKERS }, (_, w) => worker(w)))).filter(Boolean);
await browser.close();
server.close();

// Join the segments and, unless disabled, lay the recording's own audio underneath.
const list = path.join(tmp, 'list.txt');
fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
// "audio": false in the take leaves the soundtrack out.
const audio = take.audio === false ? ['-an'] : ['-i', SRC, '-map', '0:v', '-map', '1:a?', '-c:a', 'aac', '-b:a', '160k',
  '-af', `apad,afade=t=out:st=${(total - 1.5).toFixed(2)}:d=1.5`];
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, ...audio,
  '-c:v', 'copy', '-t', total.toFixed(3), '-movflags', '+faststart', out], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
console.log(`\nWrote ${out}`);
