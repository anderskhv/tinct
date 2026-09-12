// Bakes the three lit device screens of the about page's reveal ("Introducing Tinct") into flat,
// transparent image layers: assets/about-v20/assets/screen-{desktop,eink,phone}-v1.webp.
//
// The story used to project each screen live onto the device photo with a CSS matrix3d. Chromium
// draws that correctly; some mobile browsers do not, and the phone screen drifted off the phone.
// Rendering the projection once, here, and shipping the result as pixels removes that dependency.
//
// Run from app/:  node scripts/render-about-reveal-screens.mjs [preview.png]
// Needs @playwright/test (already a dev dependency) and Chromium. Re-run after changing the
// library capture, the page capture, or the Talk screen below, then commit the three layers.
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const assets = join(publicDir, 'assets/about-v20/assets');
const preview = process.argv[2] || null;

// Screen corners inside devices-transparent-v10.webp (1536 x 1024), plus each screen's corner radius in its own pixels.
const SCREENS = [
  { kind: 'desktop', width: 1000, height: 620, corners: [[695, 68], [1442, 77], [1396, 555], [642, 489]], radius: 6, bg: '#091722' },
  { kind: 'eink', width: 360, height: 620, corners: [[140, 270], [466, 243], [549, 746], [223, 824]], radius: 8, bg: '#d8d6d0' },
  { kind: 'phone', width: 390, height: 780, corners: [[1261, 481], [1483, 497], [1361, 954], [1110, 904]], radius: 40, bg: '#ece7db' },
];

// Homography from a w x h rectangle to four corners, as a CSS matrix3d (same maths as the story chunk).
function matrix3d(w, h, corners) {
  const src = [[0, 0], [w, 0], [w, h], [0, h]];
  const rows = [];
  src.forEach(([x, y], i) => {
    const [X, Y] = corners[i];
    rows.push([x, y, 1, 0, 0, 0, -X * x, -X * y, X]);
    rows.push([0, 0, 0, x, y, 1, -Y * x, -Y * y, Y]);
  });
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(rows[r][c]) > Math.abs(rows[p][c])) p = r;
    [rows[c], rows[p]] = [rows[p], rows[c]];
    const d = rows[c][c];
    if (Math.abs(d) < 1e-10) throw new Error('Degenerate screen corners');
    rows[c] = rows[c].map(v => v / d);
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const f = rows[r][c];
      rows[r] = rows[r].map((v, k) => v - f * rows[c][k]);
    }
  }
  const [a, b, c, d, e, f, g, h2] = rows.map(r => r[8]);
  return `matrix3d(${[a, d, 0, g, b, e, 0, h2, 0, 0, 1, 0, c, f, 0, 1].join(',')})`;
}

const MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="#0b0b0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path></svg>';
const CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="#0b0b0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.7-4.6A8 8 0 1 1 21 12z"></path></svg>';
const END = '<svg viewBox="0 0 24 24" fill="none" stroke="#ece7db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>';

