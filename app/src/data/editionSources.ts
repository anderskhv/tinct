/**
 * What a book's Modern English edition was drafted from, for the edition note on its book page and chapter
 * pages (Anders, 16 Nov 2026). Filled from the registry only:
 *
 * - a translation: the original-en edition's `translator` and `year`;
 * - an English original: the book's `author`, for a book listed in ENGLISH_ORIGINAL_BOOKS (its original-en is
 *   the author's own English text, so the registry names no translator).
 *
 * Anything else is unknown: no note, and the book cannot be indexed (seoIndexAllowlist.ts).
 */
import type { Book } from '../types'

/**
 * Books written in English whose original-en edition is the author's own text. Federalist Papers and the US
 * founding documents are English too, but the registry names their authors as a list, which cannot stand in
 * the note's "{author}'s original text".
 */
export const ENGLISH_ORIGINAL_BOOKS: ReadonlySet<string> = new Set([
  'to-the-lighthouse', 'ulysses', 'pride-and-prejudice', 'sense-and-sensibility', 'jane-eyre', 'wuthering-heights',
  'middlemarch', 'frankenstein', 'moby-dick', 'great-expectations', 'heart-of-darkness', 'the-awakening',
  'a-little-princess', 'jungle-book', 'jekyll-and-hyde', 'alice-in-wonderland', 'paradise-lost', 'on-liberty',
  'utilitarianism', 'leviathan', 'hume-enquiry', 'wealth-of-nations', 'frederick-douglass', 'walden',
  'vindication-rights-of-woman',
  // Shakespeare
  'hamlet', 'macbeth', 'midsummer', 'romeo-and-juliet', 'the-tempest', 'comedy-of-errors', 'merchant-of-venice',
  'henry-v', 'as-you-like-it', 'winters-tale', 'julius-caesar', 'twelfth-night', 'measure-for-measure',
  'henry-iv-part-2', 'merry-wives-of-windsor', 'othello', 'king-lear', 'much-ado-about-nothing',
  'taming-of-the-shrew', 'antony-and-cleopatra', 'richard-iii', 'coriolanus', 'cymbeline',
])

export type EditionSource =
  | { kind: 'translation'; translator: string; year: number }
  | { kind: 'english-original'; author: string }

/** The source of `book`'s Modern English edition, or null when the registry does not say. */
export function editionSource(book: Pick<Book, 'id' | 'author' | 'editions'>): EditionSource | null {
  const original = book.editions.find(edition => edition.key === 'original-en')
  if (!original) return null
  if (original.translator) {
    return typeof original.year === 'number' && original.year > 0 ? { kind: 'translation', translator: original.translator, year: original.year } : null
  }
  return ENGLISH_ORIGINAL_BOOKS.has(book.id) && book.author ? { kind: 'english-original', author: book.author } : null
}

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * The edition note, in Anders's exact wording (16 Nov 2026; it stays true for every book, so it does not mention
 * human review). "The original is one tap away" replaced "always beside it" on 19 Nov 2026 (Anders): the chapter
 * pages now open on the Modern English alone, with the original behind a switch. "Tell us" is plain text: readers have no issue-report page to link to.
 */
export function editionNoteText(source: EditionSource): string {
  return source.kind === 'translation'
    ? `Tinct's modern English is drafted with AI from ${source.translator}'s public-domain translation (${source.year}), then checked by a separate AI review against that translation. The original is one tap away, and if you spot a mistake, tell us.`
    : `Tinct's modern English is drafted with AI from ${source.author}'s original text, then checked by a separate AI review against it. The original is one tap away, and if you spot a mistake, tell us.`
}

export const EDITION_NOTE_LEAD = 'How this edition was made.'

/** The note as HTML: the bold lead, then the sentence. */
export function editionNoteHtml(source: EditionSource): string {
  return `<strong>${EDITION_NOTE_LEAD}</strong> ${escape(editionNoteText(source))}`
}
