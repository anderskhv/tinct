/**
 * Presentation of any book beyond running prose: subheadings, list items,
 * labels, a chapter's subtitle and byline, links, and a book's title opening.
 * Applied at render time only.
 *
 * Every edition keeps the same shape -- chapters of plain paragraph strings --
 * so positions (`paragraphIndex:wordIndex`), highlights, word counts,
 * pagination and the companion's context are untouched. What a paragraph IS (a
 * heading, a list item, a line of verse) travels beside it in the chapter
 * (`kinds`, `links`: types/index.ts), for a built-in edition's chapter JSON
 * and a reader's own converted EPUB alike, and is registered here as the
 * chapter loads (`registerChapterStructure`), looked up by paragraph TEXT,
 * exactly as verse lineation is (labVerseLines.ts): the reader paints a
 * paragraph through several components and measurement copies, and every one
 * of them already has the paragraph's text. A chapter that records nothing
 * stays prose, except that a heading line is still kept with the text after
 * it (`looksLikeHeading`).
 *
 * A bare web address in the text ("https://youtu.be/…") is a link wherever it
 * appears; it is shown as its domain with an arrow ("youtu.be ↗") and opens in
 * a new tab. The address itself stays the stored word, so copying, highlights
 * and positions see the real text.
 */

import type { Chapter, ParagraphKind } from '../types'
import { isFigureToken, registerFigures } from './labFigures'

export type LabParagraphKind = ParagraphKind

const KINDS = new Set<LabParagraphKind>(['heading', 'label', 'item', 'subtitle', 'byline', 'line'])

/** Paragraph text -> its kind. `null` records a contradiction: the same text registered as two kinds paints as prose. */
const kinds = new Map<string, LabParagraphKind | null>()

/** Paragraph text -> external links by word range [from, to). */
const links = new Map<string, Array<[number, number, string]> | null>()

export interface LabBookOpening { title: string; subtitle?: string; author?: string }

/** Chapter title -> the book's title opening shown above that chapter's heading. */
const openings = new Map<string, LabBookOpening>()

export function registerParagraphKinds(paragraphs: string[], list: ReadonlyArray<LabParagraphKind | null | undefined> | undefined): void {
  if (!list) return
  paragraphs.forEach((text, index) => {
    const kind = list[index]
    if (!text || !kind || !KINDS.has(kind)) return
    if (kinds.has(text) && kinds.get(text) !== kind) { kinds.set(text, null); return }
    kinds.set(text, kind)
  })
}

export function paragraphKind(text: string | undefined): LabParagraphKind | null {
  return text ? kinds.get(text) ?? null : null
}

const SMALL_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'nor', 'but', 'of', 'for', 'in', 'on', 'to', 'at', 'by', 'with', 'from', 'into', 'as', 'vs', 'is', 'its', 'de', 'la', 'le', 'du', 'des', 'et'])

/**
 * A paragraph set as a heading in a book that records no kinds (every
 * built-in edition): a short line with no closing punctuation whose words are
 * all capitals or title-cased ("WHAT BEFELL DON QUIXOTE", "The Division of
 * Labour", "Limits Of The Township", "JULIE"), or a section break ("* * *").
 * Deliberately narrow: a lower-case or punctuated line is never one, so verse,
 * dialogue and BSB poetry lines stay prose.
 */
export function looksLikeHeading(text: string | undefined): boolean {
  const plain = (text || '').replace(/(^|\s)_+|_+(\s|$)/g, '$1$2').replace(/\s+/g, ' ').trim()
  if (!plain || plain.length > 80) return false
  if (/^(\*\s*){3,}$|^[—–-]{3,}$|^[·•⁂❧✦✧\s]{1,9}$/u.test(plain) && /\S/.test(plain)) return true
  // Starts with a letter and ends with a letter or digit: never a quotation,
  // a bracketed stage direction or a numbered verse.
  if (!/^\p{Lu}/u.test(plain) || !/[\p{L}\p{N}]$/u.test(plain)) return false
  // A stage exit belongs to the speech before it.
  if (/^(exit|exeunt|exeant)\b/i.test(plain)) return false
  const words = plain.split(' ')
  if (words.length > 10) return false
  const lettered = words.filter(word => /\p{L}/u.test(word))
  if (lettered.every(word => word === word.toUpperCase()) && plain.replace(/[^\p{L}]/gu, '').length >= 2) return true
  // Title case needs two words: one capitalised word alone ("Selah", a
  // letter's signature) is as likely to close what came before.
  return lettered.length >= 2 && lettered.every((word, index) => /^[^\p{L}]*\p{Lu}/u.test(word)
    || (index > 0 && SMALL_WORDS.has(word.toLowerCase().replace(/[^\p{L}]/gu, ''))))
}

