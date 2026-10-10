/**
 * Social (ship 3): follows, the Friends and Everyone leaderboards, Find, the
 * public profile page at tinct.app/@handle, reports, the reading card and the
 * admin view. Everything here answers only while the Worker vars
 * SOCIAL_FRIENDS and SOCIAL_PROFILES are both "1"; off, worker.ts never calls
 * in and every URL behaves exactly as before.
 *
 *   GET  /api/social/board?tab=friends|everyone   the leaderboard (last 7 days); Everyone only once open
 *   GET  /api/social/rank                          "#N among friends" for the sheet and You
 *   GET  /api/social/find[?q=]                     search Everyone readers; Following you; Also reading your books
 *   GET  /api/social/profile/{handle}              one profile as this visitor may see it
 *   POST /api/social/follow|unfollow|remove-follower|block  { handle }
 *   POST /api/social/unblock                       { id }
 *   GET  /api/social/blocked                       readers you blocked
 *   POST /api/social/report                        { handle, reason }
 *   POST /api/social/card                          { bookId } -> PNG "Finished {book} · {hours}"
 *   GET  /@{handle}                                the public profile page (noindex)
 *   GET  /admin/social                             the admin page (/friends redirects to the account cards)
 *   GET|POST /api/admin/social…                    admin view: rename, hide, reports, photo review
 *
 * Who sees what is decided here, in profileRules.publicProfileView and in
 * public_profile_cards, and app/public/privacy.html ("Your profile") binds it:
 * Only me and hidden profiles never appear, and a Friends profile shows only
 * to friends (to anyone else, signed in or out, it is Not found, like Only
 * me); a reader who follows you is always listed to you (by name and link,
 * with the initial) so you can remove or block them; following works from a
 * link before the profile shows, and the answer never tells a Friends, Only
 * me or missing profile apart; blocked readers never see each other in
 * either direction; the leaderboard is opt-in and shows name, picture and
 * time only; Find only lists Everyone.
 * Tinct's internal and test accounts never appear on a board, and the Everyone
 * board exists only once EVERYONE_BOARD_MIN_READERS real readers are on it
 * (Anders, 8 October 2026): below that the API serves no Everyone board and
 * every response says `everyoneOpen: false`, so the page shows no Everyone tab.
 * Never returned: email, highlights, notes, chats, Talk.
 */
import {
  HANDLE_PROBLEM_COPY,
  backgroundView,
  cleanDisplayName,
  handleProblem,
  initialOf,
  normalizeHandle,
  pictureView,
  profileLinkText,
  relationOf,
  type PublicProfileView,
  type Relation,
} from '../../social/profileRules'
import {
  EVERYONE_COUNT_TTL_MS,
  LEADERBOARD_STALE_MS,
  REPORT_REASONS,
  appearsOnBoard,
  everyoneBoardOpen,
  finishedCardLine,
  leaderboardWindow,
  mutualFriends,
  parseFindQuery,
  rankRows,
  socialFriendsOn,
  windowSeconds,
  type Board,
  type BoardCard,
  type ReportReason,
} from '../../social/socialRules'
import { followButtonHtml, profileDocument, profileMissingHtml, type ProfileBook, type ProfilePageData, type ProfilePicture } from '../../social/profilePageView'
import { finishedBookIds, formatDuration, readingTimeStats, type LedgerRow } from '../../readingTime/model'
import { chapterNumbersOf, yourReadingView, type CatalogueEntry } from '../../readingTime/yourReading'
import { isShareableBookId } from '../../readingTime/privateBook'
import { INDEX_KEY, bucketOf, readJson as readBucketJson, type PublicBooksEnv } from './publicBooks'
import type { LabPositionState } from '../../lab/labPosition'
import { GENERATED_BOOK_META } from '../../data/bookMetaGenerated'
import { corsHeaders } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { ProfilesUnavailable, supabaseProfileStore, type ProfileStore, type ReaderProfileRow } from '../lib/profileStore'
import { SocialUnavailable, supabaseSocialStore, type AdminProfileRow, type SocialStore } from '../lib/socialStore'
import { imageUrl, viewFor, type ProfileAuthUser, type ProfilesEnv } from './profiles'
import { loadLedger } from './readingTime'
import { createLifecycleDeps } from '../lifecycle/runtime'
import { SECURITY_HEADERS } from './seo'
import { SOCIAL_META } from './socialPages'

export type SocialEnv = ProfilesEnv & Pick<PublicBooksEnv, 'PUBLIC_BOOKS' | 'AUDIO_BUCKET'> & {
  SOCIAL_FRIENDS?: string
  RATE_LIMIT?: KVNamespace
  READER_POSITION?: DurableObjectNamespace<import('../readerPositionCoordinator').ReaderPositionCoordinator>
  ASSETS?: { fetch: (request: Request) => Promise<Response> }
}

export type SocialTrack = (name: 'follow' | 'unfollow', userId: string, props?: Record<string, string>) => void

export interface SocialDeps {
  verifyUser: (request: Request) => Promise<ProfileAuthUser | null>
  verifySiteAdmin: (request: Request) => Promise<boolean>
  profiles?: ProfileStore
  social?: SocialStore
  now?: () => number
  catalogue?: () => Promise<Map<string, CatalogueEntry>>
  position?: (userId: string) => Promise<LabPositionState | null>
  ledger?: (userId: string) => Promise<LedgerRow[]>
  checkRateLimit?: (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>
  track?: SocialTrack
  /** The Everyone threshold (tests only; EVERYONE_BOARD_MIN_READERS otherwise). */
  everyoneMinReaders?: number
  /** The reading card's PNG (tests pass a stand-in; the Worker draws it with resvg). */
  renderCard?: (input: FinishedCardInput) => Promise<Uint8Array>
}

export interface FinishedCardInput { title: string; author: string; duration: string | null; link: string; cover: string | null; finished: boolean }

/** The public paths this module answers while switched on. */
export const ADMIN_SOCIAL_PATHS = new Set(['/admin/social', '/admin/social/'])

export function isSocialApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/social/') || pathname === '/api/admin/social' || pathname.startsWith('/api/admin/social/')
}

