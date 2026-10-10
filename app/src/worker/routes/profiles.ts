/**
 * Profiles (social ship 2). Everything here answers only while the Worker var
 * SOCIAL_PROFILES is "1"; off, every route is a plain 404, exactly as before
 * the routes existed.
 *
 *   GET  /api/profile                 the reader's own profile (created private on first read)
 *   POST /api/profile                 change it (name, link, picture, who can see you, switches, reading default, emails)
 *   GET  /api/profile/handle?h=       is this link free and allowed?
 *   POST /api/profile/image?slot=     upload a picture or background (JPEG, resized in the browser);
 *                                     only while SOCIAL_PHOTO_UPLOADS is "1" (off at launch: a 404)
 *   GET  /api/profile/image?user=&slot=   a stored picture: the owner always, others once approved and allowed
 *   POST /api/profile/google-photo    copy the reader's Google photo into their profile
 *   POST /api/profile/confirm-link    "Send confirmation link": one service email with the signed
 *                                     /confirm link (routes/confirmLink.ts); 1 per 5 minutes, 5 a day
 *
 * The first GET /api/profile of a new email-and-password account (the
 * sign-up page reads it right after the account is created) also sends that
 * confirmation email once, automatically (sendSignUpConfirmation).
 *   GET  /api/profiles/{handle}       what this viewer may see of a profile (ship 3 builds the page on it)
 *
 * Email confirmation is not here: the link (in the welcome email, or sent again
 * by /api/profile/confirm-link) is ship 4's signed /confirm?t=
 * (routes/emailLinks.ts, lifecycle/links.ts), which sets the same
 * profiles.email_confirmed_at this module reads.
 *
 * Never returned to anyone: email, highlights, notes, chats, Talk.
 * Readers never write rows directly; this route writes only the caller's own.
 */
import {
  EMAIL_CONSENT_VERSION,
  HANDLE_PROBLEM_COPY,
  NEUTRAL_NAME,
  PICTURE_SETS,
  COVER_BOOK_IDS,
  VISIBILITIES,
  cleanDisplayName,
  effectiveVisibility,
  handleBase,
  handleCandidates,
  handleProblem,
  isHandleFrom,
  legacyEmailDerived,
  neutralHandleBase,
  normalizeHandle,
  pictureForBook,
  profileLinkText,
  publicProfileView,
  relationOf,
  suggestedName,
  uniqueHandle,
  type ProfileCard,
  type Visibility,
} from '../../social/profileRules'
import { isInternalAccount } from '../../social/socialRules'
import { GENERATED_BOOK_META } from '../../data/bookMetaGenerated'
import { SIGNUP_CONFIRM_DEDUPE_KEY, SIGNUP_CONFIRM_TEMPLATE, SIGNUP_CONFIRM_WINDOW_MS } from './confirmLink'
import { corsHeaders } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { ProfilesUnavailable, supabaseProfileStore, type ProfileStore, type ReaderProfileRow } from '../lib/profileStore'
import type { SupabaseEnv } from '../lib/supabase'

export type ProfilesEnv = SupabaseEnv & {
  /** "1" turns profiles on. Anything else: every profile route is a 404 and no page changes. */
  SOCIAL_PROFILES?: string
  /**
   * "1" accepts uploaded pictures and backgrounds. Anything else (the launch
   * default): POST /api/profile/image is a 404 and the editor offers no upload.
   */
  SOCIAL_PHOTO_UPLOADS?: string
  /** Private bucket; profile photos live under profile/{userId}/ (purged with the account). */
  USER_BOOKS?: R2Bucket
}

/** The Supabase auth user, as /auth/v1/user returns it. */
export interface ProfileAuthUser {
  id: string
  email?: string | null
  app_metadata?: { provider?: string; providers?: string[] } & Record<string, unknown>
  user_metadata?: Record<string, unknown>
  identities?: { provider?: string }[]
  /** When the account was created (Supabase's created_at). */
  created_at?: string
}

export interface ProfileDeps {
  verifyUser: (request: Request) => Promise<ProfileAuthUser | null>
  store?: ProfileStore
  now?: () => Date
  random?: () => number
  /** Analytics (social ship 3's funnel events): profile_created, profile_skipped, visibility_changed. */
  track?: (name: 'profile_created' | 'profile_skipped' | 'visibility_changed', userId: string, props?: Record<string, string>) => void
  /** Sends the confirm-link service email (routes/confirmLink.ts confirmLinkSender). Absent: confirm-link is a 503. */
  sendConfirmLink?: ((to: string, userId: string) => Promise<boolean>) | null
  /** One confirm-link email for this account now? (1 per 5 minutes, 5 a day; false when the limiter is down.) */
  confirmLinkAllowed?: (userId: string) => Promise<boolean>
  /** Runs work after the reply (the Worker's ctx.waitUntil). Absent: awaited before replying. */
  defer?: (promise: Promise<unknown>) => void
}

export function socialProfilesOn(env: { SOCIAL_PROFILES?: string }): boolean {
  return env.SOCIAL_PROFILES === '1'
}

