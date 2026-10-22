/**
 * Profiles (social ship 2): the rules shared by the Worker, the sign-up page,
 * the You page and the reader. Pure functions only; no I/O.
 *
 * Approved by Anders, 7 October 2026 (docs/social on claude/dreamy-faraday-30zl0v):
 * - handles: 3–20 letters, digits, `_` or `.`; unique; reserved words blocked;
 *   a word filter on names and handles. Profile links are tinct.app/@handle,
 *   so a handle can never shadow a book route.
 * - who can see you: Only me / Friends / Everyone. Skipping = Only me.
 *   Everyone needs an explicit choice AND a confirmed email; until the email
 *   is confirmed it counts as Friends.
 * - uploads (and the Google photo, which is stored like one) show to others at
 *   once, with no review (Anders, 19 Oct 2026); Tinct can remove one afterwards.
 * - findable (19 Oct 2026): Friends and Everyone profiles are found by name or
 *   handle, showing name and picture; reading stays with friends (Everyone:
 *   with anyone). Only me is never found.
 * - never exposed: highlights, notes, chats, Talk, email. Nothing here carries them.
 */

export type Visibility = 'only_me' | 'friends' | 'everyone'
export type PictureKind = 'set' | 'cover' | 'initial' | 'google' | 'upload'
export type BackgroundKind = 'library' | 'set' | 'upload'
export type Review = 'none' | 'pending' | 'approved' | 'rejected'
export type NewBooksOpenIn = 'modern' | 'human'

export const VISIBILITIES: readonly Visibility[] = ['only_me', 'friends', 'everyone']

/** Plain words, as on flows.html "Who can see you". */
export const VISIBILITY_COPY: Record<Visibility, { label: string; line: string; short: string }> = {
  only_me: { label: 'Only me', line: 'Nobody else sees your profile or reading.', short: 'only you can see you' },
  friends: { label: 'Friends', line: 'Readers can find your name and picture; only people you follow who follow you back see your reading.', short: 'friends can see you' },
  everyone: { label: 'Everyone', line: 'Anyone with your link, and the Everyone board.', short: 'everyone can see you' },
}

export const NEW_BOOKS_COPY: Record<NewBooksOpenIn, { label: string; line: string }> = {
  modern: { label: 'Modern English', line: 'The same book, in today’s English.' },
  // Renamed for the reading step (Anders, 22 Oct 2026).
  human: { label: 'Human originals or translations', line: 'The original text, or a published translation.' },
}

/**
 * The languages a reader reads in (the reading step and Settings › I read in,
 * Anders 22 Oct 2026): English and Danish, at least one. Stored on the profile
 * as reading_languages. Dansk puts the offered Danish editions first; nothing
 * else changes yet.
 */
export type ReadingLanguage = 'en' | 'da'
export const READING_LANGUAGES: readonly ReadingLanguage[] = ['en', 'da']
export const READING_LANGUAGE_COPY: Record<ReadingLanguage, string> = { en: 'English', da: 'Dansk' }

/** A stored or sent list, cleaned: known languages, in order, no repeats; null when none is left. */
export function cleanReadingLanguages(raw: unknown): ReadingLanguage[] | null {
  if (!Array.isArray(raw)) return null
  const chosen = READING_LANGUAGES.filter(language => raw.includes(language))
  return chosen.length ? chosen : null
}

/** The reading step's starting choice: English, and Dansk too for a browser set to Danish. */
export function defaultReadingLanguages(browserLanguages: readonly string[] = []): ReadingLanguage[] {
  return browserLanguages.some(language => /^da\b/i.test(language)) ? ['en', 'da'] : ['en']
}

/**
 * Turns one language on or off, keeping at least one: switching off the only
 * language chosen leaves the list as it was.
 */
export function toggleReadingLanguage(current: readonly ReadingLanguage[], language: ReadingLanguage): ReadingLanguage[] {
  const next = current.includes(language) ? current.filter(item => item !== language) : [...current, language]
  return next.length ? READING_LANGUAGES.filter(item => next.includes(item)) : [...current]
}

