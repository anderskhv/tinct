/**
 * The reading language of a reader's own book, which decides its hyphenation.
 *
 * A built-in edition states its language; an EPUB's `dc:language` is whatever
 * the tool that made it wrote: "en", "en-GB", "EN", "eng" (ISO 639-2, common
 * from Calibre), "English", or nothing at all. Read raw, everything but a bare
 * "en…" turned the phone's planned hyphenation off, so an English book set
 * justified with loose, gappy lines (Anders, iPhone, 7 Oct 2026).
 *
 * The tag is normalised to a language Tinct knows. A book that names none
 * ("", "und", "mul") is English only when its text plainly is; a book in any
 * other language is never hyphenated with English patterns.
 */
import type { Language } from '../../types'
import type { UserBookEdition } from './userEdition'

const ALIASES: Record<string, Language> = {
  en: 'en', eng: 'en', english: 'en',
  da: 'da', dan: 'da', danish: 'da', dansk: 'da',
  de: 'de', deu: 'de', ger: 'de', german: 'de', deutsch: 'de',
  fr: 'fr', fra: 'fr', fre: 'fr', french: 'fr', francais: 'fr', français: 'fr',
  it: 'it', ita: 'it', italian: 'it', italiano: 'it',
  ru: 'ru', rus: 'ru', russian: 'ru',
}

/** Tags that say nothing about the language. */
const UNSTATED = new Set(['', 'und', 'mul', 'zxx', 'mis', 'unknown'])

/** The language subtag of a `dc:language` value, lower case: "en-GB" -> "en", " EN " -> "en". */
function primarySubtag(tag: string | null | undefined): string {
  return (tag || '').trim().toLowerCase().split(/[-_\s]/)[0] ?? ''
}

/** The words that make up much of any English prose, and little of other languages'. */
const ENGLISH_WORDS = new Set([
  'the', 'and', 'of', 'to', 'a', 'in', 'is', 'that', 'it', 'was', 'for', 'on', 'with', 'as', 'be', 'by',
  'this', 'not', 'are', 'but', 'at', 'from', 'have', 'had', 'which', 'or', 'his', 'her', 'he', 'she',
  'they', 'we', 'you', 'its', 'their', 'an', 'were', 'been', 'has', 'what', 'there', 'would', 'could',
])
const SAMPLE_WORDS = 3000
const MIN_SAMPLE = 30
/** English prose runs 35–50% of these words; German, Danish or French well under 15%. */
const ENGLISH_SHARE = 0.25

/** True when a sample of the text is plainly English prose. */
export function looksEnglish(paragraphs: Iterable<string>): boolean {
  let words = 0
  let english = 0
  for (const paragraph of paragraphs) {
    for (const raw of paragraph.split(/\s+/)) {
      const word = raw.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
      if (!word) continue
      words += 1
      if (ENGLISH_WORDS.has(word)) english += 1
      if (words >= SAMPLE_WORDS) return english / words >= ENGLISH_SHARE
    }
  }
  return words >= MIN_SAMPLE && english / words >= ENGLISH_SHARE
}

function* bookText(edition: Pick<UserBookEdition, 'chapters'>): Generator<string> {
  for (const chapter of edition.chapters ?? []) yield* chapter.paragraphs ?? []
}

const resolved = new WeakMap<object, Language | null>()

/**
 * The book's language, when Tinct knows it: its tag normalised, or English
 * for an untagged book whose text is English. Null for a language Tinct has
 * no name for, or untagged text that is not plainly English.
 */
export function userBookLanguage(edition: Pick<UserBookEdition, 'language' | 'chapters'>): Language | null {
  const cached = resolved.get(edition)
  if (cached !== undefined) return cached
  const subtag = primarySubtag(edition.language)
  const language = ALIASES[subtag] ?? (UNSTATED.has(subtag) && looksEnglish(bookText(edition)) ? 'en' : null)
  resolved.set(edition, language)
  return language
}

/**
 * The reader's `lang` for the book: the normalised language, else the book's
 * own subtag (so a browser that knows it can hyphenate it), else nothing.
 */
export function userBookLangAttribute(edition: Pick<UserBookEdition, 'language' | 'chapters'>): string {
  const language = userBookLanguage(edition)
  if (language) return language
  const subtag = primarySubtag(edition.language)
  return /^[a-z]{2,3}$/.test(subtag) && !UNSTATED.has(subtag) ? subtag : ''
}
