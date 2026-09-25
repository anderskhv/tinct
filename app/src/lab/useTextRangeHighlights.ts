import { useId, useLayoutEffect, useRef, type RefObject } from 'react'

type PaintRect = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom' | 'height'>
/** Full-sized line fragments; raised verse glyphs do not grow the band. */
export function highlightRows(rects: PaintRect[], fontSize: number): Array<{left:number;right:number;top:number;bottom:number}> {
  const rows: Array<{left:number;right:number;top:number;bottom:number}> = []
  for (const rect of [...rects].filter(r => r.height >= fontSize && r.right > r.left).sort((a,b) => a.top-b.top || a.left-b.left)) {
    const row = rows.find(r => Math.abs(r.top-rect.top) < 1)
    if (row) { row.left=Math.min(row.left,rect.left); row.right=Math.max(row.right,rect.right); row.bottom=Math.max(row.bottom,rect.bottom) }
    else rows.push({left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom})
  }
  return rows
}

/** Fill only subpixel cracks between touching rows, never paragraph/line spacing. */
export function highlightSeams(rects: PaintRect[], fontSize: number, pixel = 1): Array<{left:number;top:number;width:number;height:number}> {
  const rows=highlightRows(rects,fontSize)
  return rows.slice(1).flatMap((next,index) => {
    const previous=rows[index], gap=next.top-previous.bottom
    const left=Math.max(previous.left,next.left), right=Math.min(previous.right,next.right)
    if (gap < -1 || gap > 1.5 || right <= left) return []
    const top=Math.floor(Math.min(previous.bottom,next.top)/pixel)*pixel-pixel
    const bottom=Math.ceil(Math.max(previous.bottom,next.top)/pixel)*pixel+pixel
    return [{left,top,width:right-left,height:bottom-top}]
  })
}

type Run = { line: Element; color: string; range: Range }
const COLORS = {
  warm: ['gold', '#f5e6c8', '#5c4a2e'], rose: ['rose', '#f5d0d0', '#5c3030'],
  sage: ['sage', '#cde3b4', '#4a5c2e'], sky: ['sky', '#d0e0f5', '#2e3a5c'],
  lavender: ['lavender', '#e0d0f5', '#3a2e5c'],
} as const
type Registry = Map<string, unknown>
type Mounted = {
  root: HTMLElement
  style: HTMLStyleElement
  observer: ResizeObserver | null
  frame: number
  signature: string
  runs: Run[]
  layers: HTMLElement[]
  registry: Registry
}

/**
 * Paint a single text range across words and spaces, without changing line layout.
 *
 * The page re-renders on every spoken word. The stylesheet, the root class
 * and the observer are installed once per root; ranges and painted rows are
 * rebuilt only when the highlighted words change. Rebuilding them on every
 * render appended a stylesheet each time, which restyled the whole document
 * per word and held the main thread for ~300 ms on a long chapter: the follow
 * wash then lit only every third word (2026-09-25).
 */
