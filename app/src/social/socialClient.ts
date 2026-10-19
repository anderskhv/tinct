/**
 * Profiles (social ship 2) in the browser: the switch, the API calls, the
 * picture drawing and the photo resize. Shared by the sign-up page, the You
 * page, the library entry and the reader.
 *
 * The switch is the Worker's: while SOCIAL_PROFILES is on it marks the page
 * with <meta name="tinct-social" content="1">. Without the marker every
 * function here is inert and no request is made.
 */
import {
  backgroundView,
  pictureView,
  type BackgroundKind,
  type NewBooksOpenIn,
  type PictureKind,
  type PictureView,
  type Review,
  type Visibility,
} from './profileRules'
import { internalTrafficHeaders } from '../utils/internalTraffic'
import { MAYBE_UNREADABLE, PHOTO_COPY, photoSize, readHead, sniffPhoto, type PhotoKind, type PhotoSize } from './photoFile'

export function socialProfilesOn(doc: Document | null = typeof document === 'undefined' ? null : document): boolean {
  return doc?.querySelector('meta[name="tinct-social"]')?.getAttribute('content') === '1'
}

export interface OwnProfile {
  handle: string
  link: string
  name: string
  picture: { kind: PictureKind; value: string | null; url: string | null; review: Review }
  background: { kind: BackgroundKind; value: string | null; url: string | null; review: Review }
  visibility: Visibility
  effectiveVisibility: Visibility
  showReading: boolean
  showTime: boolean
  onLeaderboard: boolean
  newBooksOpenIn: NewBooksOpenIn
  setUp: boolean
  needsSetup: boolean
  shouldPrompt: boolean
  emailConfirmed: boolean
  emailOptIn: boolean
  googlePhoto: boolean
  /** The Worker accepts uploaded pictures and backgrounds (SOCIAL_PHOTO_UPLOADS). Absent: no uploads. */
  uploads?: boolean
}

export type ProfileResult =
  | { ok: true; profile: OwnProfile }
  | { ok: false; reason: 'off' | 'unavailable' | 'signed_out' | 'invalid' | 'failed'; message?: string; field?: string }

type FetchLike = typeof fetch

function auth(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

async function readResult(res: Response): Promise<ProfileResult> {
  let data: Record<string, unknown> = {}
  try { data = await res.json() as Record<string, unknown> } catch { /* empty */ }
  if (res.status === 401) return { ok: false, reason: 'signed_out' }
  if (res.status === 404) return { ok: false, reason: 'off' }
  if (data.available === false) return { ok: false, reason: 'unavailable' }
  if (!res.ok) return { ok: false, reason: res.status === 422 || res.status === 409 || res.status === 413 || res.status === 415 ? 'invalid' : 'failed', message: typeof data.error === 'string' ? data.error : undefined, field: typeof data.field === 'string' ? data.field : undefined }
  const profile = data.profile as OwnProfile | undefined
  if (!profile || typeof profile.handle !== 'string') return { ok: false, reason: 'failed' }
  rememberNewBooksOpenIn(profile.newBooksOpenIn)
  return { ok: true, profile }
}

/** The reader's own profile (created private on first read). Never throws. */
export async function fetchOwnProfile(token: string, bookHint: string | null = currentBookHint(), fetchImpl: FetchLike = fetch): Promise<ProfileResult> {
  try {
    const query = bookHint ? `?book=${encodeURIComponent(bookHint)}` : ''
    return await readResult(await fetchImpl(`/api/profile${query}`, { headers: { ...auth(token), ...internalTrafficHeaders() }, cache: 'no-store' }))
  } catch {
    return { ok: false, reason: 'failed' }
  }
}

export async function saveProfile(token: string, body: Record<string, unknown>, fetchImpl: FetchLike = fetch): Promise<ProfileResult> {
  try {
    return await readResult(await fetchImpl('/api/profile', { method: 'POST', headers: { ...auth(token), ...internalTrafficHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) }))
  } catch {
    return { ok: false, reason: 'failed' }
  }
}

export async function checkHandle(token: string, handle: string, fetchImpl: FetchLike = fetch): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetchImpl(`/api/profile/handle?h=${encodeURIComponent(handle)}`, { headers: auth(token) })
    const data = await res.json() as { ok?: boolean; message?: string }
    return { ok: data.ok === true, message: data.message }
  } catch {
    return { ok: false, message: 'Could not check that link. Please try again.' }
  }
}

export async function uploadProfileImage(token: string, slot: 'picture' | 'background', image: Blob, fetchImpl: FetchLike = fetch): Promise<ProfileResult> {
  try {
    return await readResult(await fetchImpl(`/api/profile/image?slot=${slot}`, { method: 'POST', headers: { ...auth(token), 'Content-Type': 'image/jpeg' }, body: image }))
  } catch {
    return { ok: false, reason: 'failed' }
  }
}