/**
 * The sign-up consent line (Anders, 7 October 2026) and its wording version,
 * stored with the consent. Change the version whenever the words change.
 */
export const EMAIL_CONSENT_TEXT = 'Email me about my reading progress and ideas for what to read next. Stop any time.'
export const EMAIL_CONSENT_VERSION = '2026-10-07'

// ===== Handles =====

export const HANDLE_MIN = 3
export const HANDLE_MAX = 20
const HANDLE_RE = /^[a-z0-9_.]{3,20}$/

/**
 * Words no handle may be: routes, system words and roles that could mislead.
 * Book ids are added by the caller (`handleProblem(handle, bookIds)`); with
 * links at /@handle they cannot collide with book routes, but a handle equal
 * to a book id would still read as the book.
 */
export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  'about', 'account', 'accounts', 'add', 'addbook', 'admin', 'administrator', 'api', 'app', 'apps', 'assets',
  'audio', 'auth', 'billing', 'blog', 'book', 'books', 'brand', 'callback', 'chat', 'confirm', 'contact',
  'covers', 'credits', 'data', 'delete', 'demo', 'desktop', 'edition', 'editions', 'email', 'everyone',
  'explore', 'faq', 'featured', 'feed', 'find', 'follow', 'followers', 'following', 'fonts', 'friends',
  'help', 'home', 'index', 'invite', 'lab', 'leaderboard', 'legal', 'librarian', 'library', 'login', 'logout',
  'me', 'mod', 'moderator', 'new', 'news', 'null', 'official', 'omarchy', 'phone', 'premium', 'press',
  'pricing', 'privacy', 'profile', 'profiles', 'q', 'read', 'reader', 'readers', 'report', 'reset', 'root',
  'search', 'security', 'settings', 'share', 'shelf', 'sign', 'signin', 'signout', 'signup', 'sitemap',
  'staff', 'static', 'story', 'support', 'system', 'talk', 'team', 'terms', 'tinct', 'undefined', 'user',
  'users', 'www', 'you',
])

/** Substrings no handle may contain, so nobody can pose as Tinct or its staff. */
const RESERVED_FRAGMENTS = ['tinct', 'admin', 'moderator', 'official']

/**
 * The word filter for names and handles. Kept short and severe on purpose:
 * slurs and explicit words, matched after folding look-alike characters.
 * Fragments match inside words; the words list only as whole words, so
 * ordinary names are not caught (no Scunthorpe problem).
 */
const BLOCKED_FRAGMENTS = [
  'fuck', 'shit', 'bitch', 'whore', 'nigger', 'nigga', 'faggot', 'porn', 'nazi', 'hitler', 'tranny',
  'wank', 'pussy', 'dildo', 'blowjob', 'cumshot', 'molest', 'incest', 'asshole', 'motherf',
]
/** Whole words only: as fragments these would catch ordinary names and words (Scunthorpe, therapist, Van Dyke). */
const BLOCKED_WORDS = new Set([
  'fag', 'cum', 'sex', 'xxx', 'ass', 'rape', 'rapist', 'nsfw', 'dick', 'cock', 'tits', 'twat', 'cunt', 'slut',
  'spic', 'kike', 'chink', 'dyke', 'pedo', 'paedo', 'heil', 'kys', 'retard', 'penis', 'vagina', 'bastard',
])

function fold(text: string): string {
  return text.toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[0@4]/g, m => (m === '0' ? 'o' : 'a'))
    .replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/[5$]/g, 's').replace(/7/g, 't')
}

/** True when a name or handle passes the word filter. */
export function passesWordFilter(text: string): boolean {
  const folded = fold(text)
  const squeezed = folded.replace(/[^a-z]/g, '')
  if (BLOCKED_FRAGMENTS.some(fragment => squeezed.includes(fragment))) return false
  const words = folded.split(/[^a-z]+/).filter(Boolean)
  if (words.some(word => BLOCKED_WORDS.has(word))) return false
  return true
}

export type HandleProblem = 'format' | 'reserved' | 'filtered'

