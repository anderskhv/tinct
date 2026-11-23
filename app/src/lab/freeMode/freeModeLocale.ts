/**
 * Free reading mode's languages (freeMode.ts). The reader has no translation system; free mode's own chrome is small
 * enough to keep its words in this one table. A free page links its books with `ref={slug}` and the reader's free
 * mode takes its language from that `ref`: the editions it offers, where its back arrow goes, and every label free
 * mode draws itself. To add a language, add an entry here and a page in src/seo/modernEnglishPage.ts.
 *
 * English is the default: any other `ref`, or none, reads exactly as free mode did before there was a second language.
 */
import { DANISH_FREE_PAGE_SLUG, MODERN_ENGLISH_PAGE_SLUG } from '../../data/freePages'

export interface FreeModeStrings {
  /** The switch's labels, by edition key, and `both` for the desktop's side-by-side view. */
  editions: Record<string, string>
  /** The switch's group name, for screen readers. */
  editionGroup: string
  menu: { appearance: string; bookSettings: string; library: string }
  /** The back arrow: its spoken name and its tooltip. */
  back: string
  backTitle: string
  copy: string
  copied: string
  /** The Copy bar's name, for screen readers. */
  selection: string
  nextChapter: string
  chapterFinished: string
}

export interface FreeModeLocale {
  id: 'en' | 'da'
  /** The `ref` that selects it: the slug of its page. */
  ref: string
  /** Where the back arrow goes. */
  home: string
  /** The two editions it reads: the original it is compared with, and the modern edition it opens in. */
  original: string
  modern: string
  /** The order of the switch: 'original' draws the original first (English), 'modern' the modern edition first. */
  first: 'original' | 'modern'
  strings: FreeModeStrings
}

export const FREE_MODE_ENGLISH: FreeModeLocale = {
  id: 'en',
  ref: MODERN_ENGLISH_PAGE_SLUG,
  home: `/${MODERN_ENGLISH_PAGE_SLUG}`,
  original: 'original-en',
  modern: 'modern-en',
  first: 'original',
  strings: {
    editions: { 'original-en': 'Original', 'modern-en': 'Modern', both: 'Both' },
    editionGroup: 'Edition',
    menu: { appearance: 'Appearance', bookSettings: 'Book settings', library: 'Library' },
    back: 'Back to the modern-English classics',
    backTitle: 'All the books',
    copy: 'Copy',
    copied: 'Copied',
    selection: 'Selection',
    nextChapter: 'Next chapter',
    chapterFinished: 'Chapter finished',
  },
}

export const FREE_MODE_DANISH: FreeModeLocale = {
  id: 'da',
  ref: DANISH_FREE_PAGE_SLUG,
  home: `/${DANISH_FREE_PAGE_SLUG}`,
  original: 'original-en',
  modern: 'modern-da',
  first: 'modern',
  strings: {
    // 'modern-en' is named for a book reached from the book picker that has no Danish edition.
    editions: { 'modern-da': 'Dansk', 'original-en': 'Engelsk', 'modern-en': 'Moderne engelsk', both: 'Begge' },
    editionGroup: 'Udgave',
    menu: { appearance: 'Udseende', bookSettings: 'Bogindstillinger', library: 'Bibliotek' },
    back: 'Tilbage til klassikerne på nutidsdansk',
    backTitle: 'Alle bøgerne',
    copy: 'Kopiér',
    copied: 'Kopieret',
    selection: 'Markering',
    nextChapter: 'Næste kapitel',
    chapterFinished: 'Kapitlet er slut',
  },
}

export const FREE_MODE_LOCALES: readonly FreeModeLocale[] = [FREE_MODE_ENGLISH, FREE_MODE_DANISH]

/** The language of a reader address: the one whose page the `ref` names, else English. */
export function freeModeLocaleFor(search: string): FreeModeLocale {
  const ref = new URLSearchParams(search).get('ref')
  return FREE_MODE_LOCALES.find(locale => locale.ref === ref) ?? FREE_MODE_ENGLISH
}

/**
 * A name from the registry in the Danish genitive: "George Longs", "Francis Storrs", "Marcus Aurelius’". A note in
 * brackets after the name is left out and an English "and" between two names becomes "og".
 */
export function danishGenitive(name: string): string {
  const plain = name.replace(/\s*\([^)]*\)\s*$/, '').replace(/ and /g, ' og ').trim()
  return /[sxz]$/i.test(plain) ? `${plain}’` : `${plain}s`
}
