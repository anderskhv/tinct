import { useId, useLayoutEffect, type RefObject } from 'react'

/** Paint a single text range across words and spaces, without changing line layout. */
export function useTextRangeHighlights(ref: RefObject<HTMLElement | null>) {
  const prefix = 'tinct' + useId().replace(/[^a-zA-Z0-9]/g, '')
  useLayoutEffect(() => {
    const root = ref.current
    const registry = (globalThis.CSS as typeof CSS & { highlights?: Map<string, unknown> })?.highlights
    const HighlightClass = (globalThis as unknown as { Highlight?: new (...ranges: Range[]) => unknown }).Highlight
    if (!root || !registry || !HighlightClass) return
    const colors = {
      warm: ['gold', '#f5e6c8', '#5c4a2e'], rose: ['rose', '#f5d0d0', '#5c3030'],
      sage: ['sage', '#cde3b4', '#4a5c2e'], sky: ['sky', '#d0e0f5', '#2e3a5c'],
      lavender: ['lavender', '#e0d0f5', '#3a2e5c'],
    }
    const ranges: Record<string, Range[]> = {}
    // Never join separate paragraphs, Compare columns or facing pages.
    for (const line of root.querySelectorAll('.lab-hearing-line')) {
      let color: string | undefined
      let range: Range | undefined
      for (const word of line.querySelectorAll('[data-testid="lab-word"]')) {
        const next = word.classList.contains('is-selecting') ? 'warm'
          : Object.keys(colors).find(key => word.classList.contains(`is-hl-${key}`))
        if (!next) { color = undefined; range = undefined; continue }
        if (next !== color || !range) {
          range = document.createRange()
          range.setStart(word, 0)
          ;(ranges[next] ??= []).push(range)
        }
        range.setEnd(word, word.childNodes.length)
        color = next
      }
    }
    const style = document.createElement('style')
    style.textContent = Object.entries(colors).map(([color, [token, light, dark]]) => {
      const name = `${prefix}-${color}`
      registry.set(name, new HighlightClass(...(ranges[color] ?? [])))
      return `.lab ::highlight(${name}){background-color:var(--highlight-${token},${light});color:inherit}.lab.is-night ::highlight(${name}){background-color:var(--highlight-${token},${dark})}`
    }).join('\n')
    document.head.append(style)
    root.classList.add('has-text-range-highlights')
    return () => {
      root.classList.remove('has-text-range-highlights')
      for (const color of Object.keys(colors)) registry.delete(`${prefix}-${color}`)
      style.remove()
    }
  })
}