/** Null when the handle is acceptable (uniqueness is checked by the store). */
export function handleProblem(raw: string, bookIds: Iterable<string> = []): HandleProblem | null {
  const handle = normalizeHandle(raw)
  if (!HANDLE_RE.test(handle) || !/[a-z0-9]/.test(handle)) return 'format'
  if (RESERVED_HANDLES.has(handle) || RESERVED_FRAGMENTS.some(fragment => handle.includes(fragment))) return 'reserved'
  for (const id of bookIds) if (id === handle) return 'reserved'
  if (!passesWordFilter(handle)) return 'filtered'
  return null
}

/** Handles are case-insensitive and stored lower-case; a leading @ is dropped. */
export function normalizeHandle(raw: string): string {
  return String(raw || '').trim().replace(/^@/, '').toLowerCase()
}

/**
 * Reserved and taken read the same, neutral line: "taken" would tell anyone
 * checking a link that a profile (perhaps an Only me one) sits behind it.
 */
const HANDLE_UNAVAILABLE = 'Please choose another link.'

export const HANDLE_PROBLEM_COPY: Record<HandleProblem | 'taken', string> = {
  format: 'Use 3 to 20 letters, digits, _ or .',
  reserved: HANDLE_UNAVAILABLE,
  filtered: HANDLE_UNAVAILABLE,
  taken: HANDLE_UNAVAILABLE,
}

/**
 * A handle made from a name or an email's local part: lower-case letters,
 * digits, `_` and `.`, accents folded, at most 20, at least 3 (padded with
 * "reader"). Not yet unique; `uniqueHandle` finishes it.
 */
export function handleBase(source: string): string {
  let base = String(source || '').replace(/[øØ]/g, 'o').replace(/[æÆ]/g, 'ae').replace(/[œŒ]/g, 'oe').replace(/ß/g, 'ss').replace(/[łŁ]/g, 'l').replace(/[đĐ]/g, 'd').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\s+/g, '.').replace(/[^a-z0-9_.]/g, '').replace(/\.{2,}/g, '.').replace(/^[._]+|[._]+$/g, '')
  base = base.slice(0, HANDLE_MAX).replace(/[._]+$/g, '')
  if (base.length < HANDLE_MIN || !/[a-z0-9]/.test(base)) base = (base + 'reader').slice(0, HANDLE_MAX)
  if (handleProblem(base) && handleProblem(base) !== 'format') base = 'reader'
  return base
}

/** Candidates in order: the base, then base2, base3, ... trimmed to fit. */
export function handleCandidates(base: string, count = 12): string[] {
  const out = [base]
  for (let n = 2; out.length < count; n++) {
    const suffix = String(n)
    out.push(base.slice(0, HANDLE_MAX - suffix.length).replace(/[._]+$/g, '') + suffix)
  }
  return out
}

/** The first candidate that is acceptable and not taken; a random tail if all are. */
export function uniqueHandle(base: string, taken: ReadonlySet<string>, bookIds: Iterable<string> = [], random = Math.random): string {
  const ids = [...bookIds]
  for (const candidate of handleCandidates(base)) {
    if (!taken.has(candidate) && !handleProblem(candidate, ids)) return candidate
  }
  const tail = Math.floor(random() * 900000 + 100000).toString()
  return base.slice(0, HANDLE_MAX - tail.length).replace(/[._]+$/g, '') + tail
}

/** A display name: trimmed, single-spaced, 1–40 characters, passing the word filter. */
export function cleanDisplayName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const name = raw.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim()
  if (!name || name.length > 40) return null
  return passesWordFilter(name) ? name : null
}

/** The name a profile gets when the account has none. */
export const NEUTRAL_NAME = 'Reader'

/**
 * The prefilled name: the account's own name (Google's full name), else the
 * neutral name. Never the email (Anders, 9 October 2026): profile pages and
 * links are built from the reader's name only.
 */
export function suggestedName(fullName: unknown): string {
  const named = typeof fullName === 'string' ? cleanDisplayName(fullName) : null
  return named || NEUTRAL_NAME
}