/** Uploaded photos (not the Google photo copy): off unless SOCIAL_PHOTO_UPLOADS is "1". */
export function photoUploadsOn(env: { SOCIAL_PHOTO_UPLOADS?: string }): boolean {
  return env.SOCIAL_PHOTO_UPLOADS === '1'
}

/** Paths this module answers (only while the switch is on). */
export function isProfileApiPath(pathname: string): boolean {
  return pathname === '/api/profile' || pathname.startsWith('/api/profile/') || pathname.startsWith('/api/profiles/')
}

const BOOK_IDS = Object.keys(GENERATED_BOOK_META)
const MAX_IMAGE_BYTES = 2_000_000
const MAX_IMAGE_SIDE = 2400

function reply(data: unknown, status: number, request: Request): Response {
  return Response.json(data, { status, headers: { ...corsHeaders(request), 'Cache-Control': 'no-store' } })
}

function notFound(request: Request): Response {
  return reply({ error: 'Not found' }, 404, request)
}

export function isGoogleAccount(user: ProfileAuthUser): boolean {
  const meta = user.app_metadata || {}
  return meta.provider === 'google'
    || (Array.isArray(meta.providers) && meta.providers.includes('google'))
    || (user.identities || []).some(identity => identity.provider === 'google')
}

function googlePhotoUrl(user: ProfileAuthUser): string | null {
  const meta = user.user_metadata || {}
  const raw = typeof meta.avatar_url === 'string' ? meta.avatar_url : typeof meta.picture === 'string' ? meta.picture : null
  if (!raw || !isGoogleAccount(user)) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || !/(^|\.)googleusercontent\.com$/.test(url.hostname)) return null
    // Ask for a 512 px square instead of the default 96 px.
    url.pathname = url.pathname.replace(/=s\d+(-c)?$/, '=s512-c')
    return url.toString()
  } catch {
    return null
  }
}

function imageKey(userId: string, slot: 'picture' | 'background', token: string): string {
  return `profile/${userId}/${slot}-${token}`
}

export function imageUrl(userId: string, slot: 'picture' | 'background', token: string | null): string | null {
  return token ? `/api/profile/image?user=${userId}&slot=${slot}&v=${encodeURIComponent(token)}` : null
}

/** The reader's own profile as the client sees it. */
function selfView(row: ReaderProfileRow, account: { emailConfirmed: boolean; emailOptIn: boolean }, user: ProfileAuthUser, uploads: boolean) {
  const stored = row.picture_kind === 'upload' || row.picture_kind === 'google'
  return {
    handle: row.handle,
    link: profileLinkText(row.handle),
    name: row.display_name,
    picture: { kind: row.picture_kind, value: stored ? null : row.picture_value, url: stored ? imageUrl(row.id, 'picture', row.picture_value) : null, review: row.picture_review },
    background: { kind: row.background_kind, value: row.background_kind === 'upload' ? null : row.background_value, url: row.background_kind === 'upload' ? imageUrl(row.id, 'background', row.background_value) : null, review: row.background_review },
    visibility: row.visibility,
    effectiveVisibility: effectiveVisibility(row.visibility, account.emailConfirmed),
    showReading: row.show_reading,
    showTime: row.show_time,
    onLeaderboard: row.on_leaderboard,
    newBooksOpenIn: row.new_books_open_in,
    setUp: Boolean(row.set_up_at),
    /** An account from before profiles that has not chosen anything yet. */
    needsSetup: row.auto_created && !row.set_up_at,
    /** The one gentle prompt: offered once, outside a book. */
    shouldPrompt: row.auto_created && !row.set_up_at && !row.prompted_at,
    emailConfirmed: account.emailConfirmed,
    emailOptIn: account.emailOptIn,
    googlePhoto: Boolean(googlePhotoUrl(user)),
    /** Uploads are accepted (SOCIAL_PHOTO_UPLOADS "1"): the cards offer Upload a picture / a background only then. */
    uploads,
  }
}

async function accountState(store: ProfileStore, user: ProfileAuthUser, now: Date): Promise<{ emailConfirmed: boolean; emailOptIn: boolean }> {
  const account = await store.getAccount(user.id)
  let confirmed = Boolean(account?.email_confirmed_at)
  // Google sign-ups count as confirmed (Google verified the address).
  if (!confirmed && account && isGoogleAccount(user)) {
    await store.updateAccount(user.id, { email_confirmed_at: now.toISOString() })
    confirmed = true
  }
  return { emailConfirmed: confirmed, emailOptIn: Boolean(account?.email_opt_in) }
}

/**
 * Tinct's own internal and test accounts (socialRules isInternalAccount: a
 * reserved test address, or the internal-traffic device flag's
 * `x-tinct-check: 1`) are flagged when their profile is read or saved, which
 * happens on sign-in. Best effort: a failure (before
 * 20261009_leaderboard_internal.sql has run) never stops the profile.
 */