/** `/@anders` -> "anders" (any case; one trailing slash). */
export function profileHandleFromPath(pathname: string): string | null {
  const match = /^\/@([A-Za-z0-9_.]{1,40})\/?$/.exec(pathname)
  return match ? normalizeHandle(match[1]) : null
}

/** The static page behind /admin/social is not a page while the switch is off. */
export function isSocialAssetPage(pathname: string): boolean {
  return /^\/lab\/admin-social(?:\/(?:index\.html)?)?$/.test(pathname)
}

export const FRIENDS_META = '<meta name="tinct-friends" content="1">'

const BOOK_IDS = Object.keys(GENERATED_BOOK_META)
const BOARD_LIMIT = 50
const EVERYONE_POOL = 1000

function reply(data: unknown, status: number, request: Request): Response {
  return Response.json(data, { status, headers: { ...corsHeaders(request), 'Cache-Control': 'private, no-store' } })
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const text = await request.text()
    if (text.length > 4096) return null
    const body = JSON.parse(text)
    return body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null
  } catch {
    return null
  }
}

interface Context {
  env: SocialEnv
  deps: SocialDeps
  profiles: ProfileStore
  social: SocialStore
  now: number
}

function context(env: SocialEnv, deps: SocialDeps): Context {
  return {
    env,
    deps,
    profiles: deps.profiles ?? supabaseProfileStore(env),
    social: deps.social ?? supabaseSocialStore(env),
    now: deps.now?.() ?? Date.now(),
  }
}

/**
 * The library catalogue plus the public-domain books readers added (`pd-…`,
 * routes/publicBooks.ts), so those show by title like any library book. A
 * reader's own books are in neither: they show only as "a private book".
 */
export function withAddedBooks(base: ReadonlyMap<string, CatalogueEntry>, added: unknown): Map<string, CatalogueEntry> {
  const map = new Map(base)
  for (const entry of Array.isArray(added) ? added as CatalogueEntry[] : []) {
    if (entry && typeof entry.id === 'string' && entry.id.startsWith('pd-') && typeof entry.title === 'string' && !map.has(entry.id)) map.set(entry.id, entry)
  }
  return map
}

/** The catalogue (the library's books plus added books), kept a few minutes per Worker isolate. */
const CATALOGUE_TTL_MS = 5 * 60 * 1000
let catalogueMemo: { at: number; value: Promise<Map<string, CatalogueEntry>> } | null = null

async function catalogueOf(ctx: Context): Promise<Map<string, CatalogueEntry>> {
  if (ctx.deps.catalogue) return ctx.deps.catalogue()
  const now = Date.now()
  if (catalogueMemo && now - catalogueMemo.at < CATALOGUE_TTL_MS) return catalogueMemo.value
  const value = loadCatalogue(ctx)
  catalogueMemo = { at: now, value }
  value.catch(() => { if (catalogueMemo?.value === value) catalogueMemo = null })
  return value
}

async function loadCatalogue(ctx: Context): Promise<Map<string, CatalogueEntry>> {
  const base = await createLifecycleDeps(ctx.env as never).catalogue() as unknown as Map<string, CatalogueEntry>
  const bucket = bucketOf(ctx.env)
  if (!bucket) return base
  const index = await readBucketJson<{ books?: unknown }>(bucket, INDEX_KEY).catch(() => null)
  return withAddedBooks(base, index?.books)
}

async function positionOf(ctx: Context, userId: string): Promise<LabPositionState | null> {
  if (ctx.deps.position) return ctx.deps.position(userId)
  return createLifecycleDeps(ctx.env as never).position(userId)
}

async function ledgerOf(ctx: Context, userId: string): Promise<LedgerRow[] | null> {
  try {
    return await (ctx.deps.ledger ? ctx.deps.ledger(userId) : loadLedger(ctx.env, userId))
  } catch {
    return null
  }
}

// ===== Pictures =====

type PictureSource = { kind: PublicProfileView['picture']['kind']; value: string | null }

function pictureFor(ownerId: string, picture: PictureSource, name: string, signedOutView: boolean): ProfilePicture {
  const stored = picture.kind === 'upload' || picture.kind === 'google'
  const view = pictureView(picture.kind, picture.value, name, stored ? imageUrl(ownerId, 'picture', picture.value) : null)
  if (view.kind === 'initial') return { src: null, pos: '50% 50%', cover: false, private: false, initial: view.initial }
  // A signed-out visitor only ever gets approved photos of profiles anyone may see: a plain URL works.
  return { src: view.src, pos: view.pos, cover: view.cover, private: Boolean(view.private) && !signedOutView, initial: initialOf(name) }
}

function bannerFor(ownerId: string, background: PublicProfileView['background'], signedOutView: boolean): { src: string; private: boolean } {
  const kind = background?.kind ?? 'library'
  const value = background?.value ?? null
  const view = backgroundView(kind, value, kind === 'upload' ? imageUrl(ownerId, 'background', value) : null)
  return { src: view.src, private: Boolean(view.private) && !signedOutView }
}

/** A board or Find row's picture (cards from the view: unapproved photos are already the initial). */
function cardPicture(card: Pick<BoardCard, 'id' | 'picture_kind' | 'picture_value' | 'display_name'>): ProfilePicture {
  return pictureFor(card.id, { kind: card.picture_kind, value: card.picture_value }, card.display_name, false)
}

// ===== Relations =====

interface Circle { following: Set<string>; followers: Set<string>; friends: Set<string>; blocked: Set<string> }

