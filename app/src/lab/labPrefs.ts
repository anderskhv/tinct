import type { Edition, FontFamily, ProgressDisplay, ProgressMetric, ProgressScope } from '../types'
import { BIBLE } from '../data/bookRegistry'
import { LAB_COMPARE_EDITION_KEY, LAB_EDITION_KEY } from './labSource'

/** Lab library route. Full navigation, never /app or a book id. */
export const LAB_LIBRARY_URL = '/lab/library'
/** The sign-in page only returns to pre-reader routes, so the reader's account links land in the library. */
export const LAB_SIGN_IN_URL = `/lab/sign-in?returnTo=${encodeURIComponent(LAB_LIBRARY_URL)}`
export const LAB_ACCOUNT_URL = `/lab/sign-in?mode=account&returnTo=${encodeURIComponent(LAB_LIBRARY_URL)}`

export const LAB_PREFS_KEY = 'tinct-lab-prefs'

export const LAB_MIN_FONT_SIZE = 0.8
export const LAB_MAX_FONT_SIZE = 2.2
export const LAB_FONT_SIZES = [LAB_MIN_FONT_SIZE, 1.0, 1.2, 1.5, 1.8, LAB_MAX_FONT_SIZE] as const
export const LAB_FONT_FAMILIES: FontFamily[] = ['garamond', 'baskerville', 'sourceserif']

export type LabTheme = 'system' | 'light' | 'dark' | 'book'
export type LabTextAlignment = 'left' | 'justify'
export type LabLineSpacing = 'compact' | 'comfortable' | 'open'
export type LabMargins = 'narrow' | 'medium' | 'wide'
export type LabParagraphSpacing = 'compact' | 'standard' | 'generous'
export type LabAppearanceProfile = 'phone' | 'desktop'

export interface LabAppearancePrefs {
  theme: LabTheme
  fontFamily: FontFamily
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
  fontFamily: 'garamond',
  fontSize: 1.3,
  alignment: 'justify',
  lineSpacing: 'comfortable',
  margins: 'medium',
  paragraphSpacing: 'standard',
  progressDisplay: { metric: 'page', scope: 'chapter' },
  compareOpen: false,
}

export function bibleEditions(): Edition[] {
  return BIBLE.editions
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

export function labFontFamilyCss(family: FontFamily): string {
  if (family === 'baskerville') return "'Libre Baskerville', 'EB Garamond', Georgia, serif"
  if (family === 'sourceserif') return "'Source Serif 4', 'EB Garamond', Georgia, serif"
  return "'EB Garamond', Georgia, 'Times New Roman', serif"
}

function isMetric(value: unknown): value is ProgressMetric {
  return value === 'percent' || value === 'time' || value === 'page' || value === 'location'
}

function isScope(value: unknown): value is ProgressScope {
  return value === 'book' || value === 'section' || value === 'chapter'
}

function isFamily(value: unknown): value is FontFamily {
  return value === 'garamond' || value === 'baskerville' || value === 'sourceserif'
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