async function flagInternal(store: ProfileStore, user: ProfileAuthUser, request: Request): Promise<void> {
  if (!store.markInternal || !isInternalAccount(user.email, request.headers.get('x-tinct-check'))) return
  try {
    await store.markInternal(user.id)
  } catch (error) {
    console.warn(JSON.stringify({ event: 'internal_flag_failed', detail: error instanceof Error ? error.message : 'failed' }))
  }
}

/** The account's own name (Google's full name), if it has one. Never the email. */
function accountName(user: ProfileAuthUser): string | null {
  const meta = user.user_metadata || {}
  const raw = meta.full_name ?? meta.name
  return typeof raw === 'string' ? cleanDisplayName(raw) : null
}

/**
 * The automatic link for a name: made from the name, or for the neutral name
 * "reader" and a short random part; unique. `current` is kept when it already
 * is one for this name.
 */
async function autoHandle(store: ProfileStore, name: string, current: string | null, random: () => number): Promise<string> {
  const fromName = handleBase(name)
  if (current && isHandleFrom(current, fromName)) return current
  const base = name === NEUTRAL_NAME ? neutralHandleBase(random) : fromName
  const taken = await store.takenHandles(handleCandidates(base))
  return uniqueHandle(base, taken, BOOK_IDS, random)
}

/**
 * Is the link still the one Tinct made (so a new name may re-derive it)?
 * Only before set-up, only while the reader has not typed a link themselves
 * (that clears auto_created), and only while it still matches the name.
 */
function hasAutoHandle(row: ReaderProfileRow): boolean {
  return row.auto_created && !row.set_up_at && isHandleFrom(row.handle, handleBase(row.display_name))
}

/**
 * Profiles made before 9 October 2026 took the name and link from the email.
 * One not yet set up (Only me, so nobody else has seen it or its link) is
 * re-derived by today's rules on its next read or save. A set-up profile is
 * never touched: its link may be shared.
 */
async function repairEmailDerived(store: ProfileStore, row: ReaderProfileRow, user: ProfileAuthUser, random: () => number): Promise<ReaderProfileRow> {
  if (row.set_up_at || !row.auto_created) return row
  const legacy = legacyEmailDerived(user.email)
  const fromAccount = accountName(user)
  const nameFromEmail = legacy.name !== null && row.display_name === legacy.name && row.display_name !== fromAccount
  const name = nameFromEmail ? fromAccount ?? NEUTRAL_NAME : row.display_name
  const handleFromEmail = legacy.handleBases.some(base => isHandleFrom(row.handle, base)) && !isHandleFrom(row.handle, handleBase(name))
  if (!nameFromEmail && !handleFromEmail) return row
  for (let attempt = 0; attempt < 3; attempt++) {
    const patch: Patch = {}
    if (nameFromEmail) patch.display_name = name
    if (handleFromEmail) patch.handle = await autoHandle(store, name, null, random)
    if (await store.update(row.id, patch) === 'ok') return { ...row, ...patch }
  }
  return row
}

/**
 * The reader's row, created private on first read: the account's own name
 * (Google's), else the neutral name; a unique link made from it ("reader" and
 * a short random part for the neutral name; never anything from the email);
 * the picture of the book they are reading (else the initial), Only me.
 * Nobody becomes visible to others without choosing to.
 */
async function ownProfile(store: ProfileStore, user: ProfileAuthUser, bookHint: string | null, random: () => number): Promise<ReaderProfileRow> {
  const existing = await store.getOwn(user.id)
  if (existing) return repairEmailDerived(store, existing, user, random)
  const name = suggestedName(accountName(user))
  const start = pictureForBook(bookHint)
  for (let attempt = 0; attempt < 3; attempt++) {
    const handle = await autoHandle(store, name, null, random)
    const row: Omit<ReaderProfileRow, 'updated_at'> = {
      id: user.id,
      display_name: name,
      handle,
      picture_kind: start.kind,
      picture_value: start.value,
      picture_review: 'none',
      background_kind: start.background.kind,
      background_value: start.background.value,
      background_review: 'none',
      visibility: 'only_me',
      show_reading: true,
      show_time: true,
      on_leaderboard: false,
      new_books_open_in: 'modern',
      auto_created: true,
      set_up_at: null,
      prompted_at: null,
    }
    const result = await store.create(row)
    if (result === 'ok') return { ...row }
    // Taken by someone else meanwhile, or this reader's row was created by a parallel request.
    const raced = await store.getOwn(user.id)
    if (raced) return raced
  }
  throw new ProfilesUnavailable('could not create profile')
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null
  } catch {
    return null
  }
}

type Patch = Partial<ReaderProfileRow>

