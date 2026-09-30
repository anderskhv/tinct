/**
 * Reader boot: decisions the reader page makes before its app bundle runs.
 *
 * `readerBootEntry.ts` runs these from a tiny classic script in the reader
 * HTML head, before first paint. It only reads storage (the library handoff
 * stays for the app to consume) and only ever asks the browser for things
 * the app is about to ask for itself, with byte-identical URLs:
 *
 * - the opening chapter text and its patches, so the network starts while
 *   the bundle downloads rather than after it has executed;
 * - the default reading face, so the first pagination is not waiting on it;
 * - the paper colour, so the page never paints a different colour first.
 *
 * Everything here is a pure function of its inputs so the tests can compare
 * it with what the loaders really fetch. Keep imports import-free modules.
 */
import { editionPatchesPath, editionShardManifestUrl, editionShardPath, editionShardUrl, editionWholeUrl } from '../data/editionUrls'

export const READER_BOOT_HANDOFF_KEY = 'tinct:lab-reader-handoff'
export const READER_BOOT_PREFS_KEY = 'tinct-lab-prefs'
export const READER_BOOT_BIBLE_ID = 'bible'

/** Paper colours per resolved theme; LabApp paints the same values. */
export const LAB_THEME_PAPER = {
  light: '#f2eee4',
  book: '#e7dcc7',
  dark: '#171411',
} as const
export type LabResolvedTheme = keyof typeof LAB_THEME_PAPER

/** Literata regular, the reading face of a reader who never chose one. */
export const READER_BOOT_DEFAULT_FACE_URL = '/fonts/0a982198-or3PQ6P12-iJxAIgLa78DkTtAoDhk0oVpaK3YLanFLHpPf2TbLi4J_HWTA.woff2'

export interface ReaderBootHandoff {
  bookId: string
  primaryEditionKey: string
  chapterNumber: number
}

const ID = /^[a-z0-9-]{1,80}$/

/** The book, edition and chapter a library handoff opens; null when it is not one. */
export function readerBootHandoff(raw: string | null): ReaderBootHandoff | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as {
      kind?: unknown
      bookId?: unknown
      primaryEditionKey?: unknown
      savedPlace?: { chapterNumber?: unknown } | null
    }
    if (value?.kind !== 'open-reader') return null
    const { bookId, primaryEditionKey } = value
    if (typeof bookId !== 'string' || !ID.test(bookId)) return null
    if (typeof primaryEditionKey !== 'string' || !ID.test(primaryEditionKey)) return null
    const chapter = value.savedPlace?.chapterNumber
    return {
      bookId,
      primaryEditionKey,
      chapterNumber: typeof chapter === 'number' && Number.isSafeInteger(chapter) && chapter >= 1 ? chapter : 1,
    }
  } catch {
    return null
  }
}

export interface ReaderBootPreloadOptions {
  /** The build's `__BUILD_VERSION__`, as the loaders append it. */
  version: string
  /** `CHAPTER_SHARDED_EDITION_IDS`: `${bookId}-${editionKey}` values. */
  shardedEditionIds: readonly string[]
  /** `tinct:chapter-sharded-editions` is "0": the loader reads whole books. */
  shardWindowDisabled?: boolean
}

/**
 * The requests `loadLabBookSource` makes first for this handoff, most
 * urgent first. The Bible reads its chapter manifest and one chapter; a
 * chapter-sharded book its manifest and the chapter with both neighbours
 * (the loader's window); any other book its whole edition. Non-Bible text is
 * joined by its patches, which the loader waits on for up to 350 ms.
 */
export function readerBootPreloads(handoff: ReaderBootHandoff, options: ReaderBootPreloadOptions): string[] {
  const { bookId, primaryEditionKey: key, chapterNumber } = handoff
  const { version } = options
  if (bookId === READER_BOOT_BIBLE_ID) {
    return [
      editionShardManifestUrl(bookId, key, version),
      editionShardUrl(bookId, key, editionShardPath(chapterNumber), version),
    ]
  }
  const patches = editionPatchesPath(bookId, key)
  if (options.shardedEditionIds.includes(`${bookId}-${key}`)) {
    // A reader who switched the window off may be on the whole-book path;
    // guess nothing rather than download a book twice.
    if (options.shardWindowDisabled) return []
    const window = [chapterNumber, chapterNumber - 1, chapterNumber + 1].filter(number => number >= 1)
    return [
      editionShardManifestUrl(bookId, key, version),
      ...window.map(number => editionShardUrl(bookId, key, editionShardPath(number), version)),
      patches,
    ]
  }
  return [editionWholeUrl(bookId, key, version), patches]
}

type StoredTheme = 'system' | LabResolvedTheme

function storedTheme(value: unknown): StoredTheme | null {
  return value === 'system' || value === 'light' || value === 'dark' || value === 'book' ? value : null
}

/** Each appearance profile's stored theme and face, as `parseLabStoredPrefs` reads them. */
function storedAppearances(raw: string | null): Array<{ theme: StoredTheme; fontFamily: unknown }> | null {
  let src: Record<string, unknown> = {}
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (parsed && typeof parsed === 'object') src = parsed as Record<string, unknown>
    } catch {
      return null
    }
  }
  if (src.version === 2 && src.shared && typeof src.shared === 'object') {
    return ['phone', 'desktop'].map(profile => {
      const appearance = src[profile] && typeof src[profile] === 'object' ? src[profile] as Record<string, unknown> : {}
      return { theme: storedTheme(appearance.theme) ?? 'system', fontFamily: appearance.fontFamily }
    })
  }
  // Version 1 was one flat object shared by both profiles.
  const theme = storedTheme(src.theme)
    ?? (Object.keys(src).length ? (src.darkMode === true ? 'dark' : 'light') : 'system')
  return [{ theme, fontFamily: src.fontFamily }]
}

/**
 * The paper the reader will paint, or null when it cannot be known before
 * the app runs: the phone and desktop profiles disagree (which one applies is
 * the app's layout decision), the prefs are unreadable, or the device uses
 * the e-ink profile, which paints its own white.
 */
export function readerBootTheme(rawPrefs: string | null, systemDark: boolean, eink: boolean): LabResolvedTheme | null {
  if (eink) return null
  const appearances = storedAppearances(rawPrefs)
  if (!appearances) return null
  const resolved = new Set(appearances.map(({ theme }) => theme === 'system' ? (systemDark ? 'dark' : 'light') : theme))
  return resolved.size === 1 ? [...resolved][0] : null
}

/** Whether every profile reads in the default face (never chose, or chose Literata). */
export function readerBootUsesDefaultFace(rawPrefs: string | null): boolean {
  const appearances = storedAppearances(rawPrefs)
  if (!appearances) return false
  return appearances.every(({ fontFamily }) => fontFamily == null || fontFamily === 'literata')
}

/** Mirrors `readEinkProfile` in public/lab/display-profile.js. */
export function readerBootEink(search: string, storedProfile: string | null): boolean {
  const query = new URLSearchParams(search).get('eink')
  if (query === '1' || query === '0') return query === '1'
  return storedProfile === 'eink'
}
