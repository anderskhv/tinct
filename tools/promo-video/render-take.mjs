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
import crypto from 'node:crypto';
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
// --from 38 --to 48: render only that slice of the timeline (quick iteration samples).
const SLICE = [Math.round(Number(arg('--from', 0)) * FPS), Math.min(frameCount, Math.round(Number(arg('--to', total)) * FPS))];
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

// ---- touch indicators ----
// taps: {t: touch-down time, x, y} in recording px (1180 wide). swipes: {from, to, x, y}:
// the finger follows the content's measured scroll (scroll.json, from scroll.py)
// between touch-down and lift-off.
const SCALE = 1170 / 1180;
const scrollPath = path.join(DIR, 'scroll.json');
const scroll = fs.existsSync(scrollPath) ? JSON.parse(fs.readFileSync(scrollPath, 'utf8')) : [];
const scrolled = (a, b) => { let d = 0; for (let i = Math.round(a * 30); i < Math.round(b * 30); i++) d += scroll[i] || 0; return d; };
const HOVER = 0.14, PRESS = 0.16, LIFT = 0.38;
function touchesAt(s) {
  const out = [];
  for (const { t, x, y } of take.touches?.taps || []) {
    const u = s - (t - HOVER);
    if (u < 0 || u > HOVER + PRESS + LIFT) continue;
    const a = Math.min(smooth(u / HOVER), 1 - smooth((u - HOVER - PRESS) / LIFT));
    const p = smooth(u / HOVER), r = Math.max(0, (u - HOVER - PRESS) / LIFT);
    out.push({ x: x * SCALE, y: y * SCALE, a, p, r: Math.min(1, r) });
  }
  for (const { from, to, x, y } of take.touches?.swipes || []) {
    const u = s - (from - HOVER);
    if (u < 0 || s > to + LIFT) continue;
    const dy = scrolled(from, Math.min(s, to));
    const a = Math.min(smooth(u / HOVER), 1 - smooth((s - to) / LIFT));
    out.push({ x: x * SCALE, y: (y - dy) * SCALE, a, p: smooth(u / HOVER), r: s > to ? Math.min(1, (s - to) / LIFT) : 0 });
  }
  return out;
}

function frameParams(i) {
  const t = i / FPS;
  const s = Math.min(t, srcDur - 1 / 60);
  // Blank moments in the recording (page loads) dissolve from the last good frame to the next.
  const blank = take.dissolve.find(([a, b]) => s > a && s < b);
  const screen = blank ? { screenSrc: srcFrame(blank[0]), screenSrcB: srcFrame(blank[1]), mix: smooth((s - blank[0]) / (blank[1] - blank[0])) }
    : { screenSrc: srcFrame(s) };
  const cap = (take.captions || []).find((c) => t >= c.from && t <= c.to);
  return {
    ...screen,
    touches: touchesAt(s),
    cam: camAt(t),
    caption: cap?.text || '',
    captionOpacity: cap ? Math.min(smooth((t - cap.from) / 0.5), smooth((cap.to - t) / 0.5)) : 0,
    endcard: take.endcard ? smooth((t - take.endcard.from) / (take.endcard.to - take.endcard.from)) : 0,
  };
}
console.log(`One take: ${total.toFixed(1)}s, ${frameCount} frames at ${W}x${H}@${FPS} (supersample ${SS}x)`);