/** Validate a change request. Returns the patch, or the problem to show. */
async function buildPatch(store: ProfileStore, row: ReaderProfileRow, body: Record<string, unknown>, now: Date, random: () => number): Promise<{ patch: Patch; autoHandle: boolean } | { error: string; field: string; status: number }> {
  const patch: Patch = {}
  if ('name' in body) {
    const name = cleanDisplayName(body.name)
    if (!name) return { error: 'Please choose another name.', field: 'name', status: 422 }
    patch.display_name = name
  }
  if ('handle' in body) {
    const handle = normalizeHandle(String(body.handle ?? ''))
    if (handle !== row.handle) {
      const problem = handleProblem(handle, BOOK_IDS)
      if (problem) return { error: HANDLE_PROBLEM_COPY[problem], field: 'handle', status: 422 }
      if ((await store.takenHandles([handle])).has(handle)) return { error: HANDLE_PROBLEM_COPY.taken, field: 'handle', status: 409 }
      patch.handle = handle
      // The reader chose this link: it is never re-derived from a name again.
      if (row.auto_created) patch.auto_created = false
    }
  }
  // A new name while the link is still Tinct's own: the link follows the name.
  let autoHandleChosen = false
  if (patch.display_name && patch.handle === undefined && hasAutoHandle(row)) {
    const next = await autoHandle(store, patch.display_name, row.handle, random)
    if (next !== row.handle) { patch.handle = next; autoHandleChosen = true }
  }
  if ('picture' in body) {
    const picture = body.picture as { kind?: unknown; value?: unknown } | null
    const kind = picture?.kind
    if (kind === 'set' && PICTURE_SETS.some(set => set.id === picture?.value)) Object.assign(patch, { picture_kind: 'set', picture_value: picture!.value as string, picture_review: 'none' })
    else if (kind === 'cover' && COVER_BOOK_IDS.includes(String(picture?.value))) Object.assign(patch, { picture_kind: 'cover', picture_value: String(picture!.value), picture_review: 'none' })
    else if (kind === 'initial') Object.assign(patch, { picture_kind: 'initial', picture_value: null, picture_review: 'none' })
    else return { error: 'Choose a picture.', field: 'picture', status: 422 }
  }
  if ('background' in body) {
    const background = body.background as { kind?: unknown; value?: unknown } | null
    if (background?.kind === 'set' && PICTURE_SETS.some(set => set.id === background.value)) Object.assign(patch, { background_kind: 'set', background_value: background.value as string, background_review: 'none' })
    else if (background?.kind === 'library') Object.assign(patch, { background_kind: 'library', background_value: null, background_review: 'none' })
    else return { error: 'Choose a background.', field: 'background', status: 422 }
  }
  if ('visibility' in body) {
    if (!VISIBILITIES.includes(body.visibility as Visibility)) return { error: 'Choose who can see you.', field: 'visibility', status: 422 }
    // Everyone is stored as chosen; it counts as Friends until the email is confirmed (effectiveVisibility).
    patch.visibility = body.visibility as Visibility
  }
  for (const [field, column] of [['showReading', 'show_reading'], ['showTime', 'show_time'], ['onLeaderboard', 'on_leaderboard']] as const) {
    if (field in body) {
      if (typeof body[field] !== 'boolean') return { error: 'Choose on or off.', field, status: 422 }
      patch[column] = body[field] as boolean
    }
  }
  if ('newBooksOpenIn' in body) {
    if (body.newBooksOpenIn !== 'modern' && body.newBooksOpenIn !== 'human') return { error: 'Choose a version.', field: 'newBooksOpenIn', status: 422 }
    patch.new_books_open_in = body.newBooksOpenIn
  }
  // Skip for now = Only me, and the reader has made their choice.
  if (body.skip === true) {
    patch.visibility = 'only_me'
    patch.set_up_at = row.set_up_at ?? now.toISOString()
  }
  if (body.setUp === true) patch.set_up_at = row.set_up_at ?? now.toISOString()
  if (body.prompted === true) patch.prompted_at = row.prompted_at ?? now.toISOString()
  return { patch, autoHandle: autoHandleChosen }
}

async function deleteStoredImage(env: ProfilesEnv, userId: string, slot: 'picture' | 'background', token: string | null) {
  if (!token || !env.USER_BOOKS) return
  try { await env.USER_BOOKS.delete(imageKey(userId, slot, token)) } catch { /* the account purge removes leftovers */ }
}

// ===== Images =====

/**
 * Keep a JPEG's picture and drop everything else: EXIF (location, camera),
 * XMP, ICC and comments live in APP1–APP15 and COM segments. Returns null for
 * anything that is not a well-formed baseline/progressive JPEG.
 */
export function stripJpegMetadata(bytes: Uint8Array): { bytes: Uint8Array; width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  const parts: Uint8Array[] = [bytes.subarray(0, 2)]
  let width = 0
  let height = 0
  let i = 2
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) return null
    const marker = bytes[i + 1]
    if (marker === 0xd9) { parts.push(bytes.subarray(i, i + 2)); break }
    const length = (bytes[i + 2] << 8) | bytes[i + 3]
    if (length < 2 || i + 2 + length > bytes.length) return null
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      height = (bytes[i + 5] << 8) | bytes[i + 6]
      width = (bytes[i + 7] << 8) | bytes[i + 8]
    }
    const metadata = (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe
    if (!metadata) parts.push(bytes.subarray(i, i + 2 + length))
    if (marker === 0xda) {
      // Start of scan: the rest is image data up to the end marker.
      parts.push(bytes.subarray(i + 2 + length))
      break
    }
    i += 2 + length
  }
  if (!width || !height) return null
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) { out.set(part, offset); offset += part.length }
  return { bytes: out, width, height }
}