// The e-reader's page: the opening of Moby-Dick, chapter 1, word for word from
// public/data/editions/moby-dick-original-en.json, cut at the sentence that ends the first page.
// A chapter's first page has no page-furniture to invent and no stage directions to strand at the
// foot of the screen, and at this measure the sentences break without gaps.
const EINK = `<div class="eink">
  <div class="chrome">
    <div class="book">Moby-Dick</div>
    <div class="chapter"><span>Chapter 1 — Loomings</span><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></div>
  </div>
  <p>Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.</p>
</div>`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="http://tinct.local/fonts/tinct-fonts.css">
<style>
  html,body{margin:0;background:transparent}
  .stage{position:relative;width:1536px;height:1024px;overflow:hidden}
  .stage>img.base{position:absolute;inset:0;width:1536px;height:1024px;display:block}
  /* Each layer's ground is its own screen colour, not black: the rounded edge is antialiased
     against it, and a black ground drew a dark hairline around every lit screen. */
  .layer{position:absolute;top:0;left:0;transform-origin:0 0;overflow:hidden}
  .layer img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
  /* The Talk screen, matching the voice beat's panel: globe, status word, quote, three small controls. */
  .talk{width:100%;height:100%;box-sizing:border-box;padding:118px 30px 44px;background:#ece7db;color:#0b0b0b;display:flex;flex-direction:column;align-items:center;text-align:center;font-family:'EB Garamond',TinctSerif,Georgia,serif;position:relative}
  .talk::before{content:"Hamlet, Act I, Scene IV";position:absolute;top:40px;left:28px;font:italic 17px/1.2 'EB Garamond',TinctSerif,Georgia,serif;color:#6a6256}
  .talk::after{content:"● Connected";position:absolute;top:40px;right:28px;font:17px/1.2 'EB Garamond',TinctSerif,Georgia,serif;color:#6a6256}
  .talk canvas{width:250px;height:250px;display:block}
  .talk .word{margin:30px 0 8px;font:400 40px/1.1 'Playfair Display',TinctSerif,Georgia,serif;letter-spacing:-.01em}
  .talk .quote{margin:0;max-width:300px;color:#6a6256;font:italic 19px/1.4 'EB Garamond',TinctSerif,Georgia,serif}
  .talk .controls{margin-top:auto;display:flex;gap:26px}
  .talk .controls span{display:flex;flex-direction:column;align-items:center;gap:8px;color:#6a6256;font-size:15px}
  .talk .controls i{width:42px;height:42px;border-radius:50%;border:1px solid #c8c0ae;box-sizing:border-box;display:grid;place-items:center;font-style:normal}
  .talk .controls i svg{width:17px;height:17px}
  .talk .controls .end i{background:#0b0b0b;border-color:#0b0b0b}
  /* The e-reader page. Drawn at the layer's own size, so nothing is cropped, and in e-ink's
     greys rather than the app's paper-and-ink: no backlight, no true black, low contrast. */
  .eink{width:100%;height:100%;box-sizing:border-box;padding:26px 26px 30px;background:#d8d6d0;color:#46443f;display:flex;flex-direction:column;font-family:'EB Garamond',TinctSerif,Georgia,serif}
  .eink .chrome{display:flex;align-items:center;gap:12px;margin-bottom:26px}
  .eink .book{font:600 20px/1 'Playfair Display',TinctSerif,Georgia,serif;color:#3b3935;white-space:nowrap}
  .eink .chapter{flex:1;min-width:0;display:flex;align-items:center;gap:8px;padding:7px 14px;border:1px solid #bbb8b1;border-radius:999px;color:#7d7a74;font:italic 16px/1 'EB Garamond',TinctSerif,Georgia,serif}
  .eink .chapter span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .eink .chapter svg{width:11px;height:11px;flex:none;stroke:#9a978f;fill:none;stroke-width:1.6}
  /* Ragged right: justification at this measure opens rivers between the words. */
  .eink p{margin:0;text-align:left;hyphens:none;font-size:29px;line-height:1.5;letter-spacing:.004em}
  .eink p+p{margin-top:.7em;text-indent:1.1em}
</style></head><body>
<div class="stage">
  <img class="base" src="http://tinct.local/assets/about-v20/assets/devices-transparent-v10.webp" alt="">
  ${SCREENS.map(s => `<div class="layer" data-kind="${s.kind}" style="width:${s.width}px;height:${s.height}px;border-radius:${s.radius}px;background:${s.bg};transform:${matrix3d(s.width, s.height, s.corners)}">${
    s.kind === 'desktop' ? '<img src="http://tinct.local/assets/about-v20/assets/library-desktop-v1.webp" alt="">'
    : s.kind === 'eink' ? EINK
    : `<div class="talk"><canvas width="500" height="500"></canvas><p class="word">Speaking.</p><p class="quote">“More honoured in the breach than the observance…”</p><div class="controls"><span><i>${MIC}</i>Mute</span><span><i>${CHAT}</i>Transcript</span><span class="end"><i>${END}</i>End</span></div></div>`
  }</div>`).join('')}
</div>
<script>
  // One still of the Talk globe (the page draws it live elsewhere): 420 ink dots on a tilted sphere, mid-word.
  (function () {
    var cv = document.querySelector('.talk canvas'), ctx = cv.getContext('2d'), w = 250, h = 250, dpr = 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var pts = [], n = 420, g = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) { var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i; pts.push([Math.cos(th) * r, y, Math.sin(th) * r]); }
    var t = 2.3, cx = w / 2, cy = h / 2, level = 0.5 + 0.5 * Math.sin(t * 5.1) * Math.sin(t * 1.7), R = Math.min(w, h) * 0.42 * (1 + level * 0.12);
    var rotY = t * 0.22, tilt = 0.35;
    ctx.fillStyle = '#0b0b0b';
    for (var j = 0; j < pts.length; j++) {
      var x = pts[j][0], yy = pts[j][1], z = pts[j][2];
      var x1 = x * Math.cos(rotY) + z * Math.sin(rotY), z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
      var y2 = yy * Math.cos(tilt) - z1 * Math.sin(tilt), z2 = yy * Math.sin(tilt) + z1 * Math.cos(tilt);
      var depth = z2 * 0.5 + 0.5;
      ctx.globalAlpha = Math.min(1, 0.18 + depth * 0.82);
      var s = 1.35 * (0.55 + depth * 0.9) * (1 + level * 0.3) * (w / 280);
      ctx.beginPath(); ctx.arc(cx + x1 * R, cy + y2 * R, s, 0, Math.PI * 2); ctx.fill();
    }
  })();
</script></body></html>`;

// The phone leans over the laptop screen's bottom right corner. The laptop's layer is a flat
// rectangle projected onto the whole screen, and every device frame lives in the photo *under* the
// screen layers, so without this the library screen paints across the phone's top left corner and
// the corner reads as missing. Cut the phone's body out of the laptop's layer: its screen corners,
// grown past the black frame (a couple of px of overshoot only exposes the photo's own screen fill,
// which is now the same navy, while any undershoot would leave a bright sliver on the frame).
const PHONE_BODY = outset(SCREENS[2].corners, 9);

// Move every vertex of a convex polygon m px along its outward angle bisector.
function outset(points, m) {
  return points.map(([x, y], i) => {
    const [px, py] = points[(i - 1 + points.length) % points.length];
    const [nx, ny] = points[(i + 1) % points.length];
    const u = norm(px - x, py - y), v = norm(nx - x, ny - y);
    const b = norm(u[0] + v[0], u[1] + v[1]);
    const half = Math.max(Math.hypot(u[0] + v[0], u[1] + v[1]) / 2, 0.2); // sin of half the interior angle
    return [x - b[0] * m / half, y - b[1] * m / half];
  });
}
function norm(x, y) { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; }

const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf' };

// CHROMIUM_PATH points at a Chromium binary when Playwright's own download is not available.
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const context = await browser.newContext({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
await context.route('**/*', route => {
  const p = new URL(route.request().url()).pathname;
  const file = join(publicDir, p);
  if (!existsSync(file) || statSync(file).isDirectory()) return route.fulfill({ status: 404, body: 'missing ' + p });
  route.fulfill({ status: 200, body: readFileSync(file), headers: { 'content-type': types[extname(p).slice(1)] || 'application/octet-stream' } });
});
const page = await context.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);

const stage = page.locator('.stage');
for (const s of SCREENS) {
  await page.evaluate(kind => {
    document.querySelector('.stage>img.base').style.visibility = 'hidden';
    document.querySelectorAll('.layer').forEach(l => { l.style.visibility = l.dataset.kind === kind ? 'visible' : 'hidden'; });
  }, s.kind);
  const png = await stage.screenshot({ omitBackground: true, type: 'png' });
  // Chromium encodes WebP with alpha; the layer is mostly transparent so it stays small.
  const dataUrl = await page.evaluate(async ({ b64, cut, radius }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    if (cut) {
      // A rounded path through the cut polygon: start at an edge midpoint, corner by corner.
      g.beginPath();
      const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      g.moveTo(...mid(cut[0], cut[1]));
      for (let i = 1; i <= cut.length; i++) {
        const b = cut[i % cut.length], n = cut[(i + 1) % cut.length];
        g.arcTo(b[0], b[1], ...mid(b, n), radius);
      }
      g.closePath();
      g.globalCompositeOperation = 'destination-out';
      g.fill();
    }
    return c.toDataURL('image/webp', 0.9);
  }, { b64: png.toString('base64'), cut: s.kind === 'desktop' ? PHONE_BODY : null, radius: 32 });
  const out = join(assets, `screen-${s.kind}-v1.webp`);
  const bytes = Buffer.from(dataUrl.split(',')[1], 'base64');
  writeFileSync(out, bytes);
  console.log(`wrote assets/about-v20/assets/screen-${s.kind}-v1.webp (${Math.round(bytes.length / 1024)} KB)`);
}
if (preview) {
  await page.evaluate(() => {
    document.querySelector('.stage>img.base').style.visibility = 'visible';
    document.querySelectorAll('.layer').forEach(l => { l.style.visibility = 'visible'; });
  });
  await stage.screenshot({ path: preview });
  console.log('preview: ' + preview);
}
await browser.close();