async function circleOf(ctx: Context, userId: string): Promise<Circle> {
  const [following, followers, blocked] = await Promise.all([
    ctx.social.following(userId), ctx.social.followers(userId), ctx.social.blockedEitherWay(userId),
  ])
  const visibleFollowing = following.filter(id => !blocked.has(id))
  const visibleFollowers = followers.filter(id => !blocked.has(id))
  return {
    following: new Set(visibleFollowing),
    followers: new Set(visibleFollowers),
    friends: mutualFriends(visibleFollowing, visibleFollowers),
    blocked,
  }
}

function relationIn(circle: Circle, id: string): Relation {
  return relationOf({ self: false, viewerFollowsOwner: circle.following.has(id), ownerFollowsViewer: circle.followers.has(id), blocked: circle.blocked.has(id) })
}

// ===== The leaderboard =====

// The count of real Everyone readers, reused for a few minutes per Worker isolate
// (per store in tests). Unknown (the count failed) is not cached and keeps Everyone closed.
const SHARED_STORE = {}
const everyoneCounts = new WeakMap<object, { count: number; at: number }>()

/** Whether the Everyone board is offered now: at least EVERYONE_BOARD_MIN_READERS real readers on it. */
export async function everyoneOpen(ctx: Context): Promise<boolean> {
  const key = ctx.deps.social ?? SHARED_STORE
  const cached = everyoneCounts.get(key)
  let count: number | null = cached && ctx.now - cached.at >= 0 && ctx.now - cached.at < EVERYONE_COUNT_TTL_MS ? cached.count : null
  if (count === null) {
    try {
      count = await ctx.social.everyoneReaderCount()
      everyoneCounts.set(key, { count, at: ctx.now })
    } catch (error) {
      console.warn(JSON.stringify({ event: 'everyone_count_failed', detail: error instanceof Error ? error.message : 'failed' }))
    }
  }
  return everyoneBoardOpen(count, ctx.deps.everyoneMinReaders)
}

async function freshBoard(ctx: Context): Promise<string | null> {
  let refreshedAt = await ctx.social.boardRefreshedAt()
  const age = refreshedAt ? ctx.now - Date.parse(refreshedAt) : Infinity
  if (!(age < LEADERBOARD_STALE_MS)) {
    try {
      await ctx.social.refreshBoard()
      refreshedAt = new Date(ctx.now).toISOString()
    } catch (error) {
      console.warn(JSON.stringify({ event: 'leaderboard_refresh_failed', detail: error instanceof Error ? error.message : 'failed' }))
    }
  }
  return refreshedAt
}

/**
 * One leaderboard row. The privacy notice: on the leaderboard other readers
 * see only your name, picture and reading time over the last 7 days. So a row
 * carries exactly that (the time as seconds and as a plain duration, and the
 * rank it gives) plus `me` for the viewer's own row: no handle, id or book.
 */
export interface BoardEntry {
  rank: number
  name: string
  picture: ProfilePicture
  seconds: number
  duration: string
  me: boolean
}

export async function buildBoard(ctx: Context, viewerId: string, tab: Board, open = false): Promise<{ tab: Board; window: { start: string; end: string }; refreshedAt: string | null; total: number; me: BoardEntry | null; meShown: boolean; everyoneOpen: boolean; entries: BoardEntry[] }> {
  const circle = await circleOf(ctx, viewerId)
  const refreshedAt = await freshBoard(ctx)
  const pool = tab === 'friends' ? await ctx.social.cardsByIds([...circle.friends]) : await ctx.social.everyoneBoardCards(EVERYONE_POOL)
  const others = pool.filter(card => card.id !== viewerId && appearsOnBoard(card, tab, circle))
  const own = await ctx.profiles.getOwn(viewerId)
  const seconds = await ctx.social.boardSeconds([viewerId, ...others.map(card => card.id)])
  type Row = { name: string; picture: ProfilePicture; seconds: number; me: boolean }
  const rows: Row[] = others
    // Everyone lists readers with time this week; Friends lists every friend on the board.
    .filter(card => tab === 'friends' || (seconds.get(card.id) ?? 0) > 0)
    .map(card => ({ name: card.display_name, picture: cardPicture(card), seconds: seconds.get(card.id) ?? 0, me: false }))
  if (own) {
    rows.push({
      name: own.display_name,
      picture: pictureFor(viewerId, { kind: own.picture_kind, value: own.picture_value }, own.display_name, false),
      seconds: seconds.get(viewerId) ?? 0, me: true,
    })
  }
  const ranked = rankRows(rows, row => row.seconds, row => row.name)
  const shown = ranked.slice(0, BOARD_LIMIT)
  const meRanked = ranked.find(item => item.row.me) ?? null
  const entry = (item: typeof ranked[number]): BoardEntry => ({
    rank: item.rank, name: item.row.me ? 'You' : item.row.name, picture: item.row.picture,
    seconds: item.seconds, duration: formatDuration(item.seconds), me: item.row.me,
  })
  const window = leaderboardWindow(ctx.now)
  // Whether others see the viewer on this board (the page explains when they do not).
  const ownCard = own ? (await ctx.social.cardsByIds([viewerId]).catch(() => []))[0] ?? null : null
  const meShown = Boolean(ownCard && ownCard.on_leaderboard && ownCard.show_time && ownCard.internal !== true && (tab === 'friends' || ownCard.visibility === 'everyone'))
  return { tab, window: { start: window.start, end: window.end }, refreshedAt, total: ranked.length, me: meRanked ? entry(meRanked) : null, meShown, everyoneOpen: open, entries: shown.map(entry) }
}

// ===== Find =====

function findRow(card: BoardCard, circle: Circle, book: string | null = null) {
  return {
    handle: card.handle, name: card.display_name, link: profileLinkText(card.handle), picture: cardPicture(card),
    relation: relationIn(circle, card.id), book,
  }
}