function sniffImage(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) return 'image/webp'
  return null
}

function randomToken(random: () => number): string {
  const values = new Uint8Array(9)
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(values)
  else for (let i = 0; i < values.length; i++) values[i] = Math.floor(random() * 256)
  return [...values].map(value => value.toString(16).padStart(2, '0')).join('')
}

async function storeImage(env: ProfilesEnv, store: ProfileStore, row: ReaderProfileRow, slot: 'picture' | 'background', bytes: Uint8Array, type: string, kind: 'upload' | 'google', random: () => number): Promise<void> {
  const token = randomToken(random)
  await env.USER_BOOKS!.put(imageKey(row.id, slot, token), bytes, { httpMetadata: { contentType: type, cacheControl: 'private, max-age=300' } })
  const previous = slot === 'picture'
    ? (row.picture_kind === 'upload' || row.picture_kind === 'google' ? row.picture_value : null)
    : (row.background_kind === 'upload' ? row.background_value : null)
  const patch: Patch = slot === 'picture'
    ? { picture_kind: kind, picture_value: token, picture_review: 'pending' }
    : { background_kind: 'upload', background_value: token, background_review: 'pending' }
  await store.update(row.id, patch)
  await deleteStoredImage(env, row.id, slot, previous)
}

// ===== Router =====

