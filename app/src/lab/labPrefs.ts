import type { Edition, FontFamily, ProgressDisplay, ProgressMetric, ProgressScope } from '../types'
import { BIBLE } from '../data/bookRegistry'
import { isEditionWithheld, migrateWithheldEdition } from '../data/withheldEditions'
import { LAB_COMPARE_EDITION_KEY, LAB_EDITION_KEY } from './labSource'

/** Lab library route. Full navigation, never /app or a book id. */
export const LAB_LIBRARY_URL = '/library'
/** Sign-in page URL. Pass the current reader path so the reader comes back to the same book after signing in. */
export function labSignInUrl(returnTo: string = LAB_LIBRARY_URL): string {
  return `/lab/sign-in?returnTo=${encodeURIComponent(returnTo || LAB_LIBRARY_URL)}`
}
export function labAccountUrl(returnTo: string = LAB_LIBRARY_URL): string {
  return `/lab/sign-in?mode=account&returnTo=${encodeURIComponent(returnTo || LAB_LIBRARY_URL)}`
}
/** Library defaults, for surfaces with no reader to return to. */
export const LAB_SIGN_IN_URL = labSignInUrl()
export const LAB_ACCOUNT_URL = labAccountUrl()

export const LAB_PREFS_KEY = 'tinct-lab-prefs'

export const LAB_MIN_FONT_SIZE = 0.8
export const LAB_MAX_FONT_SIZE = 2.2
export const LAB_FONT_SIZES = [LAB_MIN_FONT_SIZE, 1.0, 1.2, 1.5, 1.8, LAB_MAX_FONT_SIZE] as const
export const LAB_FONT_FAMILIES: FontFamily[] = ['garamond', 'baskerville', 'sourceserif']

/**
 * The reading faces the lab offers.
 *
 * `FontFamily` is the production type and stays exactly the three faces the
 * shipping reader knows; widening it would reach every V1 settings surface.
 * The lab's own store carries two more — Literata, the new default, and
 * Atkinson Hyperlegible, offered for a need rather than a taste.
 */
export type LabFontFamily = FontFamily | 'literata' | 'atkinson'

/** Picker order: the four reading faces, then Accessibility on its own. */
export const LAB_READING_FONTS: LabFontFamily[] = ['literata', 'garamond', 'baskerville', 'sourceserif']
export const LAB_ACCESSIBILITY_FONTS: LabFontFamily[] = ['atkinson']

export const LAB_FONT_LABELS: Record<LabFontFamily, string> = {
  literata: 'Literata',
  garamond: 'EB Garamond',
  baskerville: 'Libre Baskerville',
  sourceserif: 'Source Serif 4',
  atkinson: 'Atkinson Hyperlegible',
}

/**
 * Literata is V2's default reading face; the reader that ships today keeps
 * the face it ships with. A reader who has actually chosen a face keeps that
 * choice in both, which is what `null` is for: it is the difference between
 * "never picked" and "picked Garamond", and only the first one moves.
 */
export const LAB_V2_DEFAULT_FONT: LabFontFamily = 'literata'
export const LAB_V1_DEFAULT_FONT: LabFontFamily = 'garamond'

export function labReadingFont(family: LabFontFamily | null, chromeV2: boolean): LabFontFamily {
  if (family) return family
  return chromeV2 ? LAB_V2_DEFAULT_FONT : LAB_V1_DEFAULT_FONT
}

export type LabTheme = 'system' | 'light' | 'dark' | 'book'
export type LabTextAlignment = 'left' | 'justify'
export type LabLineSpacing = 'compact' | 'comfortable' | 'open'
export type LabMargins = 'narrow' | 'medium' | 'wide'
export type LabParagraphSpacing = 'compact' | 'standard' | 'generous'
export type LabAppearanceProfile = 'phone' | 'desktop'

export interface LabAppearancePrefs {
  theme: LabTheme
  /** `null` is "never chosen" — see `labReadingFont`. */
  fontFamily: LabFontFamily | null
  fontSize: number
  alignment: LabTextAlignment
  lineSpacing: LabLineSpacing
  margins: LabMargins
  paragraphSpacing: LabParagraphSpacing
  progressDisplay: ProgressDisplay
}

export interface LabSharedPrefs {
  primaryEdition: string
  compareEdition: string
  audioEdition: string
  audioSpeed: number
  compareOpen: boolean
}