export async function chooseGooglePhoto(token: string, fetchImpl: FetchLike = fetch): Promise<ProfileResult> {
  try {
    return await readResult(await fetchImpl('/api/profile/google-photo', { method: 'POST', headers: auth(token) }))
  } catch {
    return { ok: false, reason: 'failed' }
  }
}

// ===== Stored photos (fetched with the reader's token, shown as blob: URLs) =====

const blobUrls = new Map<string, Promise<string | null>>()

export function privateImageUrl(token: string, url: string): Promise<string | null> {
  const known = blobUrls.get(url)
  if (known) return known
  const loading = fetch(url, { headers: auth(token) })
    .then(async res => (res.ok ? URL.createObjectURL(await res.blob()) : null))
    .catch(() => null)
  blobUrls.set(url, loading)
  return loading
}

export function ownPictureView(profile: Pick<OwnProfile, 'picture' | 'name'>): PictureView {
  return pictureView(profile.picture.kind, profile.picture.value, profile.name, profile.picture.url)
}

export function ownBackground(profile: Pick<OwnProfile, 'background'>): { src: string; private?: boolean } {
  return backgroundView(profile.background.kind, profile.background.value, profile.background.url)
}

/** Draw a round picture into an element (vanilla pages). Stored photos load with the token. */
export function paintAvatar(el: HTMLElement, view: PictureView, token: string | null): void {
  el.classList.add('tinct-avatar')
  el.textContent = ''
  el.style.backgroundImage = ''
  if (view.kind === 'initial') {
    el.dataset.kind = 'initial'
    el.textContent = view.initial
    return
  }
  el.dataset.kind = view.cover ? 'cover' : 'photo'
  el.style.backgroundPosition = view.pos
  el.style.backgroundSize = view.cover ? '260% auto' : 'cover'
  if (view.private) {
    if (!token) return
    void privateImageUrl(token, view.src).then(src => { if (src) el.style.backgroundImage = `url("${src}")` })
  } else {
    el.style.backgroundImage = `url("${view.src}")`
  }
}

export function paintBackground(el: HTMLElement, view: { src: string; private?: boolean }, token: string | null): void {
  if (view.private) {
    if (!token) return
    void privateImageUrl(token, view.src).then(src => { if (src) el.style.setProperty('--scene', `url("${src}")`) })
  } else {
    el.style.setProperty('--scene', `url("${view.src}")`)
  }
}

// ===== The book being read (a hint for the starting picture) =====

/** The most recently read book on this device, from the reader's position record. */
export function currentBookHint(): string | null {
  try {
    const state = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null') as { books?: Record<string, { updatedAt?: number }> } | null
    const books = Object.entries(state?.books || {})
    books.sort((a, b) => (b[1]?.updatedAt || 0) - (a[1]?.updatedAt || 0))
    const id = books[0]?.[0]
    return id && /^[a-z0-9-]{1,80}$/.test(id) ? id : null
  } catch {
    return null
  }
}

// ===== "New books open in" =====

/** Device copy of the profile's reading default, so a book opens without waiting for the network. */
export const NEW_BOOKS_KEY = 'tinct:new-books-open-in'

export function rememberNewBooksOpenIn(value: NewBooksOpenIn | null): void {
  try {
    if (value === 'modern' || value === 'human') localStorage.setItem(NEW_BOOKS_KEY, value)
  } catch { /* private mode */ }
}

/** The reader's default for books they have not opened yet; null when profiles are off or unset. */
export function newBooksOpenIn(doc: Document | null = typeof document === 'undefined' ? null : document): NewBooksOpenIn | null {
  if (!socialProfilesOn(doc)) return null
  try {
    const value = localStorage.getItem(NEW_BOOKS_KEY)
    return value === 'modern' || value === 'human' ? value : null
  } catch {
    return null
  }
}

// ===== Photos: resized in the browser; re-encoding drops location data =====

/** The Worker's limits for an uploaded photo (worker/routes/profiles.ts MAX_IMAGE_BYTES, MAX_IMAGE_SIDE). */
export const PHOTO_MAX_BYTES = 2_000_000
export const PHOTO_MAX_SIDE = 2400
/** What each slot is drawn at: a picture a 512 px square, a background 1600 × 800. */
export const PHOTO_SLOT_SIZE = { picture: [512, 512], background: [1600, 800] } as const
/** JPEG qualities tried in turn until the photo fits under PHOTO_MAX_BYTES. */
const JPEG_QUALITIES = [0.86, 0.72, 0.58, 0.45]

export type PreparedPhoto = { ok: true; image: Blob } | { ok: false; message: string }

/**
 * A picture becomes a 512 px square, a background 1600 × 800, as JPEG. Drawing
 * onto a canvas and encoding again keeps only the pixels: EXIF (including
 * location) never leaves the device. The Worker strips metadata again.
 * Null when the photo cannot be used; preparePhoto says why.
 */
