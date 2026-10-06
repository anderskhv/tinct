// Renders out/recording (from record.mjs) onto the 3D phone in stage.html,
// following edit.json, and encodes an MP4 with ffmpeg.
//
//   node render.mjs                     # 1080x1350, 30 fps -> out/tinct-promo.mp4
//   node render.mjs --size 1080x1920    # 9:16 for Reels/Shorts/TikTok
//   node render.mjs --preview           # 540x675 @ 15 fps, quick check
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { launch, serve, ROOT, OUT } from './lib.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const preview = argv.includes('--preview');
const [W, H] = (arg('--size', preview ? '540x675' : '1080x1350')).split('x').map(Number);
const FPS = Number(arg('--fps', preview ? 15 : 30));
const WORKERS = Number(arg('--workers', 3));
const out = path.resolve(arg('--out', path.join(OUT, preview ? 'tinct-promo-preview.mp4' : `tinct-promo-${W}x${H}.mp4`)));

const REC = path.join(OUT, 'recording');
const manifest = JSON.parse(fs.readFileSync(path.join(REC, 'manifest.json'), 'utf8'));
const edit = JSON.parse(fs.readFileSync(path.join(ROOT, arg('--edit', 'edit.json')), 'utf8'));

// ---- resolve the edit into clips with absolute source times ----
const marker = (v) => {
  if (typeof v === 'number') return v;
  const [name, off] = String(v).split(/(?=[+-]\d)/);
  const m = manifest.markers.find((x) => x.name === name);
  if (!m) throw new Error(`edit.json references unknown marker "${name}" (have: ${manifest.markers.map((x) => x.name).join(', ')})`);
  return m.t + Number(off || 0);
};
let cursor = 0;
const clips = edit.clips.map((c) => {
  const srcIn = marker(c.from), srcOut = c.to != null ? marker(c.to) : srcIn;
  const dur = c.duration ?? (srcOut - srcIn) / (c.speed ?? 1);
  const clip = { ...c, srcIn, srcOut, dur, start: cursor };
  cursor += dur;
  return clip;
});
const total = cursor;
const frameCount = Math.round(total * FPS);
console.log(`${clips.length} clips, ${total.toFixed(1)}s, ${frameCount} frames at ${W}x${H}@${FPS}`);

const frames = manifest.frames; // sorted by t
function frameAt(t) {
  let lo = 0, hi = frames.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (frames[mid].t <= t) lo = mid; else hi = mid - 1; }
  return frames[lo].file;
}
const fade = (x, a, b) => Math.max(0, Math.min(1, (x - a) / (b - a)));

function frameParams(i) {
  const t = i / FPS;
  const clip = clips.find((c) => t < c.start + c.dur) || clips[clips.length - 1];
  const local = Math.min(1, (t - clip.start) / clip.dur);
  const src = clip.srcIn + (clip.srcOut - clip.srcIn) * local;
  const lt = t - clip.start;
  const capOpacity = clip.caption ? Math.min(fade(lt, 0.25, 0.7), 1 - fade(lt, clip.dur - 0.5, clip.dur - 0.1)) : 0;
  return {
    screenSrc: '/out/recording/' + frameAt(src),
    shot: clip.shot,
    p: local,
    caption: clip.caption || '',
    captionOpacity: capOpacity,
    endcard: clip.endcard ? fade(lt, clip.dur * 0.3, clip.dur * 0.55) : 0,
  };
}

// ---- render in parallel slices, each piped into its own ffmpeg ----
const { server, url } = await serve();
const browser = await launch();
const tmp = path.join(OUT, 'segments');
fs.mkdirSync(tmp, { recursive: true });
const per = Math.ceil(frameCount / WORKERS);
let done = 0;
const t0 = Date.now();

async function worker(w) {
  const a = w * per, b = Math.min(frameCount, a + per);
  const seg = path.join(tmp, `seg-${w}.mp4`);
  if (a >= b) return null;
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => console.error('[stage]', e.message));
  await page.goto(`${url}/stage.html`);
  await page.evaluate(() => window.stageReady);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a; i < b; i++) {
    await page.evaluate((p) => window.renderFrame(p), frameParams(i));
    const png = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
    done++;
    if (done % 30 === 0) {
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

const list = path.join(tmp, 'list.txt');
fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
await new Promise((res, rej) => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out], { stdio: 'inherit' })
  .on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg concat failed')))));
console.log(`\nWrote ${out}`);