export interface LabStoredPrefs {
  version: 2
  shared: LabSharedPrefs
  phone: LabAppearancePrefs
  desktop: LabAppearancePrefs
  /**
   * One-shot reader introductions, keyed by who saw them: the account when
   * someone is signed in, the device when nobody is. It rides in the reader
   * prefs so it follows the same store and the same sign-out lifecycle as
   * every other reading preference.
   */
  seenOnce: Record<string, boolean>
}

// Retired keys, no longer read or written: `super-first-view` (the spin is
// now once per reader load, not once per identity) and `super-menu-opened`
// (the teal full stop on the super button is gone). Stale entries in stored
// prefs are ignored.

/**
 * Who a one-shot introduction has been shown to. Signed in, that is the
 * account, so a second device does not replay it; signed out, the device is
 * the only identity there is.
 */
export function labSeenOnceIdentity(accountId: string | null | undefined): string {
  return accountId ? `account:${accountId}` : 'device'
}

function seenOnceKey(what: string, accountId: string | null | undefined): string {
  return `${what}:${labSeenOnceIdentity(accountId)}`
}

export function labSeenOnce(what: string, accountId: string | null | undefined): boolean {
  return readLabStoredPrefs().seenOnce[seenOnceKey(what, accountId)] === true
}

export function markLabSeenOnce(what: string, accountId: string | null | undefined): void {
  if (typeof localStorage === 'undefined') return
  const key = seenOnceKey(what, accountId)
  try {
    const current = readLabStoredPrefs()
    if (current.seenOnce[key] === true) return
    const next: LabStoredPrefs = { ...current, seenOnce: { ...current.seenOnce, [key]: true } }
    localStorage.setItem(LAB_PREFS_KEY, JSON.stringify(next))
  } catch {
    /* quota / private mode */
  }
}

export interface LabPrefs extends LabSharedPrefs, LabAppearancePrefs {
  /** Runtime compatibility mirror. The stored source of truth is `theme`. */
  darkMode: boolean
}

export const DEFAULT_LAB_PREFS: LabPrefs = {
  primaryEdition: LAB_EDITION_KEY,
  compareEdition: LAB_COMPARE_EDITION_KEY,
  audioEdition: LAB_EDITION_KEY,
  audioSpeed: 1,
  darkMode: false,
  theme: 'system',
  fontFamily: null,
  fontSize: 1.3,
  alignment: 'justify',
  lineSpacing: 'comfortable',
  margins: 'medium',
  paragraphSpacing: 'standard',
  progressDisplay: { metric: 'page', scope: 'chapter' },
  compareOpen: false,
}

/**
 * Stored edition choices, with any withdrawn edition rewritten to its successor.
 *
 * Reader preferences outlive the editions they name. When the Bible's
 * `modern-en` was withdrawn on 2026-09-11 the reader kept reading — the loader
 * silently substitutes a published edition for the text — but `primaryEdition`
 * itself stayed `modern-en`, and that key is what the companion sends to
 * `/api/chat` as the edition to retrieve. The request then pointed at JSON that
 * no longer exists and every in-book lookup died. Migrating here means the key
 * is corrected once, at the source, for every reader of it: text loading,
 * Compare, audio, highlights and Ask.
 */
export function migrateLabPrefsEditions(prefs: LabPrefs, bookId: string): LabPrefs {
  const primaryEdition = migrateWithheldEdition(bookId, prefs.primaryEdition)
  const compareEdition = migrateWithheldEdition(bookId, prefs.compareEdition)
  const audioEdition = migrateWithheldEdition(bookId, prefs.audioEdition)
  if (
    primaryEdition === prefs.primaryEdition
    && compareEdition === prefs.compareEdition
    && audioEdition === prefs.audioEdition
  ) return prefs
  return { ...prefs, primaryEdition, compareEdition, audioEdition }
}

/**
 * The editions a reader may choose. A withdrawn edition is never offered —
 * picking one is what writes the dead key into prefs in the first place.
 *
 * The identity of the returned array matters: it feeds React dependency arrays
 * in the lab reader, and a fresh array on every render re-runs the source
 * loader, which re-renders, which loads again. So an unfiltered list is
 * returned as itself and a filtered one is cached per book.
 */
const selectableCache = new WeakMap<Edition[], Map<string, Edition[]>>()

export function selectableLabEditions(bookId: string, editions: Edition[]): Edition[] {
  const byBook = selectableCache.get(editions) ?? new Map<string, Edition[]>()
  const cached = byBook.get(bookId)
  if (cached) return cached
  const filtered = editions.filter(edition => !isEditionWithheld(bookId, edition.key))
  const result = filtered.length === editions.length ? editions : filtered
  byBook.set(bookId, result)
  selectableCache.set(editions, byBook)
  return result
}