/**
 * Headings and labels belong to the text after them: a page never ends on
 * one. A reader's own book says which paragraphs they are; any other book's
 * heading lines are recognised by their shape (`looksLikeHeading`).
 */
export function paragraphKeepsWithNext(text: string | undefined): boolean {
  if (!text) return false
  if (kinds.has(text)) {
    const kind = kinds.get(text)
    return kind === 'heading' || kind === 'label' || kind === 'subtitle'
  }
  return looksLikeHeading(text)
}

/**
 * Classes for the block a paragraph slice paints in. `from` is the slice's
 * first word: a list item continued from the previous page has no bullet.
 */
export function paragraphKindClass(text: string | undefined, from = 0): string {
  // A figure (labFigures.ts) is a block of its own: never justified, never hyphenated.
  if (isFigureToken(text)) return ' is-figure'
  const kind = paragraphKind(text)
  if (!kind) return ''
  return ` is-kind-${kind}${from > 0 ? ' is-kind-resumed' : ''}`
}

const SAFE_HREF = /^https?:\/\/[^\s<>"]+$/i

export function safeExternalHref(href: string | null | undefined): string | null {
  const value = (href || '').trim()
  if (!SAFE_HREF.test(value)) return null
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch { return null }
}

export function registerParagraphLinks(paragraphs: string[], list: ReadonlyArray<[number, number, number, string]> | undefined): void {
  if (!list) return
  const byParagraph = new Map<number, Array<[number, number, string]>>()
  for (const [paragraph, from, to, href] of list) {
    const safe = safeExternalHref(href)
    if (!safe || !(to > from) || !paragraphs[paragraph]) continue
    byParagraph.set(paragraph, [...(byParagraph.get(paragraph) ?? []), [from, to, safe]])
  }
  for (const [paragraph, ranges] of byParagraph) {
    const text = paragraphs[paragraph]
    const existing = links.get(text)
    if (existing !== undefined && JSON.stringify(existing) !== JSON.stringify(ranges)) { links.set(text, null); continue }
    links.set(text, ranges)
  }
}

const BARE_URL = /^([(“"‘']*)(https?:\/\/[^\s]+?)([.,;:!?)\]”’"']*)$/i

export interface LabWordLink {
  href: string
  /** What the word shows: its own text, or a bare address's domain. */
  label: string
  /** Text before and after the label (brackets, punctuation), outside the link. */
  lead: string
  trail: string
  /** The link's last word carries the arrow. */
  end: boolean
}

function hostLabel(href: string): string {
  try { return new URL(href).hostname.replace(/^www\./i, '') || href } catch { return href }
}

/** The link a painted word belongs to, if any. `text` is the paragraph; `word` the word's own text. */
export function wordLink(text: string | undefined, wordIndex: number, word: string): LabWordLink | null {
  const bare = BARE_URL.exec(word)
  if (bare) {
    const href = safeExternalHref(bare[2])
    if (href) return { href, label: hostLabel(href), lead: bare[1], trail: bare[3], end: true }
  }
  if (!text) return null
  const range = links.get(text)?.find(([from, to]) => wordIndex >= from && wordIndex < to)
  if (!range) return null
  return { href: range[2], label: word, lead: '', trail: '', end: wordIndex === range[1] - 1 }
}

/**
 * Register what a chapter records beside its paragraphs (kinds, links, figures), for
 * any book: a built-in edition's chapter JSON and a reader's own converted
 * EPUB carry the same fields. A chapter without them registers nothing.
 */
export function registerChapterStructure(chapter: Pick<Chapter, 'paragraphs' | 'kinds' | 'links' | 'figures'> & { number?: number } | null | undefined): void {
  if (!chapter) return
  registerParagraphKinds(chapter.paragraphs, chapter.kinds)
  registerParagraphLinks(chapter.paragraphs, chapter.links)
  registerFigures(chapter)
}

export function registerBookOpening(chapterTitle: string, opening: LabBookOpening): void {
  if (chapterTitle && opening.title) openings.set(chapterTitle, opening)
}

export function bookOpening(chapterTitle: string | undefined): LabBookOpening | null {
  return chapterTitle ? openings.get(chapterTitle) ?? null : null
}

/** Test seam. */
export function resetParagraphStyles(): void {
  kinds.clear()
  links.clear()
  openings.clear()
}
