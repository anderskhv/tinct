import type { Edition, FontFamily, ProgressDisplay, ProgressMetric, ProgressScope } from '../types'
import { BIBLE } from '../data/bookRegistry'
import { LAB_COMPARE_EDITION_KEY, LAB_EDITION_KEY } from './labSource'

/** Public Tinct library hub. Full navigation, never /app or a book id. */
export const LAB_LIBRARY_URL = '/read/'

export const LAB_PREFS_KEY = 'tinct-lab-prefs'

export const LAB_FONT_SIZES = [1.0, 1.2, 1.5, 1.8, 2.2] as const
export const LAB_FONT_FAMILIES: FontFamily[] = ['garamond', 'baskerville', 'sourceserif']

export interface LabPrefs {
  primaryEdition: string
  compareEdition: string
  audioEdition: string
  darkMode: boolean
  fontFamily: FontFamily
  fontSize: number
  progressDisplay: ProgressDisplay
  compareOpen: boolean
}

export const DEFAULT_LAB_PREFS: LabPrefs = {
  primaryEdition: LAB_EDITION_KEY,
  compareEdition: LAB_COMPARE_EDITION_KEY,
  audioEdition: LAB_EDITION_KEY,
  darkMode: false,
  fontFamily: 'garamond',
  fontSize: 1.3,
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
export function syncLabAudioEdition(prefs: LabPrefs): LabPrefs {
  const primaryHasAudio = bibleAudioEditions().some(edition => edition.key === prefs.primaryEdition)
  if (primaryHasAudio) return { ...prefs, audioEdition: prefs.primaryEdition }
  return prefs
}

export function effectiveLabAudioEdition(prefs: LabPrefs): string {
  return syncLabAudioEdition(prefs).audioEdition
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

export function parseLabPrefs(raw: unknown): LabPrefs {
  const src = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const pd = src.progressDisplay && typeof src.progressDisplay === 'object'
    ? src.progressDisplay as Record<string, unknown>
    : {}
  const fontSize = typeof src.fontSize === 'number' && Number.isFinite(src.fontSize)
    ? src.fontSize
    : DEFAULT_LAB_PREFS.fontSize
  return {
    primaryEdition: typeof src.primaryEdition === 'string' && src.primaryEdition
      ? src.primaryEdition
      : DEFAULT_LAB_PREFS.primaryEdition,
    compareEdition: typeof src.compareEdition === 'string' && src.compareEdition
      ? src.compareEdition
      : DEFAULT_LAB_PREFS.compareEdition,
    audioEdition: typeof src.audioEdition === 'string' && src.audioEdition
      ? src.audioEdition
      : DEFAULT_LAB_PREFS.audioEdition,
    darkMode: src.darkMode === true,
    fontFamily: isFamily(src.fontFamily) ? src.fontFamily : DEFAULT_LAB_PREFS.fontFamily,
    fontSize,
    progressDisplay: {
      metric: isMetric(pd.metric) ? pd.metric : DEFAULT_LAB_PREFS.progressDisplay.metric,
      scope: isScope(pd.scope) ? pd.scope : DEFAULT_LAB_PREFS.progressDisplay.scope,
    },
    compareOpen: src.compareOpen === true,
  }
}

export function readLabPrefs(): LabPrefs {
  if (typeof localStorage === 'undefined') return parseLabPrefs(null)
  try {
    const raw = localStorage.getItem(LAB_PREFS_KEY)
    if (!raw) return parseLabPrefs(null)
    return parseLabPrefs(JSON.parse(raw))
  } catch {
    return parseLabPrefs(null)
  }
}

export function writeLabPrefs(prefs: LabPrefs): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(LAB_PREFS_KEY, JSON.stringify(prefs))
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

export function editionLabelFor(key: string, editions: Edition[]): string {
  return editions.find(edition => edition.key === key)?.label || key
}
