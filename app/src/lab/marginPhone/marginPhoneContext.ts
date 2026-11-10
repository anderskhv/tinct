import { createContext, useContext } from 'react'

/**
 * The phone's margin mode (`/reader?book=<id>&margin=1` on a phone,
 * marginPreviewMount.ts): today's phone reader with the dark selection bar,
 * bottom cards and the chapter pills. Present only in that mode; the chapter
 * heading and chapter end read it, in painted pages and in the paginators'
 * measuring copies alike, so both lay out the same pills.
 */
export interface MarginPhonePills {
  /** ✧ Catch me up, at a chapter's start. */
  onCatchUp?: () => void
  /** ✧ Catch me up is offered: false on the book's first chapter and its front matter (nothing before them to recap). */
  catchUp?: boolean
  /** ✧ Quiz me, at a chapter's end (and Quiz in the phone's chapter pill). */
  onQuiz?: (anchor?: DOMRect) => void
  /**
   * Where the start actions live (approved mockup, Anders 9 Nov 2026). 'phone': soft pills under the book's
   * opening (Primer · Summary · Reading angle) and under each chapter heading (Primer · Summary · Quiz).
   * 'desktop': in the margin's cards (start actions), so the heading stays bare. Absent: today's chips.
   */
  layout?: 'phone' | 'desktop'
  /** The chapter pill's Summary: this chapter up to the reader's place, or what came before it (LabApp). */
  onSummary?: () => void
  /** Summary is offered here: false where there is nothing yet to summarise (the book's first chapter, at its start). */
  summary?: boolean
  /** The book's start: the pill under its title and author, on the heading of the book's first chapter. */
  book?: MarginBookStart | null
}

export interface MarginBookStart {
  /** The first chapter's title: the heading that carries the book's start. */
  firstChapterTitle: string
  /** Shown above the pill when the text has no opening of its own (a Tinct book). */
  title: string
  author?: string
  /** A whole-book primer exists (a Tinct book's introduction); a reader's own book has none. */
  primer: boolean
  onPrimer?: () => void
  onSummary?: () => void
  onAngle?: () => void
}

export const MarginPhoneContext = createContext<MarginPhonePills | null>(null)

export function useMarginPhone(): MarginPhonePills | null {
  return useContext(MarginPhoneContext)
}

/** A chapter's name in its pills: its title before any " — subtitle". */
export function unitName(title: string): string {
  return (title || '').split(/\s+[—–:]\s+/)[0].trim()
}

/** Front matter: what comes before the text proper, which leaves nothing to catch up on. */
const FRONT_MATTER = /^(?:the\s+)?(?:preface|foreword|introduction|introductory note|dedication|epigraph|(?:table of )?contents|acknowledg(?:e)?ments?|(?:translator|author|editor|publisher)['’]?s?['’]? (?:note|preface|introduction)|note on the text|a note on the text|transcriber['’]?s? note)\b/i

/**
 * The book's apparatus: pages with no argument or story to prepare for, recap or quiz (acknowledgments, contents,
 * an index). An introduction or a preface is not: it has content of its own (Anders, 30 Oct 2026).
 */
const APPARATUS = /^(?:the\s+)?(?:acknowledg(?:e)?ments?|(?:table of )?contents|dedication|epigraphs?|copyright|index|indexes|bibliography|select bibliography|works cited|references|(?:end)?notes|list of (?:illustrations|figures|plates|tables|maps)|illustrations|about the authors?|also by\b.*|other books by\b.*|permissions|credits)\s*$/i

export function isApparatus(title: string): boolean {
  return APPARATUS.test((title || '').replace(/[.:]+$/, '').trim())
}

export function isFrontMatter(title: string): boolean {
  return FRONT_MATTER.test((title || '').trim())
}

/** Whether Catch me up has anything to recap here: some chapter before this one that is not front matter. */
export function catchUpAvailable(chapters: readonly { number: number; title: string }[], chapterNumber: number): boolean {
  const here = chapters.findIndex(chapter => chapter.number === chapterNumber)
  if (here <= 0) return false
  return chapters.slice(0, here).some(chapter => !isFrontMatter(chapter.title))
}
