import { lexicalWords } from './labLookupWord'
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
  // Raised numerals belong to the line horizontally, but must not raise its
  // background above the surrounding text or leave a slit before the first word.
  for (const rect of rects.filter(r => r.height > 0 && r.height < fontSize && r.right > r.left)) {
    const row = rows.find(r => rect.bottom > r.top && rect.top < r.bottom)
    if (row) { row.left = Math.min(row.left, rect.left); row.right = Math.max(row.right, rect.right) }
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
  observer: ResizeObserver | null
  onReflow: () => void
  frame: number
  signature: string
  layoutKey: string
  inputs: readonly unknown[] | null
  runs: Run[]
  layers: HTMLElement[]
  registry: Registry
}

/**
 * Whether marks are painted as text ranges here (the CSS Custom Highlight
 * API), so the separator between two marked words needs no element of its
 * own: the range covers the bare space. Only a browser without the API needs
 * the `lab-highlight-gap` span to carry the mark's background.
 */
export function paintsTextRanges(): boolean {
  return !!(globalThis.CSS as typeof CSS & { highlights?: Registry } | undefined)?.highlights
    && typeof (globalThis as unknown as { Highlight?: unknown }).Highlight === 'function'
}

/**
 * One stylesheet and one named highlight per colour for the whole document (book scroll, 11 Nov 2026).
 * Each passage used to install its own stylesheet of `::highlight()` rules and remove it when it went;
 * adding or removing a stylesheet restyles every element in the document, which held the main thread
 * for hundreds of milliseconds each time a chapter scrolled in or out of the Margin reader. Now the
 * rules are written once and never removed; each passage only contributes its ranges, and a colour's
 * highlight is the union of every mounted passage's ranges of that colour.
 */
export const RANGE_HIGHLIGHT_PREFIX = 'tinct-mark'
const contributions = new Map<string, Record<string, Range[]>>()
let sharedStyle: HTMLStyleElement | null = null

/** The rules on `.lab` itself (` `: on every element inside it as well). */
function sharedRules(scope: '' | ' '): string {
  return Object.entries(COLORS).map(([color, [token, light, dark]]) => {
    const name = `${RANGE_HIGHLIGHT_PREFIX}-${color}`
    return `.lab${scope}::highlight(${name}){background-color:var(--highlight-${token},${light});color:inherit}.lab.is-night${scope}::highlight(${name}){background-color:var(--highlight-${token},${dark})}`
  }).join('\n')
}

/** Whether a word inside `.lab` takes the highlight style set on `.lab` (CSS highlight inheritance: Chromium, not WebKit). */
function inheritsHighlightStyle(): boolean {
  try {
    const root = document.createElement('div')
    root.className = 'lab'
    root.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'
    const word = document.createElement('span')
    word.textContent = 'x'
    root.append(word)
    document.body.append(root)
    const shown = getComputedStyle(word, `::highlight(${RANGE_HIGHLIGHT_PREFIX}-warm)`).backgroundColor
    root.remove()
    return !!shown && shown !== 'transparent' && shown !== 'rgba(0, 0, 0, 0)'
  } catch {
    return false
  }
}

function ensureSharedStyle(): void {
  if (sharedStyle?.isConnected) return
  sharedStyle = document.createElement('style')
  sharedStyle.dataset.tinctRangeHighlights = ''
  // Where highlight styles inherit, the rules sit on `.lab` alone and every word paints with them (pixel for pixel the
  // same). A rule on every element made each element of the reader compute five highlight styles of its own: two
  // thirds of the style time of every chapter painted in book scroll (13 Nov 2026). WebKit keeps the rule on every element.
  sharedStyle.textContent = sharedRules('')
  document.head.append(sharedStyle)
  if (!inheritsHighlightStyle()) sharedStyle.textContent = sharedRules(' ')
}

