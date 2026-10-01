/**
 * Reader -> library. The library paints its dark room (#141c15, its
 * browser.css background) before the scene; leaving straight from the light
 * reader page flashed between the two. The reader first fades to the
 * library's colour, as the library does to the reader's paper on the way in.
 */
export const LIBRARY_BACKGROUND = '#141c15'
export const LEAVE_FADE_MS = 180

export function leaveForLibrary(url: string, win: Window = window): void {
  const doc = win.document
  const reduce = typeof win.matchMedia === 'function' && win.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !doc?.body) { win.location.assign(url); return }
  const veil = doc.createElement('div')
  veil.setAttribute('aria-hidden', 'true')
  veil.dataset.testid = 'lab-leave-veil'
  veil.style.cssText = `position:fixed;inset:0;z-index:2147483647;background:${LIBRARY_BACKGROUND};opacity:0;transition:opacity ${LEAVE_FADE_MS}ms ease;pointer-events:none`
  doc.body.appendChild(veil)
  // Back from the library can restore this page from the back/forward cache.
  win.addEventListener('pageshow', () => veil.remove(), { once: true })
  win.requestAnimationFrame(() => { veil.style.opacity = '1' })
  win.setTimeout(() => win.location.assign(url), LEAVE_FADE_MS)
}
