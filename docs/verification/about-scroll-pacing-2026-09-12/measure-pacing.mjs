// How fast the About story's reveal moves under a hard flick, and how long each
// beat stays legible.  node measure-pacing.mjs <label> <outdir> [port]
//
// Two flick models, because neither alone is honest:
//  - "touch": Chromium's own fling via CDP Input.synthesizeScrollGesture with a
//    touch source and a high speed, so the browser's real momentum curve runs.
//  - "script": a modelled iOS fling (v0 px/s decaying 0.998^ms) driven from rAF,
//    which is reproducible frame for frame.
// Both only move the scroll position; neither touches the story's own listeners.
import { chromium } from '/home/user/tinct/app/node_modules/playwright-core/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const label = process.argv[2] || 'run';
const outDir = process.argv[3] || '/tmp/claude-0/pacing';
const port = process.argv[4] || '4207';
const path = process.argv[5] || '/about';
mkdirSync(outDir, { recursive: true });
const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const RECORDER = () => {
  window.__samples = [];
  const tick = () => {
    const frames = document.querySelectorAll('.journey.scene-frame');
    let best = null;
    for (const f of frames) {
      const r = f.getBoundingClientRect();
      if (r.height > 0 && r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5) best = f;
    }
    // The scroll-derived target the story would have rendered with no follower:
    // the read line sits at 12% of the viewport on phones (Va in the chunk).
    let target = null;
    if (best) {
      const step = document.getElementById('chapter-' + best.getAttribute('data-scene'));
      if (step) {
        const r = step.getBoundingClientRect();
        target = Math.max(0, Math.min(1, (window.innerHeight * 0.12 - r.top) / Math.max(1, r.height)));
      }
    }
    const qs = [...document.querySelectorAll('.book-overview-questions p')]
      .map(n => ({ text: (n.textContent || '').trim().slice(0, 40), o: Number(n.style.opacity || 1) }));
    window.__samples.push({
      t: performance.now(),
      y: window.scrollY,
      scene: best ? best.getAttribute('data-scene') : null,
      p: best ? Number(best.style.getPropertyValue('--scene-progress')) : null,
      target,
      qs,
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const browser = await chromium.launch({ executablePath: EXEC });
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  reducedMotion: process.env.RM === 'reduce' ? 'reduce' : 'no-preference',
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await page.addInitScript(RECORDER);
await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: 'load' });
await page.waitForTimeout(1500);

// Park, let snapping and any late layout settle, then take the position the
// browser actually settled on as the start: otherwise the first frame of the
// run records the leftover jump and pollutes the peak.
async function park(y) {
  await page.evaluate(v => window.scrollTo(0, v), y);
  await page.waitForTimeout(1400);
  await page.evaluate(() => { window.__samples.length = 0; });
  return page.evaluate(() => window.scrollY);
}

/** A modelled iOS fling: v0 px/s, decaying 0.998 per ms, run from rAF. */
async function scriptFlick(y, v0) {
  y = await park(y);
  await page.evaluate(async ({ y, v0 }) => {
    let v = v0, pos = y, last = performance.now();
    await new Promise(done => {
      const step = now => {
        const ms = Math.min(48, now - last); last = now;
        pos += v * (ms / 1000);
        v *= Math.pow(0.998, ms);
        window.scrollTo(0, pos);
        if (v > 60) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
  }, { y, v0 });
  await page.waitForTimeout(1800);
  return page.evaluate(() => window.__samples.slice());
}

/** Chromium's own touch fling. speed is px/s handed to the gesture generator. */
async function touchFlick(y, speed) {
  y = await park(y);
  await cdp.send('Input.synthesizeScrollGesture', {
    x: 196, y: 500, xDistance: 0, yDistance: -1400,
    speed, gestureSourceType: 'touch', preventFling: false, repeatCount: 0,
  });
  await page.waitForTimeout(2200);
  return page.evaluate(() => window.__samples.slice());
}

/** A comfortable read-scroll: 900 px/s, constant. Must be unaffected. */
async function slowScroll(y, px) {
  y = await park(y);
  await page.evaluate(async ({ y, px }) => {
    let pos = y, last = performance.now();
    await new Promise(done => {
      const step = now => {
        const ms = Math.min(48, now - last); last = now;
        pos += 900 * (ms / 1000);
        window.scrollTo(0, pos);
        if (pos < y + px) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
  }, { y, px });
  await page.waitForTimeout(1200);
  return page.evaluate(() => window.__samples.slice());
}

const at = async sel => page.evaluate(s => {
  const el = document.querySelector(s);
  return el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY - 150) : 0;
}, sel);

const results = {};
const RUNS = [
  { name: 'fling-from-top', kind: 'script', y: 0, v0: 7000 },
  { name: 'fling-into-linkedin', kind: 'script', sel: '#chapter-ai', v0: 7000 },
  { name: 'fling-into-questions', kind: 'script', sel: '#chapter-difficult', v0: 7000 },
  { name: 'fling-into-reveal', kind: 'script', sel: '#chapter-introducing', v0: 7000 },
  { name: 'touch-fling-into-linkedin', kind: 'touch', sel: '#chapter-ai', speed: 12000 },
  { name: 'touch-fling-into-questions', kind: 'touch', sel: '#chapter-difficult', speed: 12000 },
  { name: 'read-scroll-linkedin', kind: 'slow', sel: '#chapter-ai', px: 2600 },
  { name: 'read-scroll-questions', kind: 'slow', sel: '#chapter-difficult', px: 2600 },
];
for (const run of RUNS) {
  const y = run.sel ? await at(run.sel) : run.y;
  const samples = run.kind === 'touch' ? await touchFlick(y, run.speed)
    : run.kind === 'slow' ? await slowScroll(y, run.px)
    : await scriptFlick(y, run.v0);
  results[run.name] = summarise(samples);
  results[run.name].startY = Math.round(y);
}

// Reachability: a jump to the bottom must still land on the last pixel.
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(1400);
results.reachesEnd = await page.evaluate(() => ({
  y: Math.round(window.scrollY),
  max: Math.round(document.documentElement.scrollHeight - window.innerHeight),
}));

// Keyboard still drives the page.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.keyboard.press('PageDown');
await page.waitForTimeout(900);
results.keyboardPageDown = await page.evaluate(() => Math.round(window.scrollY));
await page.keyboard.press('End');
await page.waitForTimeout(1500);
results.keyboardEnd = await page.evaluate(() => Math.round(window.scrollY));

// Nothing is intercepted: no listener may call preventDefault on wheel/touchmove.
results.noHijack = await page.evaluate(() => {
  const out = {};
  const e1 = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 400 });
  document.documentElement.dispatchEvent(e1);
  out.wheelDefaultPrevented = e1.defaultPrevented;
  const e2 = new Event('touchmove', { bubbles: true, cancelable: true });
  document.documentElement.dispatchEvent(e2);
  out.touchmoveDefaultPrevented = e2.defaultPrevented;
  return out;
});

function summarise(samples) {
  const scenes = {};
  let peakScroll = 0, scrolled = 0;
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1], b = samples[i];
    const dt = (b.t - a.t) / 1000;
    if (dt <= 0) continue;
    peakScroll = Math.max(peakScroll, Math.abs(b.y - a.y) / dt);
    scrolled += Math.abs(b.y - a.y);
    if (b.scene == null) continue;
    const s = scenes[b.scene] ||= { dwellMs: 0, peakRate: 0, maxLag: 0, pMin: 1, pMax: 0 };
    s.dwellMs += b.t - a.t;
    s.pMin = Math.min(s.pMin, b.p);
    s.pMax = Math.max(s.pMax, b.p);
    if (a.scene === b.scene && Number.isFinite(a.p) && Number.isFinite(b.p)) {
      s.peakRate = Math.max(s.peakRate, Math.abs(b.p - a.p) / dt);
    }
    if (a.scene === b.scene && Number.isFinite(b.p) && Number.isFinite(b.target)) {
      s.maxLag = Math.max(s.maxLag || 0, Math.abs(b.target - b.p));
    }
  }
  for (const s of Object.values(scenes)) {
    s.dwellMs = Math.round(s.dwellMs);
    s.peakRate = Number(s.peakRate.toFixed(2));
    s.maxLag = Number((s.maxLag || 0).toFixed(3));
    s.pMin = Number(s.pMin.toFixed(2));
    s.pMax = Number(s.pMax.toFixed(2));
  }
  const questions = {};
  for (let i = 1; i < samples.length; i++) {
    const dt = samples[i].t - samples[i - 1].t;
    for (const q of samples[i].qs) {
      if (!q.text) continue;
      const rec = questions[q.text] ||= { legibleMs: 0, peakOpacity: 0 };
      rec.peakOpacity = Math.max(rec.peakOpacity, q.o);
      if (q.o >= 0.6) rec.legibleMs += dt;
    }
  }
  for (const q of Object.values(questions)) {
    q.legibleMs = Math.round(q.legibleMs);
    q.peakOpacity = Number(q.peakOpacity.toFixed(2));
  }
  return { scenes, questions, peakScrollPxPerSec: Math.round(peakScroll), scrolledPx: Math.round(scrolled) };
}

writeFileSync(`${outDir}/${label}.json`, JSON.stringify(results, null, 2));
console.log(`wrote ${outDir}/${label}.json`);
await browser.close();
