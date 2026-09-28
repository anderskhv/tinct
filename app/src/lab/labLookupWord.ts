/** A lookup can address a lexical word inside one whitespace/audio token. */
export function lexicalWords(text: string): Array<{ text: string; start: number; end: number }> {
  return [...text.matchAll(/[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*/gu)]
    .map(match => ({ text: match[0], start: match.index!, end: match.index! + match[0].length }))
}

export function lookupWordAtPoint(text: string, paragraphIndex: number, wordIndex: number, x: number, y: number, comparison: boolean, opening = false): string {
  const parts = lexicalWords(text)
  if (!parts.length) return text
  if (parts.length === 1) return parts[0].text
  if (/\s/.test(text.trim())) return text
  let best = Infinity, picked = parts[0].text
  for (const node of document.querySelectorAll<HTMLElement>(`[data-testid="${opening ? 'lab-opening-word' : 'lab-word'}"][data-paragraph-index="${paragraphIndex}"][data-word-index="${wordIndex}"]`)) {
    if (!!node.closest('.lab-book-col-compare') !== comparison) continue
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
    let child: Node | null
    while ((child = walker.nextNode())) {
      for (const part of lexicalWords(child.textContent || '')) {
        const range = document.createRange()
        range.setStart(child, part.start); range.setEnd(child, part.end)
        for (const box of Array.from(range.getClientRects())) {
          const dx = Math.max(box.left - x, 0, x - box.right)
          const dy = Math.max(box.top - y, 0, y - box.bottom)
          const distance = dy * dy * 10000 + dx * dx
          if (distance < best) { best = distance; picked = part.text }
        }
      }
    }
  }
  return picked
}
