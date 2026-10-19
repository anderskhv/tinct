/**
 * The library header's picture of the signed-in reader, kept on this device as
 * a small square (72 px, a few KB) so the next visit paints it before any
 * script, profile request or image download (Anders, 19 Oct 2026: "it just
 * takes too long before my picture loads").
 *
 * - One entry per account, under `tinct:account-avatar:<userId>`, with the
 *   user id inside as well; it is read only for the account whose session is
 *   in this browser. Sign-out's clearLocalUserData removes it with every other
 *   `tinct:` key.
 * - `sig` names the picture it was cut from (the profile's picture view), so
 *   a picture changed elsewhere is noticed when the profile arrives and the
 *   copy is replaced.
 * - boot.js (public/lab/library_2) reads the same entry from the page's head
 *   and paints it from CSS (--own-avatar); keep the key and shape in step.
 */
import type { PictureView } from '../social/profileRules'
import { smallAvatarSrc } from './cardViews'

export const AVATAR_CACHE_PREFIX = 'tinct:account-avatar:'
export const AVATAR_CACHE_VERSION = 1
/** The header disc is 24 CSS px; 72 px covers a 3x screen. */
export const AVATAR_CACHE_PX = 72
/** A 72 px JPEG is 2–5 KB as a data URL; anything far larger is not ours. */
const MAX_SRC_LENGTH = 48_000

export interface AvatarCache { sig: string; src: string }

function storage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}

/** The picture as the header shows it: a painting's small copy, not its 0.5–0.75 MB original. */
export function headerPictureView(view: PictureView): PictureView {
  return view.kind === 'image' && !view.private ? { ...view, src: smallAvatarSrc(view.src) } : view
}

/** What the cached copy was cut from; null for an initial (nothing to keep). */
export function avatarSignature(view: PictureView): string | null {
  if (view.kind !== 'image') return null
  return JSON.stringify([view.src, view.pos, view.cover, Boolean(view.private)])
}

export function readAvatarCache(userId: string | null): AvatarCache | null {
  if (!userId) return null
  try {
    const raw = storage()?.getItem(AVATAR_CACHE_PREFIX + userId)
    if (!raw) return null
    const data = JSON.parse(raw) as { v?: unknown; userId?: unknown; sig?: unknown; src?: unknown }
    if (data.v !== AVATAR_CACHE_VERSION || data.userId !== userId || typeof data.sig !== 'string') return null
    if (typeof data.src !== 'string' || !/^data:image\/(?:jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/.test(data.src) || data.src.length > MAX_SRC_LENGTH) return null
    return { sig: data.sig, src: data.src }
  } catch {
    return null
  }
}

export function writeAvatarCache(userId: string | null, entry: AvatarCache): void {
  if (!userId || entry.src.length > MAX_SRC_LENGTH) return
  try { storage()?.setItem(AVATAR_CACHE_PREFIX + userId, JSON.stringify({ v: AVATAR_CACHE_VERSION, userId, sig: entry.sig, src: entry.src })) } catch { /* full or blocked: the header just loads as before */ }
}

export function clearAvatarCache(userId: string | null): void {
  if (!userId) return
  try { storage()?.removeItem(AVATAR_CACHE_PREFIX + userId) } catch { /* nothing to drop */ }
}

function fraction(part: string | undefined): number {
  const value = Number.parseFloat(part ?? '50')
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value / 100)) : 0.5
}

/**
 * The part of the image a round disc shows, in image pixels, under the same
 * rules paintAvatar gives the disc: a painting at `260% auto`, a photo at
 * `cover`, both at the view's background position.
 */
export function avatarCrop(view: Extract<PictureView, { kind: 'image' }>, width: number, height: number): { sx: number; sy: number; sw: number; sh: number } {
  // The disc is 1 x 1; the background's drawn size in disc units.
  const scale = view.cover ? 2.6 / width : Math.max(1 / width, 1 / height)
  const bw = width * scale
  const bh = height * scale
  const [px, py] = view.pos.trim().split(/\s+/)
  const ox = (1 - bw) * fraction(px)
  const oy = (1 - bh) * fraction(py)
  const sw = Math.min(width, 1 / scale)
  const sh = Math.min(height, 1 / scale)
  const sx = Math.min(Math.max(0, -ox / scale), width - sw)
  const sy = Math.min(Math.max(0, -oy / scale), height - sh)
  return { sx, sy, sw, sh }
}

/** A small square JPEG of what the disc shows, from an image this page may read (same origin or blob:). */
export async function captureAvatar(view: Extract<PictureView, { kind: 'image' }>, src: string, px = AVATAR_CACHE_PX): Promise<string | null> {
  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = src
    await image.decode()
    if (!image.naturalWidth || !image.naturalHeight) return null
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = px
    const context = canvas.getContext('2d')
    if (!context) return null
    const { sx, sy, sw, sh } = avatarCrop(view, image.naturalWidth, image.naturalHeight)
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, sx, sy, sw, sh, 0, 0, px, px)
    const url = canvas.toDataURL('image/jpeg', 0.85)
    return url.startsWith('data:image/jpeg') ? url : null
  } catch {
    return null
  }
}

/** Paint the kept copy into the header disc: already cut to the disc, so it fills it. */
export function paintCachedAvatar(el: HTMLElement, src: string): void {
  el.classList.add('tinct-avatar')
  el.textContent = ''
  el.dataset.kind = 'photo'
  el.style.backgroundImage = `url("${src}")`
  el.style.backgroundSize = 'cover'
  el.style.backgroundPosition = '50% 50%'
}