/**
 * Following you: the people who follow you are always listed to you, so you
 * can follow back, remove or block any of them (privacy notice: "You can
 * remove a follower or block a reader at any time"). An Everyone reader shows
 * with their card until you follow back (then they are a friend on the board).
 * A follower whose profile you may not otherwise see (Friends before you
 * follow back, Only me, hidden) shows as the follower view: their name and
 * link with the initial, never their picture or reading. Only me and hidden
 * followers stay listed after you follow back, since no board shows them.
 */
async function followingYouRows(ctx: Context, circle: Circle) {
  const followers = [...circle.followers].slice(0, FOLLOWER_LOOKUP_LIMIT)
  const cards = followers.length ? await ctx.social.cardsByIds(followers) : []
  const followerRow = (id: string, handle: string, name: string) => ({
    handle, name, link: profileLinkText(handle), picture: pictureFor(id, { kind: 'initial', value: null }, name, false), relation: relationIn(circle, id), book: null,
  })
  const rows = cards
    .filter(card => !circle.following.has(card.id))
    .map(card => card.visibility === 'everyone' ? findRow(card, circle) : followerRow(card.id, card.handle, card.display_name))
  const cardless = await cardlessFollowers(ctx, followers, cards)
  return [...rows, ...cardless.map(row => followerRow(row.id, row.handle, row.display_name))]
}

async function buildFind(ctx: Context, viewerId: string, q: string | null) {
  const circle = await circleOf(ctx, viewerId)
  const query = parseFindQuery(q)
  if (q !== null) {
    if (!query) return { results: [] }
    const cards = await ctx.social.searchEveryone(query, 20)
    return { results: cards.filter(card => card.id !== viewerId && !circle.blocked.has(card.id)).map(card => findRow(card, circle)) }
  }
  const followingYou = await followingYouRows(ctx, circle)
  // Also reading your books: Everyone readers who show what they read, in the last 30 days.
  const since = leaderboardWindow(ctx.now - 23 * 86_400_000).start
  const mine = await ctx.social.ledgerSince([viewerId], since, undefined, 500).catch(() => [])
  // Only real books are matched: never the private bucket of the reader's own books, nor time from before the ledger.
  const myBooks = [...new Set(mine.map(row => row.book_id).filter(isShareableBookId))].slice(0, 20)
  const others = myBooks.length ? await ctx.social.ledgerSince(null, since, myBooks, 1000).catch(() => []) : []
  const latest = new Map<string, { bookId: string; day: string }>()
  for (const row of others) {
    if (row.user_id === viewerId || circle.blocked.has(row.user_id) || !isShareableBookId(row.book_id)) continue
    const known = latest.get(row.user_id)
    if (!known || row.day > known.day) latest.set(row.user_id, { bookId: row.book_id, day: row.day })
  }
  const candidates = [...latest.keys()].slice(0, 100)
  const cards = candidates.length ? await ctx.social.cardsByIds(candidates) : []
  const catalogue = cards.length ? await catalogueOf(ctx).catch(() => new Map<string, CatalogueEntry>()) : new Map<string, CatalogueEntry>()
  const also = cards
    .filter(card => card.visibility === 'everyone' && card.show_reading && !circle.blocked.has(card.id))
    .sort((a, b) => Number(circle.following.has(a.id)) - Number(circle.following.has(b.id)) || (latest.get(b.id)!.day).localeCompare(latest.get(a.id)!.day))
    .slice(0, 10)
  const alsoRows = await Promise.all(also.map(async card => {
    const { bookId } = latest.get(card.id)!
    const title = catalogue.get(bookId)?.title ?? null
    let chapter: string | null = null
    try {
      const place = (await positionOf(ctx, card.id))?.books?.[bookId] as { sequentialChapter?: number } | undefined
      if (place?.sequentialChapter) chapter = `chapter ${place.sequentialChapter}`
    } catch { /* the title alone */ }
    return findRow(card, circle, title ? [title, chapter].filter(Boolean).join(' · ') : null)
  }))
  const own = await ctx.profiles.getOwn(viewerId)
  return {
    followingYou,
    alsoReading: alsoRows.filter(row => row.book),
    link: own ? profileLinkText(own.handle) : null,
  }
}

// ===== One profile =====

/**
 * Whose handle this is: the viewer's own, a public card's (Friends or
 * Everyone, not hidden), or one of the viewer's followers, whatever their
 * visibility. Nothing else: an Only me or hidden profile is found only by the
 * readers it follows, so no one can probe for them.
 */
async function ownerIdFor(ctx: Context, handle: string, viewerId: string | null): Promise<string | null> {
  // The viewer's own row and the public card are asked for at once (each is a database round trip).
  const [own, card] = await Promise.all([
    viewerId ? ctx.profiles.getOwn(viewerId) : Promise.resolve(null),
    ctx.profiles.getCardByHandle(handle),
  ])
  if (viewerId && own?.handle === handle) return viewerId
  if (card) return card.id
  return viewerId ? followerByHandle(ctx, viewerId, handle) : null
}

const FOLLOWER_LOOKUP_LIMIT = 50

/** The viewer's followers that have no public card (Only me or hidden), with their own rows. */
async function cardlessFollowers(ctx: Context, followers: string[], cards?: BoardCard[]): Promise<ReaderProfileRow[]> {
  if (!followers.length) return []
  const carded = new Set((cards ?? await ctx.social.cardsByIds(followers)).map(card => card.id))
  const rows = await Promise.all(followers.filter(id => !carded.has(id)).slice(0, FOLLOWER_LOOKUP_LIMIT).map(id => ctx.profiles.getOwn(id).catch(() => null)))
  return rows.filter(Boolean) as ReaderProfileRow[]
}