/** The neutral link's base: "reader" and a short random part (uniqueHandle settles clashes). */
export function neutralHandleBase(random = Math.random): string {
  return `reader${Math.floor(random() * 9000 + 1000)}`
}

/** Could uniqueHandle(base) have made this handle? The base, or the base trimmed to fit plus digits. */
export function isHandleFrom(handle: string, base: string): boolean {
  if (handle === base) return true
  for (let cut = 1; cut < handle.length; cut++) {
    const tail = handle.slice(cut)
    if (!/^\d+$/.test(tail)) continue
    if (handle.slice(0, cut) === base.slice(0, HANDLE_MAX - tail.length).replace(/[._]+$/g, '')) return true
  }
  return false
}

/**
 * What profiles made before 9 October 2026 took from the email: the name
 * (the local part, tidied) and the link bases (the local part, and that
 * name). Only used to recognise and repair those profiles, never to make one.
 */
export function legacyEmailDerived(email: unknown): { name: string | null; handleBases: string[] } {
  const local = typeof email === 'string' ? email.split('@')[0] : ''
  if (!local) return { name: null, handleBases: [] }
  const words = local.replace(/[._+-]+/g, ' ').replace(/\d+/g, ' ').trim().split(/\s+/).filter(Boolean)
  const tidied = cleanDisplayName(words.map(word => word[0].toUpperCase() + word.slice(1)).join(' '))
  const name = tidied && tidied !== NEUTRAL_NAME ? tidied : null
  const handleBases = [handleBase(local), ...(name ? [handleBase(name)] : [])].filter(base => base !== 'reader')
  return { name, handleBases }
}

// ===== Profile links =====

/** tinct.app/@handle — the @ keeps every profile clear of book routes. */
export function profilePath(handle: string): string {
  return `/@${normalizeHandle(handle)}`
}

export function profileLinkText(handle: string): string {
  return `tinct.app/@${normalizeHandle(handle)}`
}

/** `/@anders` -> "anders"; anything else (including every book route) -> null. */
export function handleFromPath(pathname: string): string | null {
  const match = /^\/@([A-Za-z0-9_.]{3,20})\/?$/.exec(pathname)
  return match ? match[1].toLowerCase() : null
}

// ===== Pictures and backgrounds =====

const ASSETS = '/lab/library_2/assets'

export interface PictureSet {
  id: string
  label: string
  bookId: string
  /** The cover the round picture is cut from, and the detail shown. */
  cover: string
  pos: string
  /** The profile background: the room of the library scene, cut above its table (10 Oct 2026). */
  room: string
}

/** Sets pair a picture and a background from the same book (flows.html). */
export const PICTURE_SETS: readonly PictureSet[] = [
  { id: 'stoic', label: 'Stoic', bookId: 'meditations', cover: `${ASSETS}/meditations.jpg`, pos: '50% 34%', room: `${ASSETS}/room-meditations-phone.jpg` },
  { id: 'at-sea', label: 'At sea', bookId: 'odyssey', cover: `${ASSETS}/odyssey.jpg`, pos: '30% 60%', room: `${ASSETS}/room-odyssey-phone.jpg` },
  { id: 'florence', label: 'Florence', bookId: 'the-prince', cover: `${ASSETS}/the-prince.jpg`, pos: '40% 55%', room: `${ASSETS}/room-the-prince-phone.jpg` },
  { id: 'petersburg', label: 'Petersburg', bookId: 'crime-and-punishment', cover: `${ASSETS}/crime-and-punishment.jpg`, pos: '50% 38%', room: `${ASSETS}/room-crime-and-punishment-phone.jpg` },
  { id: 'longbourn', label: 'Longbourn', bookId: 'pride-and-prejudice', cover: `${ASSETS}/pride-and-prejudice.jpg`, pos: '50% 32%', room: `${ASSETS}/room-pride-and-prejudice-phone.jpg` },
]