export async function handleProfiles(
  request: Request,
  env: ProfilesEnv,
  deps: ProfileDeps,
): Promise<Response> {
  if (!socialProfilesOn(env)) return notFound(request)
  const url = new URL(request.url)
  const store = deps.store ?? supabaseProfileStore(env)
  const now = deps.now?.() ?? new Date()
  const random = deps.random ?? Math.random

  try {
    if (url.pathname.startsWith('/api/profiles/')) {
      return await handlePublicProfile(request, url, env, store, deps)
    }
    if (url.pathname === '/api/profile/image' && request.method === 'GET') {
      return await serveImage(request, url, env, store, deps)
    }
    // No uploads at launch: refused before anything is read, the caller's identity included.
    if (url.pathname === '/api/profile/image' && request.method === 'POST' && !photoUploadsOn(env)) return notFound(request)

    const user = await deps.verifyUser(request)
    if (!user) return reply({ error: 'Authentication required' }, 401, request)
    if (!isValidUUID(user.id)) return reply({ error: 'Invalid user' }, 400, request)

    if (url.pathname === '/api/profile' && request.method === 'GET') {
      const bookHint = url.searchParams.get('book')
      const row = await ownProfile(store, user, bookHint && /^[a-z0-9-]{1,80}$/.test(bookHint) ? bookHint : null, random)
      await flagInternal(store, user, request)
      const account = await accountState(store, user, now)
      if (!account.emailConfirmed) {
        const confirmation = sendSignUpConfirmation(store, user, deps, now)
        if (deps.defer) deps.defer(confirmation)
        else await confirmation
      }
      return reply({ enabled: true, available: true, profile: selfView(row, account, user, photoUploadsOn(env)) }, 200, request)
    }

    if (url.pathname === '/api/profile' && request.method === 'POST') {
      const body = await readJson(request)
      if (!body) return reply({ error: 'Invalid JSON' }, 400, request)
      const row = await ownProfile(store, user, null, random)
      await flagInternal(store, user, request)
      const built = await buildPatch(store, row, body, now, random)
      if ('error' in built) return reply({ error: built.error, field: built.field }, built.status, request)
      const { patch } = built
      // Leaving a stored photo removes it (nothing is kept that is not shown).
      const leavingPicture = patch.picture_kind && patch.picture_kind !== row.picture_kind && (row.picture_kind === 'upload' || row.picture_kind === 'google')
      const leavingBackground = patch.background_kind && patch.background_kind !== row.background_kind && row.background_kind === 'upload'
      if (Object.keys(patch).length) {
        let result = await store.update(user.id, patch)
        // A link Tinct picked was taken meanwhile: pick again rather than blame the reader.
        for (let attempt = 0; result === 'taken' && built.autoHandle && attempt < 2; attempt++) {
          patch.handle = await autoHandle(store, patch.display_name!, null, random)
          result = await store.update(user.id, patch)
        }
        if (result === 'taken') return reply({ error: HANDLE_PROBLEM_COPY.taken, field: 'handle' }, 409, request)
      }
      if (deps.track) {
        if (body.skip === true && !row.set_up_at) deps.track('profile_skipped', user.id)
        else if (patch.set_up_at && !row.set_up_at) deps.track('profile_created', user.id, { visibility: patch.visibility ?? row.visibility })
        if (patch.visibility && patch.visibility !== row.visibility) deps.track('visibility_changed', user.id, { from: row.visibility, to: patch.visibility })
      }
      if (leavingPicture) await deleteStoredImage(env, user.id, 'picture', row.picture_value)
      if (leavingBackground) await deleteStoredImage(env, user.id, 'background', row.background_value)
      // Reading emails: on records the current consent wording; off stops them at once.
      // Same columns as ship 4's engine and its one-click unsubscribe (lifecycle/engine.ts
      // profileOptedIn): email_opt_in, email_opt_in_at (newer than any opt-out resumes),
      // email_opt_out_at, email_consent_version.
      const consent = body.consent as { optIn?: unknown; version?: unknown } | undefined
      const optIn = body.emailOptIn === true || (consent?.optIn === true && consent.version === EMAIL_CONSENT_VERSION)
      if (optIn) await store.updateAccount(user.id, { email_opt_in: true, email_opt_in_at: now.toISOString(), email_consent_version: EMAIL_CONSENT_VERSION })
      else if (body.emailOptIn === false) await store.updateAccount(user.id, { email_opt_in: false, email_opt_out_at: now.toISOString() })
      const next = await store.getOwn(user.id) ?? { ...row, ...patch }
      const account = await accountState(store, user, now)
      return reply({ enabled: true, available: true, profile: selfView(next, account, user, photoUploadsOn(env)) }, 200, request)
    }

    if (url.pathname === '/api/profile/handle' && request.method === 'GET') {
      const handle = normalizeHandle(url.searchParams.get('h') || '')
      const own = await store.getOwn(user.id)
      if (own?.handle === handle) return reply({ ok: true, handle, link: profileLinkText(handle) }, 200, request)
      const problem = handleProblem(handle, BOOK_IDS)
      // Reserved and taken answer alike ("unavailable"), so the check does not say a profile is there.
      if (problem) return reply({ ok: false, reason: problem === 'format' ? 'format' : 'unavailable', message: HANDLE_PROBLEM_COPY[problem] }, 200, request)
      if ((await store.takenHandles([handle])).has(handle)) return reply({ ok: false, reason: 'unavailable', message: HANDLE_PROBLEM_COPY.taken }, 200, request)
      return reply({ ok: true, handle, link: profileLinkText(handle) }, 200, request)
    }

    if (url.pathname === '/api/profile/image' && request.method === 'POST') {
      const slot = url.searchParams.get('slot')
      if (slot !== 'picture' && slot !== 'background') return reply({ error: 'Unknown slot' }, 400, request)
      if (!env.USER_BOOKS) return reply({ error: 'Uploads are unavailable' }, 503, request)
      const declared = Number(request.headers.get('content-length') || 0)
      if (declared > MAX_IMAGE_BYTES) return reply({ error: 'That picture is too large.' }, 413, request)
      const bytes = new Uint8Array(await request.arrayBuffer())
      if (bytes.length > MAX_IMAGE_BYTES) return reply({ error: 'That picture is too large.' }, 413, request)
      const jpeg = stripJpegMetadata(bytes)
      if (!jpeg || jpeg.width > MAX_IMAGE_SIDE || jpeg.height > MAX_IMAGE_SIDE) return reply({ error: 'Please choose a JPEG, PNG or WebP photo.' }, 415, request)
      const row = await ownProfile(store, user, null, random)
      await storeImage(env, store, row, slot, jpeg.bytes, 'image/jpeg', 'upload', random)
      const next = await store.getOwn(user.id) ?? row
      return reply({ enabled: true, available: true, profile: selfView(next, await accountState(store, user, now), user, photoUploadsOn(env)) }, 200, request)
    }

    if (url.pathname === '/api/profile/google-photo' && request.method === 'POST') {
      const source = googlePhotoUrl(user)
      if (!source) return reply({ error: 'No Google photo on this account.' }, 404, request)
      if (!env.USER_BOOKS) return reply({ error: 'Uploads are unavailable' }, 503, request)
      const res = await fetch(source)
      if (!res.ok) return reply({ error: 'Google photo could not be read.' }, 502, request)
      const raw = new Uint8Array(await res.arrayBuffer())
      if (raw.length > MAX_IMAGE_BYTES) return reply({ error: 'Google photo could not be read.' }, 502, request)
      const type = sniffImage(raw)
      if (!type) return reply({ error: 'Google photo could not be read.' }, 502, request)
      const bytes = type === 'image/jpeg' ? stripJpegMetadata(raw)?.bytes ?? null : raw
      if (!bytes) return reply({ error: 'Google photo could not be read.' }, 502, request)
      const row = await ownProfile(store, user, null, random)
      await storeImage(env, store, row, 'picture', bytes, type, 'google', random)
      const next = await store.getOwn(user.id) ?? row
      return reply({ enabled: true, available: true, profile: selfView(next, await accountState(store, user, now), user, photoUploadsOn(env)) }, 200, request)
    }

    if (url.pathname === '/api/profile/confirm-link' && request.method === 'POST') {
      return await sendConfirmLink(request, store, user, deps, now)
    }

    return notFound(request)
  } catch (error) {
    if (error instanceof ProfilesUnavailable) {
      // The SQL has not run (or the database is down): say so; pages keep today's behaviour.
      console.warn(JSON.stringify({ event: 'profiles_unavailable', detail: error.message }))
      return reply({ enabled: true, available: false }, url.pathname === '/api/profile' && request.method === 'GET' ? 200 : 503, request)
    }
    throw error
  }
}