async function followerByHandle(ctx: Context, viewerId: string, handle: string): Promise<string | null> {
  const blocked = await ctx.social.blockedEitherWay(viewerId)
  const followers = (await ctx.social.followers(viewerId)).filter(id => !blocked.has(id))
  return (await cardlessFollowers(ctx, followers)).find(row => row.handle === handle)?.id ?? null
}

/** One profile as this visitor may see it, or null (missing, Only me, hidden, blocked). */
export async function buildProfile(ctx: Context, handle: string, viewerId: string | null): Promise<ProfilePageData | null> {
  if (handleProblem(handle) === 'format') return null
  const ownerId = await ownerIdFor(ctx, handle, viewerId)
  if (!ownerId) return null
  // Everything the page may show is asked for at once, alongside the
  // visibility check; nothing of it reaches the page unless the check allows
  // it. (One after another this was five or six round trips: 2.5-5 s.)
  const later = <T>(promise: Promise<T>): Promise<T | null> => promise.catch(() => null)
  const ledger = later(ledgerOf(ctx, ownerId))
  const shelfData = Promise.all([catalogueOf(ctx).catch(() => new Map<string, CatalogueEntry>()), later(positionOf(ctx, ownerId))])
  const [view, rel] = await Promise.all([
    viewFor(ctx.profiles, ownerId, viewerId),
    viewerId && viewerId !== ownerId ? ctx.profiles.relation(viewerId, ownerId) : Promise.resolve(null),
  ])
  if (!view) return null
  let relation: Relation | null = null
  let followsYou = false
  if (viewerId) {
    if (viewerId === ownerId) relation = 'self'
    else if (rel) {
      relation = relationOf({ self: false, ...rel })
      followsYou = rel.ownerFollowsViewer
      if (relation === 'blocked') return null
    }
  }
  const signedOut = viewerId === null
  const data: ProfilePageData = {
    handle: view.handle, name: view.name, link: profileLinkText(view.handle),
    picture: pictureFor(ownerId, view.picture, view.name, signedOut),
    banner: bannerFor(ownerId, view.background, signedOut),
    relation, followsYou, limited: view.limited, time: null, readingNow: null, finished: null,
  }
  if (view.limited || (!view.shows.time && !view.shows.reading)) return data
  const rows = await ledger
  if (rows && view.shows.time) {
    const last7 = windowSeconds(rows.map(row => ({ user_id: ownerId, day: row.day, book_id: row.bookId, read_seconds: row.read, listen_seconds: row.listen })), ctx.now).get(ownerId) ?? 0
    const year = String(new Date(ctx.now).getUTCFullYear())
    const yearSeconds = rows.filter(row => row.day.startsWith(`${year}-`)).reduce((sum, row) => sum + row.read + row.listen, 0)
    data.time = { last7: formatDuration(last7), year: formatDuration(yearSeconds) }
  }
  if (view.shows.reading) {
    const [catalogue, position] = await shelfData
    const stats = readingTimeStats(rows ?? [], new Date(ctx.now).toISOString().slice(0, 10))
    const shelf = yourReadingView({ stats, positions: position, catalogue })
    const toBook = (book: { bookId: string; title: string; cover: string | null; progress: string | null; hours: string | null }): ProfileBook => ({
      bookId: book.bookId, title: book.title, cover: book.cover, progress: book.progress, hours: view.shows.time ? book.hours : null,
    })
    data.readingNow = shelf.readingNow.slice(0, 6).map(toBook)
    data.finished = shelf.finished.slice(0, 24).map(toBook)
  }
  return data
}

// ===== Pages =====

function pageHeaders(): Record<string, string> {
  return {
    ...SECURITY_HEADERS,
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }
}

function signedInCookie(request: Request): boolean {
  return (request.headers.get('cookie') || '').split(';').some(part => part.trim() === 'tinct_auth=1')
}

/** GET /@handle: Worker-rendered, noindex, with the reader's banner. */
export async function serveProfilePage(request: Request, env: SocialEnv, deps: SocialDeps, handle: string): Promise<Response> {
  const ctx = context(env, deps)
  const markers = `${SOCIAL_META}${FRIENDS_META}`
  // A signed-in visitor gets an empty page that their own script fills in (with their follow
  // state), so a reader they blocked, or who blocked them, never flashes into view.
  if (signedInCookie(request)) {
    return new Response(request.method === 'HEAD' ? null : profileDocument(null, { handle, loading: true, markers }), { headers: pageHeaders() })
  }
  let data: ProfilePageData | null = null
  try {
    data = await buildProfile(ctx, handle, null)
  } catch (error) {
    if (!(error instanceof ProfilesUnavailable || error instanceof SocialUnavailable)) throw error
  }
  const html = data
    ? profileDocument(data, { handle, loading: false, markers })
    // The same page for every handle nobody may see: Follow (signing in) for any well-formed link.
    : profileDocument(null, { handle, loading: false, markers }).replace('<main data-main></main>', `<main data-main>${profileMissingHtml(handleProblem(handle) === 'format' ? undefined : followButtonHtml({ relation: null, handle }))}</main>`)
  return new Response(request.method === 'HEAD' ? null : html, { status: data ? 200 : 404, headers: pageHeaders() })
}

/** /admin/social, from its static page, with the switch markers. */
export async function serveSocialAssetPage(request: Request, env: { ASSETS: { fetch: (request: Request) => Promise<Response> } }, assetPath: string): Promise<Response | null> {
  const url = new URL(request.url)
  const asset = await env.ASSETS.fetch(new Request(new URL(assetPath, url.origin).toString(), { method: request.method }))
  if (!asset.ok) return null
  const html = request.method === 'HEAD' ? null : (await asset.text()).replace('</head>', `${SOCIAL_META}${FRIENDS_META}</head>`)
  const response = new Response(html, { status: 200, headers: pageHeaders() })
  response.headers.set('Cache-Control', 'no-store')
  return response
}

// ===== The reading card =====