export function bibleEditions(): Edition[] {
  return selectableLabEditions(BIBLE.id, BIBLE.editions)
}

export function bibleAudioEditions(): Edition[] {
  return BIBLE.editions.filter(edition => edition.hasAudio)
}

/** Lab Hear locks narration to the primary edition when it has audio. */
export function syncLabAudioEdition(prefs: LabPrefs, editions: Edition[] = bibleEditions()): LabPrefs {
  const audioEditions = editions.filter(edition => edition.hasAudio)
  const primaryHasAudio = audioEditions.some(edition => edition.key === prefs.primaryEdition)
  if (primaryHasAudio) return { ...prefs, audioEdition: prefs.primaryEdition }
  if (audioEditions.some(edition => edition.key === prefs.audioEdition)) return prefs
  return { ...prefs, audioEdition: audioEditions[0]?.key || prefs.primaryEdition }
}

export function effectiveLabAudioEdition(prefs: LabPrefs, editions: Edition[] = bibleEditions()): string {
  return syncLabAudioEdition(prefs, editions).audioEdition
}

export function labFontFamilyCss(family: LabFontFamily): string {
  if (family === 'baskerville') return "'Libre Baskerville', 'EB Garamond', Georgia, serif"
  if (family === 'sourceserif') return "'Source Serif 4', 'EB Garamond', Georgia, serif"
  if (family === 'literata') return "'Literata', 'EB Garamond', Georgia, serif"
  if (family === 'atkinson') return "'Atkinson Hyperlegible', 'IBM Plex Sans', system-ui, sans-serif"
  return "'EB Garamond', Georgia, 'Times New Roman', serif"
}

function isMetric(value: unknown): value is ProgressMetric {
  return value === 'percent' || value === 'time' || value === 'page' || value === 'location'
}

function isScope(value: unknown): value is ProgressScope {
  return value === 'book' || value === 'section' || value === 'chapter'
}

/**
 * Stored faces, including the two the store did not know before. A reader
 * whose prefs predate them still parses — the old three are still the old
 * three — and an unreadable value falls back to "never chosen" rather than
 * to a face nobody picked.
 */
function isFamily(value: unknown): value is LabFontFamily {
  return value === 'garamond' || value === 'baskerville' || value === 'sourceserif'
    || value === 'literata' || value === 'atkinson'
}

function isTheme(value: unknown): value is LabTheme {
  return value === 'system' || value === 'light' || value === 'dark' || value === 'book'
}

function parseAppearance(
  raw: unknown,
  fallback: LabAppearancePrefs,
  legacy = false,
): LabAppearancePrefs {
  const src = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const pd = src.progressDisplay && typeof src.progressDisplay === 'object'
    ? src.progressDisplay as Record<string, unknown>
    : {}
  const fontSize = typeof src.fontSize === 'number' && Number.isFinite(src.fontSize)
    ? Math.max(LAB_MIN_FONT_SIZE, Math.min(LAB_MAX_FONT_SIZE, src.fontSize))
    : fallback.fontSize
  return {
    theme: isTheme(src.theme)
      ? src.theme
      : (legacy && Object.keys(src).length ? (src.darkMode === true ? 'dark' : 'light') : fallback.theme),
    fontFamily: isFamily(src.fontFamily) ? src.fontFamily : fallback.fontFamily,
    fontSize,
    alignment: src.alignment === 'left' || src.alignment === 'justify' ? src.alignment : fallback.alignment,
    lineSpacing: src.lineSpacing === 'compact' || src.lineSpacing === 'open'
      ? src.lineSpacing
      : fallback.lineSpacing,
    margins: src.margins === 'narrow' || src.margins === 'wide' || src.margins === 'medium'
      ? src.margins
      : fallback.margins,
    paragraphSpacing: src.paragraphSpacing === 'compact' || src.paragraphSpacing === 'generous'
      ? src.paragraphSpacing
      : fallback.paragraphSpacing,
    progressDisplay: {
      metric: isMetric(pd.metric) ? pd.metric : fallback.progressDisplay.metric,
      scope: isScope(pd.scope) ? pd.scope : fallback.progressDisplay.scope,
    },
  }
}

function parseSeenOnce(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== 'object') return {}
  const seen: Record<string, boolean> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === true) seen[key] = true
  }
  return seen
}

