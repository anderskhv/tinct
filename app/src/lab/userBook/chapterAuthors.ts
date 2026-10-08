/**
 * Who wrote each chapter of an essay collection or anthology, read from its
 * byline, and whether a book is a collection (EditionData.collection). The
 * EPUB converter (epubEdition.ts) uses these at conversion; a reader's own book
 * converted before bylines were read is healed from its stored text
 * (`healChapterAuthors`) without converting it again, so its chapters, their
 * numbers and every reading place stay exactly as they are. Pure; small.
 */
import type { UserBookEdition } from './userEdition'

const clean = (text: string) => text.replace(/\s+/g, ' ').trim()
const norm = (text: string) => text.toLowerCase().replace(/_/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const plain = (text: string) => clean(text.replace(/(^|\s)_|_(\s|$)/g, '$1$2'))
const NAME_PARTICLES = /^(and|&|with|van|von|de|der|den|du|da|di|la|le|bin|ibn|al)$/i

/** A person's name, or a few joined by "and" ("Sam Kuypers", "A. B. Smith and C. de Jong"). */
export function nameLike(text: string): boolean {
  const words = plain(text).replace(/^by\s+/i, '').split(/\s+/)
  if (words.length < 2 || words.length > 8 || text.length > 60) return false
  return words.every(word => /^\p{Lu}[\p{L}'’.-]*,?$/u.test(word) || NAME_PARTICLES.test(word))
    && words.filter(word => /^\p{Lu}/u.test(word)).length >= 2
}

/** "by", "written by", "An interview with", "In conversation with": the line names the chapter's writer. */
const BYLINE_LEAD = /^(?:(?:written\s+)?by|(?:an?\s+)?(?:interview|conversation|dialogue)\s+with|in\s+conversation\s+with)\s+/i
/** A credit that names someone other than the writer. */
const NOT_WRITER = /^(?:edited|compiled|selected|arranged|translated|introduced|illustrated|adapted|abridged|revised|foreword|introduction|preface|notes?|with an?)\b/i

/**
 * The person a chapter's byline names: "by David Deutsch", "An interview with
 * David Deutsch", or a name alone. `explicit` when the line says so ("by …");
 * a name alone could be anything set under a heading. Never an editor or a translator.
 */
export function bylineName(text: string): { name: string; explicit: boolean } | null {
  const line = plain(text).replace(/(?<=\S)\[\d{1,3}\]$/, '').replace(/[.,;:]+$/, '').trim()
  if (!line || line.length > 120 || NOT_WRITER.test(line)) return null
  const lead = line.match(BYLINE_LEAD)
  const name = (lead ? line.slice(lead[0].length) : line).trim()
  if (/^(by|to|for|from|in|on)\s/i.test(name) || !nameLike(name)) return null
  return { name, explicit: !!lead }
}

/** One person, however the book writes them: "Seneca" and "Lucius Annaeus Seneca", "D. Deutsch" and "David Deutsch". */
export function sameWriter(a: string, b: string): boolean {
  const ta = norm(a).split(' ').filter(Boolean)
  const tb = norm(b).split(' ').filter(Boolean)
  if (!ta.length || !tb.length || ta[ta.length - 1] !== tb[tb.length - 1]) return false
  const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta]
  return short.every(token => long.some(other => other === token || (token.length === 1 && other.startsWith(token)) || (other.length === 1 && token.startsWith(other))))
}

export interface BookCreators {
  /** The book's authors, one per `dc:creator` (editors and translators left out). */
  names: string[]
  /** Its credit is an editor's or a compiler's, or "Various": an edited collection. */
  edited: boolean
}

/** What a chapter says about its writer: a byline under its title, its own metadata, its contents entry. */
export interface AuthorCandidate {
  name: string
  /** `byline`: "by …" or a byline class; `metadata`: the chapter document's own author; `contents`: its contents entry; `name`: a name alone under the title. */
  source: 'byline' | 'metadata' | 'contents' | 'name'
}

/**
 * Who wrote each chapter, when the book says so with confidence: an essay
 * collection's or anthology's bylines ("by Jo Smith" under the title, a
 * byline class), a chapter document's own author metadata, or a contents entry
 * or a name alone that is one of the book's creators. Names alone under the
 * headings also count when the book sets different ones that way in more than
 * one chapter. A chapter by the book's one author records nothing, so a
 * single-author book is unchanged. A book is a collection when any chapter
 * names its own writer, its credit is an editor's, or it has three or more
 * creators: there, a chapter without a byline is by an unnamed writer.
 */
export function chapterAuthors(candidates: Array<AuthorCandidate | null>, creators: BookCreators): { authors: Array<string | undefined>; collection: boolean } {
  const creatorNamed = (name: string) => creators.names.some(creator => sameWriter(creator, name))
  const names = candidates.filter((candidate): candidate is AuthorCandidate => candidate?.source === 'name')
  const repeatedNames = names.length >= 2 && new Set(names.map(candidate => norm(candidate.name))).size >= 2
  const authors = candidates.map(candidate => {
    if (!candidate) return undefined
    const confident = candidate.source === 'byline' || candidate.source === 'metadata' || creatorNamed(candidate.name) || (candidate.source === 'name' && repeatedNames)
    if (!confident) return undefined
    // The book's one author: nothing to say per chapter.
    if (creators.names.length === 1 && !creators.edited && sameWriter(creators.names[0], candidate.name)) return undefined
    return candidate.name.slice(0, 120)
  })
  const collection = authors.some(Boolean) || creators.edited || creators.names.length >= 3
  return { authors, collection }
}

/** A chapter opening is this many paragraphs at most: the byline sits right under the title. */
const OPENING_PARAGRAPHS = 4

/**
 * Bylines for a reader's own book converted before they were read: the
 * stored chapters' own opening lines (a recorded byline, or "by …"), with
 * the book's credit as its creators. Only `author` and `collection` are added;
 * paragraphs, kinds and chapter numbers are untouched. A book already read
 * for bylines (`bylines`) is returned as it is, and so is one that gains nothing.
 */
export function healChapterAuthors(edition: UserBookEdition): UserBookEdition {
  if (edition.bylines) return edition
  const candidates = edition.chapters.map((chapter): AuthorCandidate | null => {
    for (let index = 0; index < Math.min(OPENING_PARAGRAPHS, chapter.paragraphs.length); index++) {
      const kind = chapter.kinds?.[index] ?? null
      if (kind !== 'byline' && kind !== 'subtitle' && kind !== null) return null
      const named = bylineName(chapter.paragraphs[index])
      if (named && (named.explicit || kind === 'byline')) return { name: named.name, source: named.explicit ? 'byline' : 'name' }
      if (kind === null) return null
    }
    return null
  })
  // The stored credit is the creators joined by ", ": split only where every part reads as a name.
  const parts = edition.author.split(/,\s*/).map(part => part.trim()).filter(Boolean)
  const names = parts.length > 1 && parts.every(nameLike) ? parts : edition.author.trim() ? [edition.author.trim()] : []
  const { authors, collection } = chapterAuthors(candidates, { names, edited: names.some(name => /^various( authors)?$/i.test(name)) })
  if (!collection && !authors.some(Boolean)) return edition
  return {
    ...edition,
    ...(collection ? { collection: true as const } : {}),
    chapters: edition.chapters.map((chapter, index) => authors[index] ? { ...chapter, author: authors[index] } : chapter),
  }
}