export async function coverDataUri(env: SocialEnv, origin: string, src: string | null): Promise<string | null> {
  if (!src || !env.ASSETS || !/^\/[A-Za-z0-9_./-]+\.(?:jpe?g|png|webp)$/.test(src)) return null
  try {
    const res = await env.ASSETS.fetch(new Request(new URL(src, origin).toString()))
    if (!res.ok) return null
    const bytes = new Uint8Array(await res.arrayBuffer())
    if (bytes.length > 1_500_000) return null
    let binary = ''
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    const type = src.endsWith('.png') ? 'image/png' : src.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
    return `data:${type};base64,${btoa(binary)}`
  } catch {
    return null
  }
}

async function handleCard(request: Request, ctx: Context, viewerId: string): Promise<Response> {
  const body = await readJson(request)
  const bookId = typeof body?.bookId === 'string' && /^[a-z0-9-]{1,80}$/.test(body.bookId) ? body.bookId : null
  if (!bookId) return reply({ error: 'invalid_card' }, 400, request)
  if (ctx.deps.checkRateLimit && !(await ctx.deps.checkRateLimit(`reading-card:${viewerId}`, ctx.env.RATE_LIMIT, 6))) return reply({ error: 'rate_limited' }, 429, request)
  const catalogue = await catalogueOf(ctx).catch(() => new Map<string, CatalogueEntry>())
  const book = catalogue.get(bookId)
  if (!book) return reply({ error: 'unknown_book' }, 404, request)
  const rows = await ledgerOf(ctx, viewerId) ?? []
  const seconds = rows.filter(row => row.bookId === bookId).reduce((sum, row) => sum + row.read + row.listen, 0)
  const duration = seconds >= 60 ? formatDuration(seconds) : null
  // It links to the reader's public profile when others can see it, else to the book.
  const own = await ctx.profiles.getOwn(viewerId).catch(() => null)
  const link = own && own.visibility !== 'only_me' ? `https://${profileLinkText(own.handle)}` : `https://tinct.app/read/${bookId}`
  // "Finished" by the same rule as the library and Your reading (preReader/bookFinished.ts).
  const position = await positionOf(ctx, viewerId).catch(() => null)
  const finished = finishedBookIds(position?.finished, () => chapterNumbersOf(book)).includes(bookId)
  const origin = new URL(request.url).origin
  const input: FinishedCardInput = { title: book.title, author: (book as { author?: string }).author ?? '', duration, link, cover: await coverDataUri(ctx.env, origin, book.art?.src ?? null), finished }
  let png: Uint8Array
  try {
    png = ctx.deps.renderCard ? await ctx.deps.renderCard(input) : await (await import('../lib/readingCard')).renderFinishedCardPng(ctx.env.ASSETS!, origin, input)
  } catch (error) {
    console.warn(JSON.stringify({ event: 'finished_card_failed', reason: error instanceof Error ? error.message : 'failed' }))
    return reply({ error: 'unavailable' }, 503, request)
  }
  return new Response(png as unknown as BodyInit, {
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'image/png',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Card-Link': link,
      'X-Card-Line': encodeURIComponent(finishedCardLine(book.title, duration, finished)),
      'Access-Control-Expose-Headers': 'X-Card-Link, X-Card-Line',
    },
  })
}

// ===== Admin =====

function adminRow(row: AdminProfileRow) {
  const stored = (kind: string, value: string | null, slot: 'picture' | 'background') =>
    (kind === 'upload' || kind === 'google') && value ? `/api/admin/social/image?user=${row.id}&slot=${slot}&v=${encodeURIComponent(value)}` : null
  return {
    id: row.id, name: row.display_name, handle: row.handle, link: profileLinkText(row.handle), visibility: row.visibility, hidden: Boolean(row.hidden_at),
    picture: { kind: row.picture_kind, value: row.picture_kind === 'upload' || row.picture_kind === 'google' ? null : row.picture_value, review: row.picture_review, url: stored(row.picture_kind, row.picture_value, 'picture') },
    background: { kind: row.background_kind, value: row.background_kind === 'upload' ? null : row.background_value, review: row.background_review, url: stored(row.background_kind, row.background_value, 'background') },
    updatedAt: row.updated_at ?? null,
  }
}

