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
