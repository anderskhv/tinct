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
 * (a MutationObserver), and taken off when the card closes. Rules join each visual line
 * across its spaces; word nodes remain untouched. Neither treatment changes text layout.
 */
export function markPhoneCardPassage(root: Element | null, ranges: readonly PhoneCardRange[], chapterOnScreen: number, compare = false): () => void {
  if (!root || !ranges.length) return () => {}
  let lines: HTMLElement[] = []
  let resize: ResizeObserver | null = null
  const clearLines = () => { for (const line of lines) line.remove(); lines = [] }
  const paint = () => {
    for (const word of root.querySelectorAll(WORDS)) {
      const inside = wordInCardPassage(word, ranges, chapterOnScreen, compare)
      if (inside !== word.classList.contains(PHONE_CARD_PASSAGE_CLASS)) word.classList.toggle(PHONE_CARD_PASSAGE_CLASS, inside)
    }
    clearLines()
    // Word spans remain selection/click targets. Paint one uninterrupted rule
    // per visual line, including justified spaces, without changing inline flow.
    const paragraphs = new Map<HTMLElement, DOMRect[]>()
    for (const word of root.querySelectorAll<HTMLElement>(`.${PHONE_CARD_PASSAGE_CLASS}`)) {
      const paragraph = word.closest<HTMLElement>('.lab-hearing-line')
      if (!paragraph) continue
      const rects = paragraphs.get(paragraph) ?? []
      rects.push(...[...word.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0))
      paragraphs.set(paragraph, rects)
    }
    for (const [paragraph, rects] of paragraphs) {
      resize?.observe(paragraph)
      const origin = paragraph.getBoundingClientRect()
      const rows: Array<{ top: number; bottom: number; left: number; right: number }> = []
      for (const rect of rects.sort((a, b) => a.top - b.top || a.left - b.left)) {
        const row = rows.find(row => Math.abs(row.bottom - rect.bottom) < 3)
        if (row) { row.left = Math.min(row.left, rect.left); row.right = Math.max(row.right, rect.right) }
        else rows.push({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right })
      }
      for (const row of rows) {
        const line = document.createElement('span')
        line.className = 'lab-card-passage-line'
        line.setAttribute('aria-hidden', 'true')
        Object.assign(line.style, { left: `${row.left - origin.left}px`, top: `${row.bottom - origin.top - 1}px`, width: `${row.right - row.left}px` })
        paragraph.append(line); lines.push(line)
      }
    }
  }
  paint()
  let frame = 0
  const observer = typeof MutationObserver === 'function' ? new MutationObserver(records => {
    if (records.every(record => record.type === 'childList' && [...record.addedNodes, ...record.removedNodes].every(node => node instanceof Element && node.classList.contains('lab-card-passage-line')))) return
    if (frame) return
    frame = requestAnimationFrame(() => { frame = 0; paint() })
  }) : null
  observer?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
  resize = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; paint() })
  }) : null
  resize?.observe(root)
  for (const paragraph of root.querySelectorAll('.lab-hearing-line')) resize?.observe(paragraph)
  const resized = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; paint() }) }
  window.addEventListener('resize', resized)
  return () => {
    observer?.disconnect()
    resize?.disconnect()
    window.removeEventListener('resize', resized)
    clearLines()
    if (frame) cancelAnimationFrame(frame)
    for (const word of root.querySelectorAll(`.${PHONE_CARD_PASSAGE_CLASS}`)) word.classList.remove(PHONE_CARD_PASSAGE_CLASS)
  }
}