async function handleAdmin(request: Request, url: URL, ctx: Context): Promise<Response> {
  if (!(await ctx.deps.verifySiteAdmin(request))) return reply({ error: 'Forbidden' }, 403, request)
  const path = url.pathname.replace(/\/+$/, '')
  if (path === '/api/admin/social' && request.method === 'GET') {
    const q = (url.searchParams.get('q') || '').slice(0, 60)
    const [pending, reports, profiles] = await Promise.all([
      ctx.social.pendingReviews(50), ctx.social.openReports(100), q ? ctx.social.adminProfiles(q, 30) : Promise.resolve([]),
    ])
    const reported = new Map<string, AdminProfileRow | null>()
    for (const report of reports) if (!reported.has(report.reported)) reported.set(report.reported, await ctx.social.adminProfile(report.reported))
    return reply({
      pending: pending.map(adminRow),
      reports: reports.map(report => ({ id: report.id, reason: report.reason, handle: report.handle, createdAt: report.created_at, profile: reported.get(report.reported) ? adminRow(reported.get(report.reported)!) : null })),
      profiles: profiles.map(adminRow),
    }, 200, request)
  }
  if (path === '/api/admin/social/image' && request.method === 'GET') {
    const owner = url.searchParams.get('user') || ''
    const slot = url.searchParams.get('slot')
    const token = url.searchParams.get('v') || ''
    if (!isValidUUID(owner) || (slot !== 'picture' && slot !== 'background') || !/^[a-f0-9]{8,64}$/.test(token) || !ctx.env.USER_BOOKS) return reply({ error: 'Not found' }, 404, request)
    const object = await ctx.env.USER_BOOKS.get(`profile/${owner}/${slot}-${token}`)
    if (!object) return reply({ error: 'Not found' }, 404, request)
    return new Response(object.body, { headers: { 'Content-Type': object.httpMetadata?.contentType || 'image/jpeg', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' } })
  }
  if (request.method !== 'POST') return reply({ error: 'Not found' }, 404, request)
  const body = await readJson(request)
  if (!body) return reply({ error: 'Invalid JSON' }, 400, request)
  if (path === '/api/admin/social/review') {
    const id = String(body.userId || '')
    const slot = body.slot
    const decision = body.decision
    if (!isValidUUID(id) || (slot !== 'picture' && slot !== 'background') || (decision !== 'approve' && decision !== 'decline')) return reply({ error: 'Invalid review' }, 400, request)
    const row = await ctx.social.adminProfile(id)
    if (!row) return reply({ error: 'Not found' }, 404, request)
    const review = decision === 'approve' ? 'approved' : 'rejected'
    await ctx.social.adminUpdate(id, slot === 'picture' ? { picture_review: review } : { background_review: review })
    return reply({ ok: true, profile: adminRow({ ...row, ...(slot === 'picture' ? { picture_review: review } : { background_review: review }) }) }, 200, request)
  }
  if (path === '/api/admin/social/profile') {
    const id = String(body.userId || '')
    if (!isValidUUID(id)) return reply({ error: 'Invalid profile' }, 400, request)
    const row = await ctx.social.adminProfile(id)
    if (!row) return reply({ error: 'Not found' }, 404, request)
    const patch: Parameters<SocialStore['adminUpdate']>[1] = {}
    if ('name' in body) {
      const name = cleanDisplayName(body.name)
      if (!name) return reply({ error: 'Please choose another name.', field: 'name' }, 422, request)
      patch.display_name = name
    }
    if ('handle' in body) {
      const handle = normalizeHandle(String(body.handle ?? ''))
      if (handle !== row.handle) {
        const problem = handleProblem(handle, BOOK_IDS)
        if (problem) return reply({ error: HANDLE_PROBLEM_COPY[problem], field: 'handle' }, 422, request)
        if ((await ctx.profiles.takenHandles([handle])).has(handle)) return reply({ error: HANDLE_PROBLEM_COPY.taken, field: 'handle' }, 409, request)
        patch.handle = handle
      }
    }
    if ('hidden' in body) patch.hidden_at = body.hidden === true ? new Date(ctx.now).toISOString() : null
    if (body.resetPicture === true) Object.assign(patch, { picture_kind: 'initial', picture_value: null, picture_review: 'none' })
    if (body.resetBackground === true) Object.assign(patch, { background_kind: 'library', background_value: null, background_review: 'none' })
    if (Object.keys(patch).length && (await ctx.social.adminUpdate(id, patch)) === 'taken') return reply({ error: HANDLE_PROBLEM_COPY.taken, field: 'handle' }, 409, request)
    return reply({ ok: true, profile: adminRow({ ...row, ...patch } as AdminProfileRow) }, 200, request)
  }
  if (path === '/api/admin/social/report') {
    const id = Number(body.id)
    const resolution = String(body.resolution || 'dismissed')
    if (!Number.isInteger(id) || id <= 0 || !['dismissed', 'renamed', 'hidden', 'picture-removed'].includes(resolution)) return reply({ error: 'Invalid report' }, 400, request)
    await ctx.social.resolveReport(id, resolution)
    return reply({ ok: true }, 200, request)
  }
  return reply({ error: 'Not found' }, 404, request)
}

// ===== Router =====

/**
 * Whom a follow, unfollow, remove-follower or block names: a Friends or
 * Everyone profile (not hidden), or one of the viewer's followers whatever
 * their visibility (ownerIdFor). Anything else, including an Only me
 * profile that does not follow the viewer, is no one.
 */
async function targetId(ctx: Context, viewerId: string, body: Record<string, unknown> | null): Promise<string | null> {
  const handle = normalizeHandle(String(body?.handle ?? ''))
  if (handleProblem(handle) === 'format') return null
  const id = await ownerIdFor(ctx, handle, viewerId)
  return id && id !== viewerId ? id : null
}

type SocialActionPath = '/api/social/follow' | '/api/social/unfollow' | '/api/social/remove-follower' | '/api/social/block'

/**
 * What an action answers about a reader the viewer may not see: the same
 * for a Friends profile, an Only me one, one across a block and a handle
 * nobody has, so no answer tells them apart.
 */
const UNSEEN_RESULT: Record<SocialActionPath, { relation: Relation; followsYou: false }> = {
  '/api/social/follow': { relation: 'follower', followsYou: false },
  '/api/social/unfollow': { relation: 'stranger', followsYou: false },
  '/api/social/remove-follower': { relation: 'stranger', followsYou: false },
  '/api/social/block': { relation: 'blocked', followsYou: false },
}

export async function handleSocial(request: Request, env: SocialEnv, deps: SocialDeps): Promise<Response> {
  const url = new URL(request.url)
  if (!socialFriendsOn(env)) return reply({ error: 'Not found' }, 404, request)
  const ctx = context(env, deps)
  try {
    if (url.pathname === '/api/admin/social' || url.pathname.startsWith('/api/admin/social/')) return await handleAdmin(request, url, ctx)

    const path = url.pathname.replace(/\/+$/, '')
    const viewer = request.headers.get('authorization') ? await deps.verifyUser(request) : null
    const viewerId = viewer && isValidUUID(viewer.id) ? viewer.id : null

    if (path.startsWith('/api/social/profile/') && request.method === 'GET') {
      const handle = normalizeHandle(decodeURIComponent(path.slice('/api/social/profile/'.length)))
      const data = await buildProfile(ctx, handle, viewerId)
      if (!data) return reply({ error: 'Not found' }, 404, request)
      const response = reply({ profile: data }, 200, request)
      response.headers.set('X-Robots-Tag', 'noindex, noarchive')
      return response
    }

    if (!viewerId) return reply({ error: 'Authentication required' }, 401, request)

    if (path === '/api/social/board' && request.method === 'GET') {
      const tab: Board = url.searchParams.get('tab') === 'everyone' ? 'everyone' : 'friends'
      const open = await everyoneOpen(ctx)
      // Below the threshold there is no Everyone board at all.
      if (tab === 'everyone' && !open) return reply({ error: 'Not found', everyoneOpen: false }, 404, request)
      return reply(await buildBoard(ctx, viewerId, tab, open), 200, request)
    }
    if (path === '/api/social/rank' && request.method === 'GET') {
      const board = await buildBoard(ctx, viewerId, 'friends')
      return reply({ rank: board.me?.rank ?? null, total: board.total, seconds: board.me?.seconds ?? 0 }, 200, request)
    }
    if (path === '/api/social/find' && request.method === 'GET') {
      const found = await buildFind(ctx, viewerId, url.searchParams.has('q') ? url.searchParams.get('q') : null)
      return reply(url.searchParams.has('q') ? found : { ...found, everyoneOpen: await everyoneOpen(ctx) }, 200, request)
    }
    if (path === '/api/social/blocked' && request.method === 'GET') {
      const blocked = await ctx.social.blockedByMe(viewerId)
      const rows = await Promise.all(blocked.slice(0, 200).map(async id => {
        const row = await ctx.profiles.getOwn(id).catch(() => null)
        return row ? { id, name: row.display_name, handle: row.handle } : { id, name: 'A reader', handle: null }
      }))
      return reply({ blocked: rows }, 200, request)
    }
    if (path === '/api/social/card' && request.method === 'POST') return await handleCard(request, ctx, viewerId)

    if (request.method !== 'POST') return reply({ error: 'Not found' }, 404, request)
    const body = await readJson(request)

    if (path === '/api/social/unblock') {
      const id = String(body?.id ?? '')
      if (!isValidUUID(id)) return reply({ error: 'Invalid reader' }, 400, request)
      await ctx.social.unblock(viewerId, id)
      return reply({ ok: true }, 200, request)
    }
    if (path === '/api/social/report') {
      const reason = body?.reason as ReportReason
      if (!REPORT_REASONS.includes(reason)) return reply({ error: 'Choose a reason.' }, 422, request)
      if (deps.checkRateLimit && !(await deps.checkRateLimit(`social-report:${viewerId}`, env.RATE_LIMIT, 10))) return reply({ error: 'rate_limited' }, 429, request)
      // Only a reader the viewer may see, or who follows them: a Friends profile the viewer
      // cannot see answers like an Only me or missing one, so a report never probes.
      const id = await targetId(ctx, viewerId, body)
      if (!id || !(await viewFor(ctx.profiles, id, viewerId))) return reply({ error: 'Not found' }, 404, request)
      const handle = normalizeHandle(String(body?.handle ?? ''))
      const result = await ctx.social.report({ reporter: viewerId, reported: id, handle, reason })
      return reply({ ok: true, duplicate: result === 'duplicate' }, 200, request)
    }

    if (path in UNSEEN_RESULT) {
      const action = path as SocialActionPath
      const handle = normalizeHandle(String(body?.handle ?? ''))
      if (handleProblem(handle) === 'format') return reply({ error: 'Not found' }, 404, request)
      if (action === '/api/social/follow' && deps.checkRateLimit && !(await deps.checkRateLimit(`social-follow:${viewerId}`, env.RATE_LIMIT, 60))) return reply({ error: 'rate_limited' }, 429, request)
      const own = await ctx.profiles.getOwn(viewerId)
      if (own?.handle === handle) return reply({ error: 'Not found' }, 404, request)
      const id = await targetId(ctx, viewerId, body)
      if (id) {
        const before = await ctx.profiles.relation(viewerId, id)
        if (action === '/api/social/follow') {
          // Following works from a link, before the profile shows (it shows once you are friends);
          // never across a block.
          if (!before.blocked) {
            await ctx.social.follow(viewerId, id)
            deps.track?.('follow', viewerId)
          }
        } else if (action === '/api/social/unfollow') {
          await ctx.social.unfollow(viewerId, id)
          deps.track?.('unfollow', viewerId)
        } else if (action === '/api/social/remove-follower') {
          await ctx.social.unfollow(id, viewerId)
        } else {
          await ctx.social.block(viewerId, id)
        }
        // The real relation only for a reader the viewer may see (or who follows them).
        if (await viewFor(ctx.profiles, id, viewerId)) {
          const rel = await ctx.profiles.relation(viewerId, id)
          return reply({ ok: true, relation: relationOf({ self: false, ...rel }), followsYou: rel.ownerFollowsViewer }, 200, request)
        }
      }
      return reply({ ok: true, ...UNSEEN_RESULT[action] }, 200, request)
    }
    return reply({ error: 'Not found' }, 404, request)
  } catch (error) {
    if (error instanceof ProfilesUnavailable || error instanceof SocialUnavailable) {
      console.warn(JSON.stringify({ event: 'social_unavailable', detail: error.message }))
      return reply({ enabled: true, available: false }, 503, request)
    }
    throw error
  }
}

/** The hourly rebuild, from the 10-minute cron (the run in minutes 0–9). */
export async function runLeaderboardCron(env: SocialEnv, scheduledTime: number, store: SocialStore = supabaseSocialStore(env)): Promise<boolean> {
  if (!socialFriendsOn(env)) return false
  if (new Date(scheduledTime).getUTCMinutes() >= 10) return false
  try {
    await store.refreshBoard()
    return true
  } catch (error) {
    console.warn(JSON.stringify({ event: 'leaderboard_refresh_failed', detail: error instanceof Error ? error.message : 'failed' }))
    return false
  }
}

