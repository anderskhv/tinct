/**
 * Vocabulary hints for chat dictation: the names a reader of this book is
 * likely to say and a general speech model is likely to miss (Zerubbabel,
 * Telemachus, Ahasuerus). Sent to xAI speech-to-text as `keyterm`s, which are
 * capped at 100 terms of at most 50 characters.
 *
 * Order is priority, because the cap cuts from the end: the current chapter's
 * own names first, then the cast, then names from chapter titles, and for the
 * Bible the names of its books.
 */
import { parseBibleChapterTitle, type LabCastMember, type LabChapter } from './labSource'

export const DICTATION_KEYTERM_LIMIT = 100
export const DICTATION_KEYTERM_MAX_CHARS = 50
/** How many of the current chapter's names go first. */
const CHAPTER_NAME_LIMIT = 30

/** Capitalised words that are not names (sentence openers, pronouns, titles). */
const NOT_NAMES = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet', 'then', 'now', 'when', 'while', 'if', 'as', 'at', 'by',
  'in', 'into', 'of', 'on', 'to', 'up', 'with', 'from', 'after', 'before', 'because', 'behold', 'thus', 'therefore', 'also',
  'i', 'me', 'my', 'mine', 'we', 'us', 'our', 'you', 'your', 'ye', 'thee', 'thou', 'thy', 'thine', 'he', 'him', 'his', 'she',
  'her', 'hers', 'it', 'its', 'they', 'them', 'their', 'this', 'that', 'these', 'those', 'there', 'here', 'what', 'who',
  'whom', 'which', 'why', 'how', 'where', 'all', 'no', 'not', 'yes', 'o', 'oh', 'let', 'do', 'is', 'are', 'was', 'were', 'be',
  'god', 'lord', 'chapter', 'book', 'part', 'act', 'scene', 'canto', 'psalm', 'one', 'two', 'three', 'first', 'second',
  'mr', 'mrs', 'miss', 'sir', 'king', 'queen', 'prince', 'lady',
])

const NAME = /^\p{Lu}[\p{L}'’-]*\p{Ll}[\p{L}'’-]*$/u

function isName(word: string): boolean {
  return word.length >= 3 && NAME.test(word) && !NOT_NAMES.has(word.toLowerCase())
}

/** Capitalised words that are not the first word of a sentence, most frequent first. */
export function frequentProperNames(paragraphs: string[], limit = CHAPTER_NAME_LIMIT): string[] {
  // A name is a word seen capitalised inside a sentence; once known, every
  // capitalised use counts, including at the start of a sentence.
  const counts = new Map<string, number>()
  const midSentence = new Set<string>()
  const lowercase = new Set<string>()
  for (const paragraph of paragraphs) {
    const tokens = paragraph.match(/[\p{L}'’-]+|[.!?;:“”"]/gu) || []
    let sentenceStart = true
    for (const token of tokens) {
      if (/^[.!?;:“”"]$/u.test(token)) { if (/[.!?]/.test(token)) sentenceStart = true; continue }
      const word = token.replace(/^['’-]+|['’-]+$/g, '').replace(/['’]s$/u, '')
      if (!word) continue
      if (word === word.toLowerCase()) lowercase.add(word)
      else if (isName(word)) {
        counts.set(word, (counts.get(word) || 0) + 1)
        if (!sentenceStart) midSentence.add(word)
      }
      sentenceStart = false
    }
  }
  return [...counts.entries()]
    // A word that also appears in lower case is an ordinary word.
    .filter(([word]) => midSentence.has(word) && !lowercase.has(word.toLowerCase()))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word)
}

/** Proper nouns in chapter titles: every capitalised word that is not an ordinary word in the text. */
function titleNames(chapters: LabChapter[], ordinary: Set<string>): string[] {
  const names: string[] = []
  for (const chapter of chapters) {
    for (const token of chapter.title.match(/[\p{L}'’-]+/gu) || []) {
      const word = token.replace(/['’]s$/u, '')
      if (isName(word) && !ordinary.has(word.toLowerCase())) names.push(word)
    }
  }
  return names
}

/** The Bible's own book names, in canonical order ("1 Maccabees", "Song of Solomon"). */
export function bibleBookNames(chapters: LabChapter[]): string[] {
  return chapters.map(chapter => parseBibleChapterTitle(chapter.title).book)
}

export function buildDictationKeyterms(input: {
  bookId: string
  chapters: LabChapter[]
  /** The open chapter's text. */
  paragraphs: string[]
  cast?: LabCastMember[]
  /** The open chapter's title, e.g. "Ezra 3". */
  chapterTitle?: string
}): string[] {
  const bible = input.bookId === 'bible'
  const ordinary = new Set<string>()
  for (const paragraph of input.paragraphs) {
    for (const word of paragraph.match(/[\p{L}'’-]+/gu) || []) if (word === word.toLowerCase()) ordinary.add(word)
  }
  const candidates = [
    ...(bible && input.chapterTitle ? [parseBibleChapterTitle(input.chapterTitle).book] : []),
    ...frequentProperNames(input.paragraphs),
    ...(input.cast || []).map(member => member.name),
    ...(bible ? bibleBookNames(input.chapters) : titleNames(input.chapters, ordinary)),
  ]
  const seen = new Set<string>()
  const terms: string[] = []
  for (const candidate of candidates) {
    const term = candidate.replace(/\s+/g, ' ').trim()
    if (!term || term.length > DICTATION_KEYTERM_MAX_CHARS) continue
    const key = term.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    terms.push(term)
    if (terms.length >= DICTATION_KEYTERM_LIMIT) break
  }
  return terms
}