/**
 * "Send confirmation link". Takes no address: the link goes only to the
 * signed-in reader's own address (profiles.email, which the link is bound to,
 * and only while it is the address they signed in with). Every outcome that is
 * not "already confirmed", "too soon" or "cannot send" answers the same
 * { ok: true }, so the reply never says anything about an address.
 */
async function sendConfirmLink(request: Request, store: ProfileStore, user: ProfileAuthUser, deps: ProfileDeps, now: Date): Promise<Response> {
  const account = await accountState(store, user, now)
  if (account.emailConfirmed) return reply({ ok: true, confirmed: true }, 200, request)
  if (!deps.sendConfirmLink || !deps.confirmLinkAllowed) return reply({ error: 'Unavailable' }, 503, request)
  const row = await store.getAccount(user.id)
  const to = typeof row?.email === 'string' ? row.email.trim() : ''
  if (!to || to.toLowerCase() !== String(user.email || '').trim().toLowerCase()) return reply({ ok: true }, 200, request)
  if (!await deps.confirmLinkAllowed(user.id)) return reply({ error: 'Too many requests' }, 429, request)
  if (!await deps.sendConfirmLink(to, user.id)) return reply({ error: 'Unavailable' }, 503, request)
  return reply({ ok: true }, 200, request)
}

/**
 * The confirmation email at sign-up (routes/confirmLink.ts): once, for a new
 * email-and-password account whose address is not confirmed (Google accounts
 * are confirmed by accountState first and never get here). Reserved in
 * email_log before sending; a failed send releases the reservation so a later
 * read may try again. Never throws: the profile and the sign-up never wait on
 * or fail with the email.
 */
async function sendSignUpConfirmation(store: ProfileStore, user: ProfileAuthUser, deps: ProfileDeps, now: Date): Promise<void> {
  try {
    if (isGoogleAccount(user) || !deps.sendConfirmLink || !store.reserveEmail) return
    const created = Date.parse(String(user.created_at ?? ''))
    if (!Number.isFinite(created) || now.getTime() - created > SIGNUP_CONFIRM_WINDOW_MS) return
    const account = await store.getAccount(user.id)
    if (!account || account.email_confirmed_at) return
    const to = typeof account.email === 'string' ? account.email.trim() : ''
    if (!to || to.toLowerCase() !== String(user.email || '').trim().toLowerCase()) return
    if (!await store.reserveEmail(user.id, SIGNUP_CONFIRM_TEMPLATE, SIGNUP_CONFIRM_DEDUPE_KEY)) return
    let sent = false
    try {
      sent = await deps.sendConfirmLink(to, user.id)
    } finally {
      if (!sent) await store.releaseEmail?.(user.id, SIGNUP_CONFIRM_DEDUPE_KEY)
    }
  } catch (error) {
    console.warn(JSON.stringify({ event: 'signup_confirm_email_failed', detail: error instanceof Error ? error.message : 'failed' }))
  }
}

/** The relationship-aware view of one profile (ship 3's page and lists use this). */
export async function viewFor(store: ProfileStore, ownerId: string, viewerId: string | null) {
  if (viewerId === ownerId) {
    const own = await store.getOwn(ownerId)
    if (!own) return null
    const account = await store.getAccount(ownerId)
    return publicProfileView(cardFromOwn(own, Boolean(account?.email_confirmed_at)), 'self')
  }
  const card = await store.getCardById(ownerId)
  if (!card && !viewerId) return null
  const rel = viewerId ? await store.relation(viewerId, ownerId) : null
  const relation = rel ? relationOf({ self: false, ...rel }) : 'stranger'
  if (card) return publicProfileView(cardFromPublic(card), relation)
  // No public card (Only me, or hidden): only a reader who follows the viewer
  // shows, as the follower view (name and link), so the viewer can remove or block them.
  if (!rel || rel.blocked || !rel.ownerFollowsViewer) return null
  const own = await store.getOwn(ownerId)
  return own ? publicProfileView({ ...cardFromOwn(own, false), visibility: 'only_me' }, relation) : null
}

function cardFromOwn(row: ReaderProfileRow, emailConfirmed: boolean): ProfileCard {
  return {
    handle: row.handle, displayName: row.display_name,
    pictureKind: row.picture_kind, pictureValue: row.picture_value, pictureReview: row.picture_review,
    backgroundKind: row.background_kind, backgroundValue: row.background_value, backgroundReview: row.background_review,
    visibility: row.visibility, emailConfirmed,
    showReading: row.show_reading, showTime: row.show_time, onLeaderboard: row.on_leaderboard,
  }
}

