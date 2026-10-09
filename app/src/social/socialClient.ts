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

/**
 * "Send confirmation link": asks the Worker to email the signed confirm link to
 * the reader's own address. 'sent' (also when one went out a moment ago),
 * 'confirmed' (nothing to send), or 'failed'. Never throws.
 */
export async function requestConfirmLink(token: string, fetchImpl: FetchLike = fetch): Promise<'sent' | 'confirmed' | 'failed'> {
  try {
    const res = await fetchImpl('/api/profile/confirm-link', { method: 'POST', headers: auth(token) })
    if (res.status === 429) return 'sent'
    if (!res.ok) return 'failed'
    const data = await res.json().catch(() => ({})) as { confirmed?: unknown }
    return data.confirmed === true ? 'confirmed' : 'sent'
  } catch {
    return 'failed'
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

/**
 * A picture becomes a 512 px square, a background 1600 × 800, as JPEG. Drawing
 * onto a canvas and encoding again keeps only the pixels: EXIF (including
 * location) never leaves the device. The Worker strips metadata again.
 */
export async function resizePhoto(file: Blob, slot: 'picture' | 'background'): Promise<Blob | null> {
  const [width, height] = slot === 'picture' ? [512, 512] : [1600, 800]
  let bitmap: ImageBitmap | null = null
  try {
    bitmap = await createImageBitmap(file)
    const scale = Math.max(width / bitmap.width, height / bitmap.height)
    const sw = width / scale
    const sh = height / scale
    const sx = (bitmap.width - sw) / 2
    const sy = (bitmap.height - sh) / 2
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return null
    context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height)
    return await new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.86))
  } catch {
    return null
  } finally {
    bitmap?.close()
  }
}