/** Register the union of every passage's ranges for the colours `colors` (all when omitted). */
function publish(registry: Registry, colors: readonly string[] = Object.keys(COLORS)): void {
  const HighlightClass = (globalThis as unknown as { Highlight: new (...ranges: Range[]) => unknown }).Highlight
  for (const color of colors) {
    const name = `${RANGE_HIGHLIGHT_PREFIX}-${color}`
    const all: Range[] = []
    for (const ranges of contributions.values()) if (ranges[color]) all.push(...ranges[color])
    if (all.length) registry.set(name, new HighlightClass(...all))
    else registry.delete(name)
  }
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
export function useTextRangeHighlights(ref: RefObject<HTMLElement | null>, layoutKey = '', inputs?: readonly unknown[], appliedSelection = false) {
  const prefix = 'tinct' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const mountedRef = useRef<Mounted | null>(null)
  useLayoutEffect(() => () => { unmount(mountedRef.current, prefix); mountedRef.current = null }, [prefix])
  useLayoutEffect(() => {
    const root = ref.current
    if (!paintsTextRanges()) return
    const registry = (globalThis.CSS as typeof CSS & { highlights: Registry }).highlights
    if (mountedRef.current && mountedRef.current.root !== root) { unmount(mountedRef.current, prefix); mountedRef.current = null }
    if (!root) return
    let mounted = mountedRef.current
    if (!mounted) {
      ensureSharedStyle()
      root.classList.add('has-text-range-highlights')
      const created: Mounted = { root, observer: null, onReflow: () => {}, frame: 0, signature: '', layoutKey, inputs: null, runs: [], layers: [], registry }
      // Continued-tail alignment and reflow move the rows: measure them again.
      created.onReflow = () => schedulePaint(created)
      created.observer = typeof ResizeObserver === 'function' ? new ResizeObserver(created.onReflow) : null
      created.observer?.observe(root)
      window.addEventListener('resize', created.onReflow)
      document.fonts?.addEventListener?.('loadingdone', created.onReflow)
      mounted = mountedRef.current = created
    }
    // React rewrites the class attribute whenever the passage's own classes
    // change; keep ours (a no-op, and no restyle, while it is there).
    if (!root.classList.contains('has-text-range-highlights')) root.classList.add('has-text-range-highlights')
    // The passage knows precisely which source, page, marks and selected
    // source words can change range membership. Skip even the DOM scan when
    // a popup, transport tick or unrelated reader chrome rerenders it.
    if (inputs && mounted.layoutKey === layoutKey && mounted.inputs?.length === inputs.length
      && inputs.every((input, index) => Object.is(input, mounted.inputs![index]))
      && mounted.runs.every(run => run.range.startContainer.isConnected && run.range.endContainer.isConnected)) return
    mounted.inputs = inputs ? [...inputs] : null
    const ranges: Record<string, Range[]> = {}
    const runs: Run[] = []
    const signature: string[] = []
    // Never join separate paragraphs, Compare columns or facing pages.
    for (const line of root.querySelectorAll('.lab-hearing-line')) {
      const opening = line.closest('.lab-opening-passage')
      if (opening && opening !== root) continue
      let color: string | undefined
      let range: Range | undefined
      for (const word of line.querySelectorAll('[data-testid="lab-word"], [data-testid="lab-opening-word"], [data-fragment-word]')) {
        const saved = Object.keys(COLORS).find(key => word.classList.contains(`is-hl-${key}`))
        const next = word.classList.contains('is-selecting') ? appliedSelection && saved ? saved : 'warm' : saved
        if (!next) { color = undefined; range = undefined; continue }
        const lookup = word.classList.contains('is-selecting') ? word.getAttribute('data-selection-word') : null
        if (lookup) {
          const walker = document.createTreeWalker(word, NodeFilter.SHOW_TEXT)
          let child: Node | null, lexical: Range | undefined
          while ((child = walker.nextNode())) {
            const part = lexicalWords(child.textContent || '').find(part => part.text === lookup)
            if (!part) continue
            lexical = document.createRange()
            lexical.setStart(child, part.start); lexical.setEnd(child, part.end)
            break
          }
          if (lexical) {
            ;(ranges[next] ??= []).push(lexical)
            runs.push({ line, color: next, range: lexical })
            signature.push(`lookup:${lookup}:${word.getAttribute('data-paragraph-index')}:${word.getAttribute('data-word-index')}`)
            color = undefined; range = undefined
            continue
          }
        }
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
    const current = mounted.runs.every(run => run.range.startContainer.isConnected && run.range.endContainer.isConnected)
    // Nothing highlighted, before or now: nothing to register or paint.
    if (!runs.length && !mounted.runs.length) return
    const rangesChanged = key !== mounted.signature || !current
    const layoutChanged = mounted.layoutKey !== layoutKey
    // Popup and narration state can rerender a chapter without moving a single
    // text node. Its painted layers are positioned inside their own lines, so
    // an ancestor scroll changes neither their local geometry nor their colour.
    if (rangesChanged) {
      mounted.signature = key
      mounted.runs = runs
      const before = contributions.get(prefix) ?? {}
      contributions.set(prefix, ranges)
      // Only the colours this passage had or has now change.
      publish(registry, Object.keys(COLORS).filter(color => before[color]?.length || ranges[color]?.length))
    }
    mounted.layoutKey = layoutKey
    if (!rangesChanged && !layoutChanged) return
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
/**
 * A hyphen the reader draws as generated content (the page-edge fragment's
 * `::after`, a planned break's soft hyphen after `.lab-syl`) is not text, so a
 * Range's rects stop short of it and a highlight left it bare at the line's
 * end. The element's own boxes include its pseudo-content: add those of every
 * such element the range covers.
 */
export function generatedHyphenRects(line: Element, range: Range): DOMRect[] {
  const rects: DOMRect[] = []
  for (const el of line.querySelectorAll('.lab-word-fragment, .lab-syl')) {
    try { if (!range.intersectsNode(el)) continue } catch { continue }
    rects.push(...el.getClientRects())
  }
  return rects
}

function paintRanges(mounted: Mounted): void {
  const { root } = mounted
  mounted.layers.splice(0).forEach(layer => layer.remove())
  if (!root.isConnected || !mounted.runs.length) return
  for (const { line, color, range } of mounted.runs) {
    if (typeof range.getClientRects !== 'function' || !line.isConnected) continue
    const box = line.getBoundingClientRect(), fontSize = parseFloat(getComputedStyle(line).fontSize)
    const rects = [...range.getClientRects(), ...generatedHyphenRects(line, range)]
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
  window.removeEventListener('resize', mounted.onReflow)
  document.fonts?.removeEventListener?.('loadingdone', mounted.onReflow)
  mounted.layers.forEach(layer => layer.remove())
  mounted.root.classList.remove('has-text-range-highlights')
  const had = contributions.get(prefix)
  contributions.delete(prefix)
  if (had) publish(mounted.registry, Object.keys(COLORS).filter(color => had[color]?.length))
}