/** Library covers a picture can be cut from (a cover detail). */
export const COVER_BOOK_IDS: readonly string[] = [
  'candide', 'confessions', 'crime-and-punishment', 'frankenstein', 'iliad', 'jane-eyre', 'jekyll-and-hyde',
  'julius-caesar', 'meditations', 'nicomachean-ethics', 'niels-lyhne', 'notes-from-underground', 'odyssey',
  'pride-and-prejudice', 'the-awakening', 'the-prince', 'the-republic', 'to-the-lighthouse',
]

export const LIBRARY_BACKGROUND = `${ASSETS}/room-library-night.jpg`

export function pictureSet(id: unknown): PictureSet | null {
  return PICTURE_SETS.find(set => set.id === id) ?? null
}

/**
 * The picture an auto-created profile starts with: the set of the book the
 * reader is in, else that book's cover, else the initial.
 */
export function pictureForBook(bookId: unknown): { kind: PictureKind; value: string | null; background: { kind: BackgroundKind; value: string | null } } {
  const set = PICTURE_SETS.find(item => item.bookId === bookId)
  if (set) return { kind: 'set', value: set.id, background: { kind: 'set', value: set.id } }
  if (typeof bookId === 'string' && COVER_BOOK_IDS.includes(bookId)) return { kind: 'cover', value: bookId, background: { kind: 'library', value: null } }
  return { kind: 'initial', value: null, background: { kind: 'library', value: null } }
}

/** What a client draws: an image (cut from a cover or a stored photo) or an initial. */
export type PictureView =
  | { kind: 'image'; src: string; pos: string; cover: boolean; private?: boolean }
  | { kind: 'initial'; initial: string }

export function initialOf(name: string): string {
  const letter = [...String(name || '').trim()][0] || 'R'
  return letter.toUpperCase()
}

/**
 * Turn stored columns into what a client draws. `imageUrl` is the Worker URL
 * for a stored photo (owner or approved); without it a stored photo shows as
 * the initial.
 */
export function pictureView(kind: PictureKind, value: string | null, name: string, imageUrl?: string | null): PictureView {
  if (kind === 'set') {
    const set = pictureSet(value)
    if (set) return { kind: 'image', src: set.cover, pos: set.pos, cover: true }
  }
  if (kind === 'cover' && value && COVER_BOOK_IDS.includes(value)) return { kind: 'image', src: `${ASSETS}/${value}.jpg`, pos: '50% 38%', cover: true }
  if ((kind === 'upload' || kind === 'google') && imageUrl) return { kind: 'image', src: imageUrl, pos: '50% 50%', cover: false, private: true }
  return { kind: 'initial', initial: initialOf(name) }
}

export function backgroundView(kind: BackgroundKind, value: string | null, imageUrl?: string | null): { src: string; private?: boolean } {
  if (kind === 'set') {
    const set = pictureSet(value)
    if (set) return { src: set.room }
  }
  if (kind === 'upload' && imageUrl) return { src: imageUrl, private: true }
  return { src: LIBRARY_BACKGROUND }
}

// ===== Who sees what =====

/** Everyone counts as Friends until the reader's email is confirmed. */
export function effectiveVisibility(visibility: Visibility, emailConfirmed: boolean): Visibility {
  return visibility === 'everyone' && !emailConfirmed ? 'friends' : visibility
}

/** How a viewer stands to a profile's owner. */
export type Relation = 'self' | 'friend' | 'follower' | 'followed' | 'stranger' | 'blocked'

/** Friends are mutual follows. Either side's block hides both from each other. */
export function relationOf(input: { self: boolean; viewerFollowsOwner: boolean; ownerFollowsViewer: boolean; blocked: boolean }): Relation {
  if (input.self) return 'self'
  if (input.blocked) return 'blocked'
  if (input.viewerFollowsOwner && input.ownerFollowsViewer) return 'friend'
  if (input.viewerFollowsOwner) return 'follower'
  if (input.ownerFollowsViewer) return 'followed'
  return 'stranger'
}

