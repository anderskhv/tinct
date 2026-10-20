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
  /** ✧ Quiz me, at a chapter's end. */
  onQuiz?: () => void
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

export function isFrontMatter(title: string): boolean {
  return FRONT_MATTER.test((title || '').trim())
}

/** Whether Catch me up has anything to recap here: some chapter before this one that is not front matter. */
export function catchUpAvailable(chapters: readonly { number: number; title: string }[], chapterNumber: number): boolean {
  const here = chapters.findIndex(chapter => chapter.number === chapterNumber)
  if (here <= 0) return false
  return chapters.slice(0, here).some(chapter => !isFrontMatter(chapter.title))
}