/** The view already applied the owner's choices; reviews there are approved or replaced. */
function cardFromPublic(row: { handle: string; display_name: string; picture_kind: ProfileCard['pictureKind']; picture_value: string | null; background_kind: ProfileCard['backgroundKind']; background_value: string | null; visibility: Visibility; show_reading: boolean; show_time: boolean; on_leaderboard: boolean }): ProfileCard {
  return {
    handle: row.handle, displayName: row.display_name,
    pictureKind: row.picture_kind, pictureValue: row.picture_value, pictureReview: 'approved',
    backgroundKind: row.background_kind, backgroundValue: row.background_value, backgroundReview: 'approved',
    visibility: row.visibility, emailConfirmed: true,
    showReading: row.show_reading, showTime: row.show_time, onLeaderboard: row.on_leaderboard,
  }
}

async function optionalViewer(request: Request, deps: ProfileDeps): Promise<string | null> {
  if (!request.headers.get('authorization')) return null
  const user = await deps.verifyUser(request)
  return user && isValidUUID(user.id) ? user.id : null
}

async function handlePublicProfile(request: Request, url: URL, env: ProfilesEnv, store: ProfileStore, deps: ProfileDeps): Promise<Response> {
  if (request.method !== 'GET') return notFound(request)
  const handle = normalizeHandle(decodeURIComponent(url.pathname.slice('/api/profiles/'.length)))
  if (handleProblem(handle) === 'format') return notFound(request)
  const viewer = await optionalViewer(request, deps)
  let ownerId: string | null = null
  if (viewer) {
    const own = await store.getOwn(viewer)
    if (own?.handle === handle) ownerId = viewer
  }
  if (!ownerId) ownerId = (await store.getCardByHandle(handle))?.id ?? null
  if (!ownerId) return notFound(request)
  const view = await viewFor(store, ownerId, viewer)
  if (!view) return notFound(request)
  const stored = view.picture.kind === 'upload' || view.picture.kind === 'google'
  const response = reply({
    profile: {
      ...view,
      link: profileLinkText(view.handle),
      picture: { kind: view.picture.kind, value: stored ? null : view.picture.value, url: stored ? imageUrl(ownerId, 'picture', view.picture.value) : null },
      background: view.background && { kind: view.background.kind, value: view.background.kind === 'upload' ? null : view.background.value, url: view.background.kind === 'upload' ? imageUrl(ownerId, 'background', view.background.value) : null },
    },
  }, 200, request)
  response.headers.set('X-Robots-Tag', 'noindex, noarchive')
  return response
}

async function serveImage(request: Request, url: URL, env: ProfilesEnv, store: ProfileStore, deps: ProfileDeps): Promise<Response> {
  const owner = url.searchParams.get('user') || ''
  const slot = url.searchParams.get('slot')
  const token = url.searchParams.get('v') || ''
  if (!isValidUUID(owner) || (slot !== 'picture' && slot !== 'background') || !/^[a-f0-9]{8,64}$/.test(token) || !env.USER_BOOKS) return notFound(request)
  const viewer = await optionalViewer(request, deps)
  const view = await viewFor(store, owner, viewer)
  if (!view) return notFound(request)
  // Only the photo currently shown to this viewer: for others that means approved.
  const shown = slot === 'picture'
    ? (view.picture.kind === 'upload' || view.picture.kind === 'google') && view.picture.value === token
    : view.background?.kind === 'upload' && view.background.value === token
  if (!shown) return notFound(request)
  const object = await env.USER_BOOKS.get(imageKey(owner, slot, token))
  if (!object) return notFound(request)
  return new Response(object.body, {
    headers: {
      ...corsHeaders(request),
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, noarchive',
    },
  })
}

/** Account deletion and export (routes/adminAccounts.ts): every stored photo of one reader. */
export const PROFILE_IMAGE_PREFIX = (userId: string) => `profile/${userId}/`

/** Every stored profile photo of one reader (picture, background, Google copy). */
export async function listProfileImages(bucket: R2Bucket, userId: string): Promise<{ key: string; size: number; uploaded: string }[]> {
  const page = await bucket.list({ prefix: PROFILE_IMAGE_PREFIX(userId), limit: 1000 })
  return page.objects.map((object: { key: string; size: number; uploaded: Date }) => ({ key: object.key, size: object.size, uploaded: object.uploaded.toISOString() }))
}

export async function purgeProfileImages(bucket: R2Bucket, userId: string): Promise<number> {
  let removed = 0
  for (let round = 0; round < 100; round++) {
    const page = await bucket.list({ prefix: PROFILE_IMAGE_PREFIX(userId), limit: 1000 })
    const keys = page.objects.map((object: { key: string }) => object.key).filter((key: string) => key.startsWith(PROFILE_IMAGE_PREFIX(userId)))
    if (!keys.length) return removed
    await bucket.delete(keys)
    removed += keys.length
  }
  throw new Error('profile images purge did not finish')
}
