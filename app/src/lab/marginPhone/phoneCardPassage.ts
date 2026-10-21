import { wordInHighlightRange, type LabHighlightRange } from '../labHighlights'

/** One chapter's part of the passage a card is about (a selection can run over a chapter's end). */
export interface PhoneCardRange {
  chapterNumber: number
  range: Pick<LabHighlightRange, 'paragraphIndex' | 'fromWord' | 'endParagraphIndex' | 'toWord'>
}

/** The class that underlines the open card's passage on the page (marginPhone.css). */
export const PHONE_CARD_PASSAGE_CLASS = 'is-card-passage'

const WORDS = '[data-testid="lab-page-wrap"] [data-testid="lab-word"], [data-testid="lab-page-wrap"] [data-testid="lab-opening-word"]'

/**
 * Whether a painted word is in the passage: its chapter is the closest `data-chapter-number` (a carried chapter
 * opening or ending) or else the chapter on screen; Compare's column only for a passage chosen there.
 */
export function wordInCardPassage(word: Element, ranges: readonly PhoneCardRange[], chapterOnScreen: number, compare: boolean): boolean {
  if (!!word.closest('.lab-book-col-compare') !== compare) return false
  const paragraph = Number(word.getAttribute('data-paragraph-index'))
  const index = Number(word.getAttribute('data-word-index'))
  if (!Number.isFinite(paragraph) || !Number.isFinite(index)) return false
  const own = word.closest('[data-chapter-number]')?.getAttribute('data-chapter-number')
  const chapter = own != null && own !== '' ? Number(own) : chapterOnScreen
  return ranges.some(part => part.chapterNumber === chapter && wordInHighlightRange(part.range, paragraph, index))
}

/**
 * While a card is open its passage stays underlined in the page text, as in the desktop margin reader, even
 * where the card covers it. The mark is a class on the painted words, kept on them as pages render again
 * (a MutationObserver), and taken off when the card closes. It changes no layout: an underline only.
 */
export function markPhoneCardPassage(root: Element | null, ranges: readonly PhoneCardRange[], chapterOnScreen: number, compare = false): () => void {
  if (!root || !ranges.length) return () => {}
  const paint = () => {
    for (const word of root.querySelectorAll(WORDS)) {
      const inside = wordInCardPassage(word, ranges, chapterOnScreen, compare)
      if (inside !== word.classList.contains(PHONE_CARD_PASSAGE_CLASS)) word.classList.toggle(PHONE_CARD_PASSAGE_CLASS, inside)
    }
  }
  paint()
  let frame = 0
  const observer = typeof MutationObserver === 'function' ? new MutationObserver(() => {
    if (frame) return
    frame = requestAnimationFrame(() => { frame = 0; paint() })
  }) : null
  observer?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
  return () => {
    observer?.disconnect()
    if (frame) cancelAnimationFrame(frame)
    for (const word of root.querySelectorAll(`.${PHONE_CARD_PASSAGE_CLASS}`)) word.classList.remove(PHONE_CARD_PASSAGE_CLASS)
  }
}