export function useTextRangeHighlights(ref: RefObject<HTMLElement | null>) {
  const prefix = 'tinct' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const mountedRef = useRef<Mounted | null>(null)
  useLayoutEffect(() => () => { unmount(mountedRef.current, prefix); mountedRef.current = null }, [prefix])
  useLayoutEffect(() => {
    const root = ref.current
    const registry = (globalThis.CSS as typeof CSS & { highlights?: Registry })?.highlights
    const HighlightClass = (globalThis as unknown as { Highlight?: new (...ranges: Range[]) => unknown }).Highlight
    if (!registry || !HighlightClass) return
    if (mountedRef.current && mountedRef.current.root !== root) { unmount(mountedRef.current, prefix); mountedRef.current = null }
    if (!root) return
    let mounted = mountedRef.current
    if (!mounted) {
      const style = document.createElement('style')
      style.textContent = Object.entries(COLORS).map(([color, [token, light, dark]]) => {
        const name = `${prefix}-${color}`
        return `.lab ::highlight(${name}){background-color:var(--highlight-${token},${light});color:inherit}.lab.is-night ::highlight(${name}){background-color:var(--highlight-${token},${dark})}`
      }).join('\n')
      document.head.append(style)
      root.classList.add('has-text-range-highlights')
      const created: Mounted = { root, style, observer: null, frame: 0, signature: '', runs: [], layers: [], registry }
      // Continued-tail alignment and reflow move the rows: measure them again.
      created.observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => schedulePaint(created)) : null
      created.observer?.observe(root)
      mounted = mountedRef.current = created
    }
    const ranges: Record<string, Range[]> = {}
    const runs: Run[] = []
    const signature: string[] = []
    // Never join separate paragraphs, Compare columns or facing pages.
    for (const line of root.querySelectorAll('.lab-hearing-line')) {
      let color: string | undefined
      let range: Range | undefined
      for (const word of line.querySelectorAll('[data-testid="lab-word"], [data-fragment-word]')) {
        const next = word.classList.contains('is-selecting') ? 'warm'
          : Object.keys(COLORS).find(key => word.classList.contains(`is-hl-${key}`))
        if (!next) { color = undefined; range = undefined; continue }
        if (next !== color || !range) {
          range = document.createRange()
          range.setStart(word, 0)
          ;(ranges[next] ??= []).push(range)
          runs.push({ line, color: next, range })
          signature.push('|')
        }
        range.setEnd(word, word.childNodes.length)
        signature.push(`${next}:${word.getAttribute('data-paragraph-index') ?? word.getAttribute('data-fragment-paragraph')}:${word.getAttribute('data-word-index') ?? word.getAttribute('data-fragment-word')}`)
        color = next
      }
    }
    const key = signature.join(',')
    // Same words, same elements: nothing to repaint.
    const current = mounted.runs.every(run => run.range.startContainer.isConnected && run.range.endContainer.isConnected)
    if (key === mounted.signature && current) return
    mounted.signature = key
    mounted.runs = runs
    for (const color of Object.keys(COLORS)) registry.set(`${prefix}-${color}`, new HighlightClass(...(ranges[color] ?? [])))
    // Paint immediately so a render never exposes an unpainted frame, and
    // again after the later layout effects have placed the lines.
    paintRanges(mounted)
    schedulePaint(mounted)
  })
}

function schedulePaint(mounted: Mounted): void {
  cancelAnimationFrame(mounted.frame)
  mounted.frame = requestAnimationFrame(() => paintRanges(mounted))
}

/**
 * WebKit can expose correct custom-highlight ranges and computed colours
 * without painting their backgrounds. Paint the same measured row boxes
 * underneath the text in every engine, plus fractional edge joins. These
 * absolute, noninteractive layers never affect text metrics or selection.
 */
function paintRanges(mounted: Mounted): void {
  const { root } = mounted
  mounted.layers.splice(0).forEach(layer => layer.remove())
  if (!root.isConnected || !mounted.runs.length) return
  for (const { line, color, range } of mounted.runs) {
    if (typeof range.getClientRects !== 'function' || !line.isConnected) continue
    const box = line.getBoundingClientRect(), fontSize = parseFloat(getComputedStyle(line).fontSize)
    const rects = [...range.getClientRects()]
    const paint = [...highlightRows(rects, fontSize).map(r => ({ left: r.left, top: r.top, width: r.right - r.left, height: r.bottom - r.top, seam: false })), ...highlightSeams(rects, fontSize, 1 / (window.devicePixelRatio || 1)).map(r => ({ ...r, seam: true }))]
    for (const seam of paint) {
      const layer = document.createElement('span')
      layer.className = seam.seam ? 'lab-highlight-seam' : 'lab-highlight-fill'
      layer.setAttribute('aria-hidden', 'true')
      const [token, light, dark] = COLORS[color as keyof typeof COLORS]
      const fallback = root.closest('.is-night') ? dark : light
      Object.assign(layer.style, { left: `${seam.left - box.left}px`, top: `${seam.top - box.top}px`, width: `${seam.width}px`, height: `${seam.height}px`, background: `var(--highlight-${token},${fallback})` })
      line.append(layer)
      mounted.layers.push(layer)
    }
  }
}

function unmount(mounted: Mounted | null, prefix: string): void {
  if (!mounted) return
  cancelAnimationFrame(mounted.frame)
  mounted.observer?.disconnect()
  mounted.layers.forEach(layer => layer.remove())
  mounted.root.classList.remove('has-text-range-highlights')
  for (const color of Object.keys(COLORS)) mounted.registry.delete(`${prefix}-${color}`)
  mounted.style.remove()
}
