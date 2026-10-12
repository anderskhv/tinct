// /library?diag=table: what the reading table does with each touch, printed on the page
// (a phone has no console). Temporary (12 Oct 2026): Anders's own book stalls the row on
// iPhone and in Chrome; this names what runs while it stalls. Times, element names and
// book positions only, never titles, covers or anything about the reading.
let on = false;
try { on = new URLSearchParams(location.search).get('diag') === 'table'; } catch { on = false; }

const lines = [];
let box = null, state = () => '';
const t = () => (performance.now() / 1000).toFixed(2);

function paint() {
  if (!on) return;
  if (!box) {
    box = document.createElement('pre');
    box.id = 'tinct-table-diag';
    box.style.cssText = 'position:fixed;left:6px;right:6px;bottom:6px;z-index:2147483647;margin:0;padding:8px;max-height:46vh;overflow:hidden;background:#000d;color:#fff;font:11px/1.35 system-ui,sans-serif;white-space:pre-wrap;pointer-events:none;border-radius:8px';
    (document.body || document.documentElement).append(box);
  }
  box.textContent = [state(), ...lines.slice(0, 22)].join('\n');
}

/** One line, newest first. */
export function diagLog(text) {
  if (!on) return;
  lines.unshift(`${t()} ${text}`);
  if (lines.length > 60) lines.length = 60;
  paint();
}

/** Run `fn`, logging how long it took when that is noticeable (or always with `always`). */
export function diagTime(label, fn, always = false) {
  if (!on) return fn();
  const start = performance.now();
  try { return fn(); } finally {
    const ms = performance.now() - start;
    if (always || ms > 8) diagLog(`${label} ${ms.toFixed(0)}ms`);
  }
}

/** The table's live state line, read each time the panel paints. */
export function diagState(fn) { state = fn; paint(); }

export const diagOn = on;

if (on) {
  // Frames the page could not draw: the main thread was busy for that long.
  let last = performance.now();
  const tick = now => { const gap = now - last; last = now; if (gap > 120 && document.visibilityState === 'visible') diagLog(`frame gap ${gap.toFixed(0)}ms`); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  try {
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (e.duration > 80) diagLog(`long task ${e.duration.toFixed(0)}ms`); }).observe({ type: 'longtask', buffered: false });
  } catch { /* Safari has no long-task entries; the frame gaps above still show stalls */ }
  addEventListener('error', e => diagLog(`error ${String(e.message).slice(0, 90)}`));
  addEventListener('unhandledrejection', e => diagLog(`rejection ${String(e.reason).slice(0, 90)}`));
  // Every touch anywhere, so a tap that never reaches the table still shows.
  for (const type of ['pointerdown', 'pointerup', 'click']) {
    document.addEventListener(type, e => {
      const el = e.target instanceof Element ? e.target : null;
      const name = el ? `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}` : '?';
      diagLog(`${type} ${Math.round(e.clientX)},${Math.round(e.clientY)} ${name}${e.defaultPrevented ? ' (prevented)' : ''}`);
    }, { capture: true, passive: true });
  }
  // Every image the page loads, with its size and how long the load took (12 Oct: a 4.9 s pause
  // swiping onto the Bible, with touches still answered, points at an image being drawn).
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        if (!['img', 'css', 'other', 'fetch'].includes(e.initiatorType) || !/\.(jpe?g|png|webp|avif|gif)(\?|$)|\/cover/.test(e.name)) continue;
        const name = e.name.replace(/^https?:\/\/[^/]+/, '').split('?')[0].split('/').slice(-2).join('/');
        diagLog(`image ${name} ${Math.round((e.transferSize || e.encodedBodySize || 0) / 1024)}K in ${e.duration.toFixed(0)}ms`);
      }
    }).observe({ type: 'resource', buffered: false });
  } catch { /* no resource timing */ }
  // Each image element as it finishes loading: its pixel size (decoding cost grows with it).
  document.addEventListener('load', e => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const src = img.currentSrc || img.src || '';
    const kind = src.startsWith('blob:') ? 'blob' : src.startsWith('data:') ? `data ${Math.round(src.length / 1024)}K` : src.split('?')[0].split('/').slice(-2).join('/');
    const where = img.closest('.rt-b') ? `book ${img.closest('.rt-b').dataset.i ?? '?'}` : img.closest('#hero') ? 'hero' : 'page';
    diagLog(`img loaded ${img.naturalWidth}x${img.naturalHeight} ${kind} (${where})`);
  }, { capture: true });
  // The room scene behind the table and the page's state classes, as they change.
  let scene = document.documentElement.dataset.scene || '';
  new MutationObserver(() => {
    const next = document.documentElement.dataset.scene || '';
    if (next !== scene) { diagLog(`scene ${scene || '-'} -> ${next}`); scene = next; }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-scene'] });
  // A heartbeat on a timer: when frames stop but these keep coming, the page is drawing, not stuck.
  let beat = performance.now();
  setInterval(() => { const now = performance.now(); if (now - beat > 600) diagLog(`timer late ${(now - beat - 250).toFixed(0)}ms (page busy)`); beat = now; }, 250);
  setInterval(paint, 500);
}
