// Pure text-geometry helpers extracted from Reader.tsx (slice 4, step 1).
// These are stateless and DOM-only (no React/component state), which makes them
// unit-testable in jsdom and safe to share. The stateful selection/drag handlers
// and the highlight popup remain in Reader.tsx for now.

export interface TextPoint {
  paragraphIndex: number
  offset: number
}

export interface SelectionSegment {
  paragraphIndex: number
  startOffset: number
  endOffset: number
  text: string
}

/** Walk the paragraph element's text nodes to find the DOM node + local offset
 *  for an absolute character offset within the paragraph. */
export function getDomPointForOffset(paragraphEl: Element, targetOffset: number): { node: Text; offset: number } | null {
  const walker = document.createTreeWalker(paragraphEl, NodeFilter.SHOW_TEXT)
  let charCount = 0
  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = node.textContent || ''
    const next = charCount + text.length
    if (targetOffset <= next) {
      return { node: node as Text, offset: Math.max(0, Math.min(text.length, targetOffset - charCount)) }
    }
    charCount = next
  }
  return null
}

/** Inverse of getDomPointForOffset: the absolute character offset of a DOM
 *  (node, offset) pair within the paragraph element. */
export function getOffsetWithinParagraph(paragraphEl: Element, targetNode: Node, targetOffset: number): number | null {
  const walker = document.createTreeWalker(paragraphEl, NodeFilter.SHOW_TEXT)
  let charCount = 0
  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = node.textContent || ''
    if (node === targetNode) {
      return charCount + Math.max(0, Math.min(text.length, targetOffset))
    }
    charCount += text.length
  }
  return null
}

/** Document order comparison of two text points. <0 if a precedes b. */
export function pointCompare(a: TextPoint, b: TextPoint): number {
  return a.paragraphIndex === b.paragraphIndex
    ? a.offset - b.offset
    : a.paragraphIndex - b.paragraphIndex
}

/** Resolves a paragraph index to its normalized display text. */
export type GetParagraphText = (paragraphIndex: number) => string

/** Segments spanning anchor→focus in document order — each paragraph's slice. */
export function buildSelectionSegments(anchor: TextPoint, focus: TextPoint, getText: GetParagraphText): SelectionSegment[] {
  const forward = pointCompare(anchor, focus) <= 0
  const start = forward ? anchor : focus
  const end = forward ? focus : anchor
  const segments: SelectionSegment[] = []
  for (let p = start.paragraphIndex; p <= end.paragraphIndex; p++) {
    const text = getText(p)
    const s = p === start.paragraphIndex ? start.offset : 0
    const e = p === end.paragraphIndex ? end.offset : text.length
    if (e > s) {
      segments.push({ paragraphIndex: p, startOffset: s, endOffset: e, text: text.slice(s, e) })
    }
  }
  return segments
}

/** Segments covered by a native DOM Range, clamped within each paragraph. */
export function buildRangeSelectionSegments(content: Element, range: Range, getText: GetParagraphText): SelectionSegment[] {
  const segments: SelectionSegment[] = []
  const paragraphEls = Array.from(content.querySelectorAll('[data-paragraph-index]'))
  for (const paragraphEl of paragraphEls) {
    if (!range.intersectsNode(paragraphEl)) continue
    const paragraphIndex = parseInt(paragraphEl.getAttribute('data-paragraph-index') || '0', 10)
    if (!Number.isFinite(paragraphIndex)) continue
    const text = getText(paragraphIndex)
    if (!text) continue

    let startOffset = 0
    let endOffset = text.length
    if (paragraphEl.contains(range.startContainer)) {
      const start = getOffsetWithinParagraph(paragraphEl, range.startContainer, range.startOffset)
      if (start !== null) startOffset = start
    }
    if (paragraphEl.contains(range.endContainer)) {
      const end = getOffsetWithinParagraph(paragraphEl, range.endContainer, range.endOffset)
      if (end !== null) endOffset = end
    }

    const correctedStart = paragraphIndex === 0 && startOffset === 1 ? 0 : startOffset
    const start = Math.max(0, Math.min(text.length, correctedStart))
    const end = Math.max(0, Math.min(text.length, endOffset))
    if (end > start) {
      segments.push({ paragraphIndex, startOffset: start, endOffset: end, text: text.slice(start, end) })
    }
  }
  return segments
}

/** Resolve a viewport (x, y) to a text point within the reader content. */
export function getTextPointFromClientPoint(content: Element, x: number, y: number, getText: GetParagraphText): TextPoint | null {
  const docWithCaret = document as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
  }
  let node: Node | null = null
  let offset = 0
  const range = docWithCaret.caretRangeFromPoint?.(x, y)
  if (range) {
    node = range.startContainer
    offset = range.startOffset
  } else {
    const pos = docWithCaret.caretPositionFromPoint?.(x, y)
    if (pos) {
      node = pos.offsetNode
      offset = pos.offset
    }
  }
  if (!node) return null
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement
  const paragraphEl = el?.closest?.('[data-paragraph-index]')
  if (!paragraphEl || !content.contains(paragraphEl)) return null
  const paragraphIndex = parseInt(paragraphEl.getAttribute('data-paragraph-index') || '0', 10)
  if (!Number.isFinite(paragraphIndex)) return null
  if (node.nodeType !== Node.TEXT_NODE) {
    const text = getText(paragraphIndex)
    return { paragraphIndex, offset: Math.max(0, Math.min(text.length, offset)) }
  }
  const walker = document.createTreeWalker(paragraphEl, NodeFilter.SHOW_TEXT)
  let charCount = 0
  let current: Node | null
  while ((current = walker.nextNode())) {
    if (current === node) {
      const text = getText(paragraphIndex)
      return { paragraphIndex, offset: Math.max(0, Math.min(text.length, charCount + offset)) }
    }
    charCount += (current.textContent || '').length
  }
  return null
}

/** Viewport coordinates of a selection handle anchored at a text point. */
export function getHandlePoint(content: Element, point: TextPoint, preferEnd = false): { x: number; y: number } | undefined {
  const paragraphEl = content.querySelector(`[data-paragraph-index="${point.paragraphIndex}"]`)
  if (!paragraphEl) return undefined
  const dom = getDomPointForOffset(paragraphEl, point.offset)
  if (!dom) return undefined
  try {
    const range = document.createRange()
    const textLen = dom.node.textContent?.length || 0
    const start = Math.max(0, Math.min(textLen, dom.offset))
    const end = Math.max(start, Math.min(textLen, start + 1))
    range.setStart(dom.node, start)
    range.setEnd(dom.node, end)
    const rect = range.getClientRects()[0] || range.getBoundingClientRect()
    if (!rect) return undefined
    return { x: preferEnd ? rect.right : rect.left, y: rect.bottom }
  } catch {
    return undefined
  }
}