function parseShared(raw: unknown, fallback: LabSharedPrefs): LabSharedPrefs {
  const src = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const parsedSpeed = typeof src.audioSpeed === 'number' && Number.isFinite(src.audioSpeed)
    ? Math.max(0.5, Math.min(3, Math.round(src.audioSpeed * 100) / 100))
    : fallback.audioSpeed
  return {
    primaryEdition: typeof src.primaryEdition === 'string' && src.primaryEdition
      ? src.primaryEdition
      : fallback.primaryEdition,
    compareEdition: typeof src.compareEdition === 'string' && src.compareEdition
      ? src.compareEdition
      : fallback.compareEdition,
    audioEdition: typeof src.audioEdition === 'string' && src.audioEdition
      ? src.audioEdition
      : fallback.audioEdition,
    audioSpeed: parsedSpeed,
    compareOpen: typeof src.compareOpen === 'boolean' ? src.compareOpen : fallback.compareOpen,
  }
}

const DEFAULT_LAB_APPEARANCE: LabAppearancePrefs = {
  theme: DEFAULT_LAB_PREFS.theme,
  fontFamily: DEFAULT_LAB_PREFS.fontFamily,
  fontSize: DEFAULT_LAB_PREFS.fontSize,
  alignment: DEFAULT_LAB_PREFS.alignment,
  lineSpacing: DEFAULT_LAB_PREFS.lineSpacing,
  margins: DEFAULT_LAB_PREFS.margins,
  paragraphSpacing: DEFAULT_LAB_PREFS.paragraphSpacing,
  progressDisplay: DEFAULT_LAB_PREFS.progressDisplay,
}

const DEFAULT_LAB_SHARED: LabSharedPrefs = {
  primaryEdition: DEFAULT_LAB_PREFS.primaryEdition,
  compareEdition: DEFAULT_LAB_PREFS.compareEdition,
  audioEdition: DEFAULT_LAB_PREFS.audioEdition,
  audioSpeed: DEFAULT_LAB_PREFS.audioSpeed,
  compareOpen: DEFAULT_LAB_PREFS.compareOpen,
}

export function parseLabStoredPrefs(raw: unknown): LabStoredPrefs {
  const src = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  if (src.version === 2 && src.shared && typeof src.shared === 'object') {
    return {
      version: 2,
      shared: parseShared(src.shared, DEFAULT_LAB_SHARED),
      phone: parseAppearance(src.phone, DEFAULT_LAB_APPEARANCE),
      desktop: parseAppearance(src.desktop, DEFAULT_LAB_APPEARANCE),
      seenOnce: parseSeenOnce(src.seenOnce),
    }
  }

  // V1 was one flat object. Cloning its appearance into both profiles keeps
  // every existing choice while making the migration deterministic.
  const appearance = parseAppearance(src, DEFAULT_LAB_APPEARANCE, true)
  return {
    version: 2,
    shared: parseShared(src, DEFAULT_LAB_SHARED),
    phone: { ...appearance, progressDisplay: { ...appearance.progressDisplay } },
    desktop: { ...appearance, progressDisplay: { ...appearance.progressDisplay } },
    seenOnce: parseSeenOnce(src.seenOnce),
  }
}

function runtimeLabPrefs(stored: LabStoredPrefs, profile: LabAppearanceProfile): LabPrefs {
  const appearance = stored[profile]
  return {
    ...stored.shared,
    ...appearance,
    progressDisplay: { ...appearance.progressDisplay },
    darkMode: appearance.theme === 'dark',
  }
}

export function parseLabPrefs(raw: unknown, profile: LabAppearanceProfile = 'phone'): LabPrefs {
  return runtimeLabPrefs(parseLabStoredPrefs(raw), profile)
}

function readLabStoredPrefs(): LabStoredPrefs {
  if (typeof localStorage === 'undefined') return parseLabStoredPrefs(null)
  try {
    const raw = localStorage.getItem(LAB_PREFS_KEY)
    if (!raw) return parseLabStoredPrefs(null)
    return parseLabStoredPrefs(JSON.parse(raw))
  } catch {
    return parseLabStoredPrefs(null)
  }
}

export function readLabPrefs(profile: LabAppearanceProfile = 'phone'): LabPrefs {
  return runtimeLabPrefs(readLabStoredPrefs(), profile)
}

export function writeLabPrefs(prefs: LabPrefs, profile: LabAppearanceProfile = 'phone'): void {
  if (typeof localStorage === 'undefined') return
  try {
    const current = readLabStoredPrefs()
    const appearance: LabAppearancePrefs = {
      theme: prefs.theme,
      fontFamily: prefs.fontFamily,
      fontSize: prefs.fontSize,
      alignment: prefs.alignment,
      lineSpacing: prefs.lineSpacing,
      margins: prefs.margins,
      paragraphSpacing: prefs.paragraphSpacing,
      progressDisplay: { ...prefs.progressDisplay },
    }
    const next: LabStoredPrefs = {
      version: 2,
      shared: parseShared(prefs, current.shared),
      phone: profile === 'phone' ? appearance : current.phone,
      desktop: profile === 'desktop' ? appearance : current.desktop,
      seenOnce: current.seenOnce,
    }
    localStorage.setItem(LAB_PREFS_KEY, JSON.stringify(next))
  } catch {
    /* quota / private mode */
  }
}