export async function resizePhoto(file: Blob, slot: 'picture' | 'background'): Promise<Blob | null> {
  const prepared = await preparePhoto(file, slot)
  return prepared.ok ? prepared.image : null
}

/**
 * The chosen photo, read into memory while its file input still holds it
 * (19 Oct 2026). On iPadOS, Safari hands over a temporary JPEG converted from
 * HEIC, which may be released once the input is cleared; reading it later
 * failed with "This photo could not be read here". So the handlers read the
 * file first and clear the input only after preparePhoto. Null when even the
 * first read fails. Never throws.
 */
export async function photoInMemory(file: Blob & { name?: string }): Promise<Blob | null> {
  try {
    const bytes = await file.arrayBuffer()
    return typeof File === 'function' && typeof file.name === 'string'
      ? new File([bytes], file.name, { type: file.type })
      : new Blob([bytes], { type: file.type })
  } catch {
    return null
  }
}

/** The photo ready to upload, or the reader-facing reason it cannot be used. Never throws. */
export async function preparePhoto(file: Blob, slot: 'picture' | 'background'): Promise<PreparedPhoto> {
  const [width, height] = PHOTO_SLOT_SIZE[slot]
  const head = await readHead(file)
  const kind = sniffPhoto(head)
  const image = await decodePhoto(file, photoSize(head, kind), width, height)
  if (!image) return { ok: false, message: undecodedMessage(kind, head.length > 0) }
  try {
    const scale = Math.max(width / image.width, height / image.height)
    const sw = width / scale
    const sh = height / scale
    const sx = (image.width - sw) / 2
    const sy = (image.height - sh) / 2
    // The canvas is the slot's size, never the photo's: a 50 MP photo is drawn straight down.
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return { ok: false, message: PHOTO_COPY.unprepared }
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(image.source, sx, sy, sw, sh, 0, 0, width, height)
    for (const quality of JPEG_QUALITIES) {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(out => resolve(out), 'image/jpeg', quality))
      if (!blob || blob.type !== 'image/jpeg') return { ok: false, message: PHOTO_COPY.unprepared }
      if (blob.size <= PHOTO_MAX_BYTES) return { ok: true, image: blob }
    }
    return { ok: false, message: PHOTO_COPY.tooLarge }
  } catch {
    return { ok: false, message: PHOTO_COPY.unprepared }
  } finally {
    image.close()
  }
}

/** Why a photo nothing could decode cannot be used. */
function undecodedMessage(kind: PhotoKind | null, readable: boolean): string {
  if (!readable) return PHOTO_COPY.unreadable
  if (kind && MAYBE_UNREADABLE.has(kind)) return PHOTO_COPY.unreadableFormat
  if (kind) return PHOTO_COPY.unreadable
  return PHOTO_COPY.notAPhoto
}

/** The message for a failed upload: the Worker's own line, else one for the reason, else the save error. */
export function photoUploadMessage(result: ProfileResult, fallback: string): string {
  if (result.ok) return ''
  if (result.message) return result.message
  if (result.reason === 'signed_out') return PHOTO_COPY.signedOut
  if (result.reason === 'off' || result.reason === 'unavailable') return PHOTO_COPY.off
  return fallback
}

interface DecodedPhoto {
  source: CanvasImageSource
  width: number
  height: number
  close: () => void
}

/**
 * The photo's pixels, as small as they can be decoded:
 * 1. createImageBitmap at the drawn size (its resize options), when the
 *    header gives the photo's size: a large photo is never held full size;
 * 2. createImageBitmap at full size (browsers without the resize options);
 * 3. an <img>: Safari on iPad and iPhone cannot make a bitmap from some
 *    photos (HEIC among them) that it can still show.
 */
async function decodePhoto(file: Blob, size: PhotoSize | null, width: number, height: number): Promise<DecodedPhoto | null> {
  const fromBitmap = (bitmap: ImageBitmap): DecodedPhoto => ({ source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() })
  const resize = size ? drawnSize(size, width, height) : null
  if (resize) {
    try {
      return fromBitmap(await createImageBitmap(file, { resizeWidth: resize.width, resizeQuality: 'high' }))
    } catch { /* full size below */ }
  }
  try {
    return fromBitmap(await createImageBitmap(file))
  } catch { /* the <img> below */ }
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return null
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    if (!img.naturalWidth || !img.naturalHeight) { URL.revokeObjectURL(url); return null }
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) }
  } catch {
    URL.revokeObjectURL(url)
    return null
  }
}

/**
 * The size a photo is decoded at so it still covers the slot (the crop is
 * drawn from it): only when that is smaller than the photo. Only the width is
 * given, so the browser keeps the photo's own proportions.
 */
export function drawnSize(size: PhotoSize, width: number, height: number): PhotoSize | null {
  const scale = Math.max(width / size.width, height / size.height)
  if (scale >= 1) return null
  return { width: Math.ceil(size.width * scale), height: Math.ceil(size.height * scale) }
}
