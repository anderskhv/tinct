// "Added to your shelf" (approved paste-flow mockup 05, 5 Nov 2026): a quiet toast, once, in the reader a
// just-added own book opens in (/reader, and Add a book's margin and PDF reader). The adding page notes the
// book in this tab (library_2/own-add.js noteAdded); the toast shows only on that book's page, within two
// minutes, and the note is gone once shown. On a phone it sits over the page-count line, not over the text.
const KEY = 'tinct:added-to-shelf';
const FRESH_MS = 2 * 60 * 1000;

export function takeAddedNote(search = location.search, now = Date.now(), storage = globalThis.sessionStorage) {
  try {
    const note = JSON.parse(storage?.getItem(KEY) || 'null');
    if (!note) return false;
    const hex = new URLSearchParams(search).get('userBook') || new URLSearchParams(search).get('open')?.replace(/^[a-z]+:/, '');
    if (!hex || hex !== note.hex) return false;
    storage.removeItem(KEY);
    return now - note.at >= 0 && now - note.at < FRESH_MS;
  } catch { return false }
}

const CSS = `.tinct-added-toast{position:fixed;z-index:2147483000;left:50%;bottom:calc(34px + env(safe-area-inset-bottom,0px));display:flex;align-items:center;gap:9px;padding:11px 18px 11px 15px;border-radius:999px;background:#1d221b;color:#eee7d0;font:500 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;box-shadow:0 10px 30px rgba(20,15,8,.28);transform:translateX(-50%);opacity:0;transition:opacity .35s ease,transform .35s ease;pointer-events:none;white-space:nowrap}
.tinct-added-toast.is-shown{opacity:1}
.tinct-added-toast svg{width:16px;height:16px;flex:none;fill:none;stroke:#b9dcbf;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
@media (max-width:600px){.tinct-added-toast{bottom:calc(4px + env(safe-area-inset-bottom,0px));padding:10px 16px 10px 13px}}
@media (prefers-reduced-motion:reduce){.tinct-added-toast{transition:none}}`;

export function showAddedToast(doc = document, { ms = 3200 } = {}) {
  const style = doc.createElement('style'); style.textContent = CSS; doc.head.append(style);
  const toast = doc.createElement('div'); toast.className = 'tinct-added-toast'; toast.setAttribute('role', 'status'); toast.dataset.testid = 'added-toast';
  toast.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  toast.append('Added to your shelf');
  // Over the page being read (the mockup's place on a desktop), not the middle of the window beside it.
  const sheet = doc.querySelector('.continuous-reader-paper, .lab-passage');
  const view = doc.defaultView;
  if (sheet && view && view.innerWidth > 600) { const r = sheet.getBoundingClientRect(); if (r.width > 0 && r.width < view.innerWidth) toast.style.left = `${Math.round(r.left + r.width / 2)}px` }
  doc.body.append(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('is-shown')));
  setTimeout(() => { toast.classList.remove('is-shown'); setTimeout(() => { toast.remove(); style.remove() }, 500) }, ms);
  return toast;
}

/** Once the reader shows the text (the Tinct reader's ready mark; elsewhere a moment after load), never over a loading screen. */
function whenReading(fn, doc = document, started = Date.now()) {
  const tinctReader = /^\/reader\b/.test(location.pathname);
  const reading = tinctReader ? doc.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true' : Date.now() - started > 700 && doc.readyState !== 'loading';
  if (reading || Date.now() - started > 15000) { fn(); return }
  setTimeout(() => whenReading(fn, doc, started), 200);
}

if (typeof document !== 'undefined' && takeAddedNote()) whenReading(() => showAddedToast());