export function labProgressKnobLive(metric: ProgressMetric, scope: ProgressScope): boolean {
  if (metric === 'percent' && (scope === 'chapter' || scope === 'book')) return true
  return metric === 'page' && scope === 'chapter'
}

/** Foot strip. PAGE of CHAPTER is the live default. Cheap knobs change it. */
export function labFootProgress(input: {
  chapterNumber: number
  chapterLabel?: string
  currentPage: number
  totalPages: number
  percent: number
  chapterCount?: number
  metric?: ProgressMetric
  scope?: ProgressScope
}): string {
  const metric = input.metric ?? 'page'
  const scope = input.scope ?? 'chapter'
  const chapter = (input.chapterLabel || '').trim() || `Chapter ${input.chapterNumber}`
  if (metric === 'percent' && scope === 'chapter') {
    return `${chapter} — ${input.percent}%`
  }
  if (metric === 'percent' && scope === 'book' && input.chapterCount && input.chapterCount > 0) {
    const bookPct = Math.round((input.chapterNumber / input.chapterCount) * 100)
    return `${Math.max(0, Math.min(100, bookPct))}%`
  }
  return `${chapter} — ${input.currentPage} / ${input.totalPages}`
}

/** Page index only — for the slim transport strip while audio is playing. */
export function labFootProgressPages(currentPage: number, totalPages: number): string {
  return `${currentPage} / ${totalPages}`
}

/** Mobile reader chrome already names the chapter in the header. */
export function labCompactFootProgress(progress: string): string {
  const separator = progress.lastIndexOf(' — ')
  return separator >= 0 ? progress.slice(separator + 3) : progress
}

export type LabReaderProgressMode = 'book' | 'chapter'

function labPageNumber(value: number): string {
  return Math.max(0, Math.round(value)).toLocaleString('en-US')
}

export function labReaderProgressLabel(input: {
  mode: LabReaderProgressMode
  currentPage: number
  totalPages: number
  chapterPercent: number
  chapterNumber: number
  chapterWordsRead: number
  chapterWordCounts: Array<{ number: number; wordCount?: number }>
  wordsPerPage: number
}): string {
  if (input.mode === 'chapter') {
    return `${labPageNumber(input.currentPage)} / ${labPageNumber(input.totalPages)} of chapter · ${input.chapterPercent}%`
  }

  const ordered = [...input.chapterWordCounts].sort((a, b) => a.number - b.number)
  const totalWords = ordered.reduce((total, chapter) => total + Math.max(0, chapter.wordCount || 0), 0)
  const wordsBefore = ordered
    .filter(chapter => chapter.number < input.chapterNumber)
    .reduce((total, chapter) => total + Math.max(0, chapter.wordCount || 0), 0)

  if (totalWords <= 0) {
    const chapterIndex = Math.max(0, ordered.findIndex(chapter => chapter.number === input.chapterNumber))
    const chapterCount = Math.max(1, ordered.length)
    const estimatedTotal = Math.max(input.totalPages, input.totalPages * chapterCount)
    const estimatedPage = Math.max(1, Math.min(estimatedTotal, chapterIndex * input.totalPages + input.currentPage))
    const estimatedPercent = Math.round((estimatedPage / Math.max(1, estimatedTotal)) * 100)
    return `${labPageNumber(estimatedPage)} / ${labPageNumber(estimatedTotal)} of book · ${estimatedPercent}%`
  }

  const absoluteWords = Math.max(0, Math.min(totalWords, wordsBefore + input.chapterWordsRead))
  const capacity = Math.max(1, Math.round(input.wordsPerPage))
  const bookTotalPages = Math.max(1, Math.ceil(totalWords / capacity))
  const bookPage = Math.max(1, Math.min(bookTotalPages, Math.ceil(Math.max(1, absoluteWords) / capacity)))
  const bookPercent = Math.round((absoluteWords / totalWords) * 100)
  return `${labPageNumber(bookPage)} / ${labPageNumber(bookTotalPages)} of book · ${bookPercent}%`
}

export function editionLabelFor(key: string, editions: Edition[]): string {
  return editions.find(edition => edition.key === key)?.label || key
}
