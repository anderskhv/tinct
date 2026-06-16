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