/** The columns the public view needs. Email, notes, chats and highlights are not among them. */
export interface ProfileCard {
  handle: string
  displayName: string
  pictureKind: PictureKind
  pictureValue: string | null
  pictureReview: Review
  backgroundKind: BackgroundKind
  backgroundValue: string | null
  backgroundReview: Review
  visibility: Visibility
  emailConfirmed: boolean
  showReading: boolean
  showTime: boolean
  onLeaderboard: boolean
}

export interface PublicProfileView {
  handle: string
  name: string
  picture: { kind: PictureKind; value: string | null }
  background: { kind: BackgroundKind; value: string | null } | null
  /**
   * True for the header-only view: a Friends profile seen by a signed-in
   * reader who is not a friend (name, link and picture), or a reader who
   * follows the viewer whose profile the viewer may not otherwise see (name
   * and link, with the initial). Never any reading.
   */
  limited: boolean
  /** What the owner lets this viewer see (filled with numbers from ship 1 and 3). */
  shows: { reading: boolean; time: boolean; leaderboard: boolean }
}

/**
 * What one viewer may see of one profile, or null for nothing (Not found).
 * The privacy notice ("Your profile") binds this: reading is shown only to
 * friends (mutual follows) of a Friends profile, and a new profile is Only me.
 *
 * - blocked either way: nothing;
 * - Everyone (confirmed email): everyone sees the profile with the switches;
 * - Friends: friends see the profile with the switches. Any other signed-in
 *   reader (a stranger, or a one-way follower whose request is not yet
 *   accepted) sees the name, link and picture only, the same as Find readers
 *   shows (findable profiles, Anders 19 Oct 2026): no banner, books, time or
 *   board. Signed out, a Friends profile is Not found, as for Only me;
 * - Only me: nothing (the owner sees everything), and never findable;
 * - one exception, whatever the visibility: a reader who follows the viewer
 *   reached out to them, so the viewer (only the viewer) sees that follower's
 *   name and link: enough to follow back, remove them or block them. For an
 *   Only me (or hidden) follower that is the initial, never their photo. This
 *   is `limited`.
 * - Photos show to others at once (uploads are stored approved since
 *   19 Oct 2026; Tinct can remove one afterwards). A row still marked pending
 *   from before then shows the initial / library scene to others until approved.
 *
 * `viewer.signedIn` defaults to true for every relation but `stranger`, the
 * one relation a signed-out visitor has.
 */
export function publicProfileView(card: ProfileCard, relation: Relation, viewer: { signedIn?: boolean } = {}): PublicProfileView | null {
  if (relation === 'blocked') return null
  const self = relation === 'self'
  const signedIn = viewer.signedIn ?? relation !== 'stranger'
  const visibility = effectiveVisibility(card.visibility, card.emailConfirmed)
  const full = self || visibility === 'everyone' || (visibility === 'friends' && relation === 'friend')
  const pictureHidden = !self && (card.pictureKind === 'upload' || card.pictureKind === 'google') && card.pictureReview !== 'approved'
  const backgroundHidden = !self && card.backgroundKind === 'upload' && card.backgroundReview !== 'approved'
  const picture = pictureHidden ? { kind: 'initial' as const, value: null } : { kind: card.pictureKind, value: card.pictureValue }
  const background = backgroundHidden ? { kind: 'library' as const, value: null } : { kind: card.backgroundKind, value: card.backgroundValue }
  const nothingShown = { reading: false, time: false, leaderboard: false }
  if (!full) {
    // A findable (Friends) profile to a signed-in reader who is not yet a friend: name and picture only.
    if (visibility === 'friends' && signedIn) return { handle: card.handle, name: card.displayName, picture, background: null, limited: true, shows: nothingShown }
    // Otherwise only the owner's own follow opens anything, and only to the reader they follow.
    if (relation !== 'followed' && relation !== 'friend') return null
    return { handle: card.handle, name: card.displayName, picture: { kind: 'initial', value: null }, background: null, limited: true, shows: nothingShown }
  }
  return {
    handle: card.handle,
    name: card.displayName,
    picture,
    background,
    limited: false,
    shows: {
      reading: self || card.showReading,
      time: self || card.showTime,
      leaderboard: card.onLeaderboard && visibility !== 'only_me',
    },
  }
}
