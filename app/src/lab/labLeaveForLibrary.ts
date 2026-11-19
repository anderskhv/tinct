/**
 * Reader -> library. The library paints its dark room (#141c15, its
 * browser.css background) before the scene; leaving straight from the light
 * reader page flashed between the two. The reader first fades to the
 * library's colour, as the library does to the reader's paper on the way in.
 */
import { LIBRARY_ROOM_COLOURS, libraryOpensReturning, libraryRoomForHour } from './libraryRoom'

export const LIBRARY_BACKGROUND = '#141c15'
export const LEAVE_FADE_MS = 180

/**
 * The colour the library will show first: the returning reader's room (its
 * painting's own colour, by the hour) or the discovery library's green. A
 * green veil before a brown room read as a flash (Anders, 10 Oct 2026).
 */
export function libraryArrivalColour(url: string, win: Window, now: Date = new Date()): string {
  let local: Storage | null = null, session: Storage | null = null
  try { local = win.localStorage } catch { /* blocked */ }
  try { session = win.sessionStorage } catch { /* blocked */ }
  return libraryOpensReturning(url, { document: win.document, localStorage: local, sessionStorage: session })
    ? LIBRARY_ROOM_COLOURS[libraryRoomForHour(now.getHours())]
    : LIBRARY_BACKGROUND
}

export function leaveForLibrary(url: string, win: Window = window): void {
  const doc = win.document
  const reduce = typeof win.matchMedia === 'function' && win.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !doc?.body) { win.location.assign(url); return }
  const veil = doc.createElement('div')
  veil.setAttribute('aria-hidden', 'true')
  veil.dataset.testid = 'lab-leave-veil'
  veil.style.cssText = `position:fixed;inset:0;z-index:2147483647;background:${libraryArrivalColour(url, win)};opacity:0;transition:opacity ${LEAVE_FADE_MS}ms ease;pointer-events:none`
  doc.body.appendChild(veil)
  // Back from the library can restore this page from the back/forward cache.
  win.addEventListener('pageshow', () => veil.remove(), { once: true })
  win.requestAnimationFrame(() => { veil.style.opacity = '1' })
  win.setTimeout(() => win.location.assign(url), LEAVE_FADE_MS)
}