// --stills 12.5,40 renders just those moments (seconds) to out/stills/ for a quick look.
if (arg('--stills')) {
  const { server, url } = await serve();
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => console.error('[stage]', e.message));
  await page.goto(`${url}/stage.html?ss=${SS}`);
  await page.evaluate(() => window.stageReady);
  if (take.phone) await page.evaluate((p) => window.setPose(p), take.phone);
  fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
  for (const t of arg('--stills').split(',').map(Number)) {
    await page.evaluate((p) => window.renderFrame(p), frameParams(Math.round(t * FPS)));
    await page.screenshot({ path: path.join(OUT, 'stills', `t${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 92 });
  }
  await browser.close();
  server.close();
  console.log('Wrote stills to', path.join(OUT, 'stills'));
  process.exit(0);
}

// ---- render ----
// Frames are rendered in short chunks, each its own finished MP4. A chunk is cached
// under a hash of exactly what it shows (stage, size, pose and every frame's
// parameters), so an interrupted run resumes, and an edit re-renders only the
// chunks it actually changes.
const CHUNK = 240; // frames
const stageHash = crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, 'stage.html'))).digest('hex');
const chunks = Array.from({ length: Math.ceil(frameCount / CHUNK) }, (_, c) => c)
  .filter((c) => (c + 1) * CHUNK > SLICE[0] && c * CHUNK < SLICE[1]);
const chunkKey = (c) => {
  const h = crypto.createHash('sha1').update(stageHash).update(`${W}x${H}@${FPS}ss${SS}`).update(JSON.stringify(take.phone || {}));
  for (let i = c * CHUNK; i < Math.min(frameCount, (c + 1) * CHUNK); i++) h.update(JSON.stringify(frameParams(i)));
  return h.digest('hex').slice(0, 16);
};
const tmp = path.join(OUT, 'chunks', 'by-content');
fs.mkdirSync(tmp, { recursive: true });
const chunkKeys = Object.fromEntries(chunks.map((c) => [c, chunkKey(c)]));
const chunkPath = (c) => path.join(tmp, `${chunkKeys[c]}.mp4`);
// --adopt DIR: take over chunks rendered by an older version (cNNNN.mp4) for this exact take.
if (arg('--adopt')) for (const c of chunks) {
  const old = path.join(arg('--adopt'), `c${String(c).padStart(4, '0')}.mp4`);
  if (fs.existsSync(old) && !fs.existsSync(chunkPath(c))) fs.renameSync(old, chunkPath(c));
}
const todo = chunks.filter((c) => !fs.existsSync(chunkPath(c)));
console.log(`${chunks.length - todo.length}/${chunks.length} chunks already rendered (${path.relative(ROOT, tmp)})`);
const { server, url } = await serve();
const browser = await launch();
const total0 = todo.reduce((n, c) => n + Math.min(CHUNK, frameCount - c * CHUNK), 0);
let done = 0;
const t0 = Date.now();
async function worker() {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => console.error('[stage]', e.message));
  await page.goto(`${url}/stage.html?ss=${SS}`);
  await page.evaluate(() => window.stageReady);
  if (take.phone) await page.evaluate((p) => window.setPose(p), take.phone);
  for (let c; (c = todo.shift()) !== undefined;) {
    const part = chunkPath(c) + '.part.mp4';
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', part], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = c * CHUNK; i < Math.min(frameCount, (c + 1) * CHUNK); i++) {
      await page.evaluate((p) => window.renderFrame(p), frameParams(i));
      const jpg = await page.screenshot({ type: 'jpeg', quality: 96 });
      if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
      if (++done % 60 === 0) {
        const el = (Date.now() - t0) / 1000;
        process.stdout.write(`\r${done}/${total0} frames  ${el.toFixed(0)}s elapsed, ~${((total0 - done) * el / done).toFixed(0)}s left   `);
      }
    }
    ff.stdin.end();
    const code = await new Promise((r) => ff.on('close', r));
    if (code !== 0) throw new Error(`ffmpeg failed on chunk ${c}`);
    fs.renameSync(part, chunkPath(c));
  }
  await page.close();
}
await Promise.all(Array.from({ length: WORKERS }, () => worker()));
await browser.close();
server.close();
const segs = chunks.map(chunkPath);

// Join the segments and, unless disabled, lay the recording's own audio underneath.
const list = path.join(tmp, 'list.txt');
fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
// "audio": false in the take leaves the soundtrack out.
const audio = take.audio === false ? ['-an'] : ['-i', SRC, '-map', '0:v', '-map', '1:a?', '-c:a', 'aac', '-b:a', '160k',
  '-af', `apad,afade=t=out:st=${(total - 1.5).toFixed(2)}:d=1.5`];
const sliced = SLICE[0] > 0 || SLICE[1] < frameCount;
const r = sliced
  // A slice is cut frame-exactly from its chunks (re-encoded; samples are short).
  ? spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-an',
    '-ss', ((SLICE[0] - chunks[0] * CHUNK) / FPS).toFixed(4), '-t', ((SLICE[1] - SLICE[0]) / FPS).toFixed(4),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: 'inherit' })
  : spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, ...audio,
    '-c:v', 'copy', '-t', total.toFixed(3), '-movflags', '+faststart', out], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
console.log(`\nWrote ${out}`);
