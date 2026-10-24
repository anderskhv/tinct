import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  drawTextLayer, openExistingPdf, pdfOriginalFollowRect, pdfOriginalOutline, pdfPageFraction,
  projectPdfSelection, visiblePdfHighlightRects,
  type PdfOriginalDocument, type PdfOriginalFollow, type PdfOriginalPage,
  type PdfOriginalPlace, type PdfOriginalSelection, type PdfOriginalSurfaceProps,
} from './PdfOriginalSurface'
import { readPdfOriginalSelection, markPdfTextFurniture } from './pdfOriginalSelection'
import { findPdfHeading, type PdfHeadingActions } from './pdfHeadingGeometry'
import { PdfFigureTools, type PdfFigureAction } from './PdfFigureTools'
import { capturePdfRegion, type PdfRegionCapture } from './pdfOriginalFigures'
import { HIGHLIGHT_COLORS } from '../../../types'
import './pdfOriginal.css'

const GAP = 18
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
/** The original reader's 1500px reading sheet is the default, even on a very wide desk. */
export const pdfBaseSheetWidth = (available: number) => Math.max(1, Math.min(1500, Math.floor(available - 32)))
export const pdfZoomLimit = (available: number, phone: boolean) => phone ? 3
  : Math.max(1, Math.min(3, Math.floor((available - 32) / pdfBaseSheetWidth(available) * 100) / 100))
/** Map a position on the document strip to its original source page and fraction. */
export function pdfSourcePlaceAt(offset: number, heights: readonly number[]): PdfOriginalPlace {
  if (!heights.length) return { page: 1, frac: 0 }
  let remaining = Math.max(0, offset), page = 1
  while (page < heights.length && remaining >= heights[page - 1] + GAP) remaining -= heights[page++ - 1] + GAP
  return { page, frac: clamp(remaining / Math.max(1, heights[page - 1]), 0, 1) }
}
export type PdfSourceLine = { y: number; left: number; right: number }
/** The original strip's pageBlocks starts from these real, unrotated PDF text lines. */
export function pdfSourceLines(items: Awaited<ReturnType<PdfOriginalPage['getTextContent']>>['items'], view: ReturnType<PdfOriginalPage['getViewport']>): PdfSourceLine[] {
  const [a, b, c, d, e, f] = view.transform
  const lines: Array<PdfSourceLine & { height: number }> = []
  for (const item of items) {
    if (!item.str.trim() || item.transform.length < 6) continue
    const [ta, tb, tc, td, x, y] = item.transform
    const height = Math.hypot(a * tc + c * td, b * tc + d * td)
    if (height < .5 || Math.abs(b * ta + d * tb) > height * .001 || Math.abs(a * tc + c * td) > height * .001) continue
    const top = (b * x + d * y + f - height) / view.height
    const left = clamp((a * x + c * y + e) / view.width, 0, 1)
    const right = clamp(left + item.width * Math.hypot(a, b) / view.width, 0, 1)
    if (top < 0 || top > 1 || right <= left) continue
    const line = lines.find(line => Math.abs(line.y - top) < Math.max(line.height, height / view.height) * .45)
    if (line) { line.left = Math.min(line.left, left); line.right = Math.max(line.right, right) }
    else lines.push({ y: top, left, right, height: height / view.height })
  }
  return lines.sort((a, b) => a.y - b.y).map(({ y, left, right }) => ({ y, left, right }))
}
export type PdfContinuousProps = PdfOriginalSurfaceProps & { initialZoom?: number; requestedZoom?: number; onZoom?: (zoom: number) => void; onZoomLimit?: (limit: number) => void; phone?: boolean; cards?: Array<{ id: string; page: number; rects?: number[][] }>; activeCardId?: string; headingActions?: PdfHeadingActions[]; onScrollHost?: (host: HTMLElement | null) => void; onRegionCapture?: (capture: PdfRegionCapture | null) => void; onFigureAction?: (action: PdfFigureAction, source: PdfOriginalSelection) => void; onSourceActivate?: (source: { kind: 'card' | 'mark'; id: string }) => void }

function PdfSheet({ pdf, number, width, height, highlights, follow, onText, onSelection, onSize, onReady, onError, onLines, cards, activeCardId, headings, figures, onFigureAction }: {
  pdf: PdfOriginalDocument; number: number; width: number; height: number
  highlights: NonNullable<PdfOriginalSurfaceProps['highlights']>; follow: PdfOriginalFollow | null
  onText?: (page: number, text: string) => void; onSelection?: (selection: PdfOriginalSelection) => void
  figures?: boolean; onFigureAction?: PdfContinuousProps['onFigureAction']; cards: NonNullable<PdfContinuousProps['cards']>; activeCardId?: string; headings: PdfHeadingActions[]
  onLines: (page: number, lines: PdfSourceLine[]) => void
  onSize: (page: number, ratio: number) => void; onReady: (page: number, ready: boolean) => void; onError: (page: number) => void
}) {
  const canvas = useRef<HTMLCanvasElement>(null), layer = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [headingRects, setHeadingRects] = useState<Array<{ heading: PdfHeadingActions; selection: PdfOriginalSelection }>>([])
  const [shownHeading, setShownHeading] = useState<string | null>(null)
  const [heard, setHeard] = useState<ReturnType<typeof pdfOriginalFollowRect>>(null)
  const items = useRef<Awaited<ReturnType<PdfOriginalPage['getTextContent']>>['items']>([])
  useEffect(() => {
    const surface = canvas.current, text = layer.current
    if (!surface || !text) return
    let live = true, task: ReturnType<PdfOriginalPage['render']> | null = null
    let textTask: ReturnType<NonNullable<PdfOriginalDocument['renderTextLayer']>> | null = null
    setReady(false); onReady(number, false)
    void pdf.getPage(number).then(async page => {
      if (!live) return
      const base = page.getViewport({ scale: 1 })
      if (base.width <= 0 || base.height <= 0) throw new Error('Invalid PDF page size')
      onSize(number, base.height / base.width)
      const viewport = page.getViewport({ scale: width / base.width })
      const dpr = Math.min(2, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1)
      surface.width = Math.ceil(viewport.width * dpr)
      surface.height = Math.ceil(viewport.height * dpr)
      surface.style.width = `${viewport.width}px`
      surface.style.height = `${viewport.height}px`
      text.style.width = `${viewport.width}px`
      text.style.height = `${viewport.height}px`
      const context = surface.getContext('2d')
      if (!context) throw new Error('PDF canvas unavailable')
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      task = page.render({ canvasContext: context, viewport })
      // Observe cancellation immediately: resize/unmount may cancel the canvas
      // while text extraction is still pending. Neither promise may be orphaned.
      const [, content] = await Promise.all([task.promise, page.getTextContent().catch(() => ({ items: [] }))])
      if (!live) return
      text.replaceChildren()
      text.style.setProperty('--scale-factor', String(viewport.scale))
      if (pdf.renderTextLayer) {
        textTask = pdf.renderTextLayer(content, text, viewport)
        await textTask.promise
      } else drawTextLayer(text, content, viewport)
      if (!live) return
      markPdfTextFurniture(text, content.items, base)
      items.current = content.items
      onLines(number, pdfSourceLines(content.items, base))
      onText?.(number, content.items.map(item => item.str).join(' ').trim())
      setReady(true); onReady(number, true)
    }).catch(() => { if (live) { setReady(false); onReady(number, false); onError(number) } })
    return () => { live = false; task?.cancel?.(); textTask?.cancel?.(); text.replaceChildren(); onReady(number, false) }
    // Width is the exact rendered sheet size. Changing it invalidates the old text geometry.
  }, [pdf, number, width, onSize, onReady, onText, onError, onLines])
  useEffect(() => {
    setHeard(ready && follow && layer.current ? pdfOriginalFollowRect(layer.current, items.current, follow, number) : null)
  }, [ready, follow, number])
  useLayoutEffect(() => {
    const text = layer.current
    if (!text || !ready) { setHeadingRects([]); return }
    const next = headings.flatMap(heading => { const selection = findPdfHeading(text, heading); return selection ? [{ heading, selection }] : [] })
    setHeadingRects(next)
  }, [ready, headings, width])
  return <div className="pdf-original__page" data-page={number} data-ready={ready} aria-label={`PDF page ${number}`} style={{ width, height }} onPointerMove={event => {
    if ((event.target as Element).closest('[data-testid="pdf-heading-actions"]')) return
    const box = event.currentTarget.getBoundingClientRect()
    const found = headingRects.find(({ heading, selection }) => {
      const ink = selection.rects.map(([, x, y, w, h]) => ({ left: box.left + x * width, right: box.left + (x + w) * width, top: box.top + y * height, bottom: box.top + (y + h) * height }))
      const pill = shownHeading === heading.key ? [...event.currentTarget.querySelectorAll<HTMLElement>('[data-unit-key]')].find(node => node.dataset.unitKey === heading.key)?.getBoundingClientRect() : null
      // Keep the actual short path from title ink to its actions traversable.
      const regions = pill ? [...ink, pill] : ink
      const left = Math.min(...regions.map(region => region.left)) - 6, right = Math.max(...regions.map(region => region.right)) + 6
      const top = Math.min(...regions.map(region => region.top)) - 6, bottom = Math.max(...regions.map(region => region.bottom)) + 6
      return event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom
    })
    setShownHeading(found?.heading.key ?? null)
  }} onPointerLeave={() => setShownHeading(null)} onFocusCapture={event => {
    const key = (event.target as HTMLElement).dataset.pdfHeading
    if (key) setShownHeading(key)
  }}>
    <canvas ref={canvas} aria-hidden="true" />
    <div className="pdf-original__highlights" aria-hidden="true">{ready && visiblePdfHighlightRects(highlights, number).map(rect =>
      <span key={rect.id} className="pdf-original__highlight" style={{ left: `${rect.left * 100}%`, top: `${rect.top * 100}%`, width: `${rect.width * 100}%`, height: `${rect.height * 100}%`, backgroundColor: rect.box ? 'transparent' : rect.color, ...(rect.box ? { outline: `2px solid ${rect.color}` } : {}) }} />
    )}{heard && <span className="pdf-original__follow" style={{ left: `${heard[1] * 100}%`, top: `${heard[2] * 100}%`, width: `${heard[3] * 100}%`, height: `${heard[4] * 100}%` }} />}</div>
    <div className="pdf-original__text" ref={layer} />
    <div className="pdf-original__card-lines" aria-hidden="true">{ready && cards.flatMap(card => (card.rects ?? []).filter(rect => rect.length === 5 && rect[0] === number && rect[3] > 0 && rect[4] > 0).map((rect, index) => <span key={card.id + index} data-card-id={card.id} data-active={card.id === activeCardId} style={{ left: `${rect[1] * 100}%`, top: `${(rect[2] + rect[4]) * 100}%`, width: `${rect[3] * 100}%` }} />))}</div>
    {headingRects.map(({ heading, selection }) => {
      const last = selection.rects.at(-1)!, left = Math.min(width - 290, (last[1] + last[3]) * width + 12)
      return <div key={heading.key} className={`pdf-original__heading-actions ${shownHeading === heading.key ? 'is-shown' : ''}`} data-testid="pdf-heading-actions" data-unit-key={heading.key} role="group" aria-label={`${heading.title} actions`}
        style={{ left: Math.max(8, left), top: (last[2] + last[4] / 2) * height - 14 }} ref={element => {
          if (!element) return
          const end = (last[1] + last[3]) * width, inline = end + 12 + element.offsetWidth <= width - 8
          element.style.left = `${inline ? end + 12 : selection.rects[0][1] * width}px`
          element.style.top = `${inline ? (last[2] + last[4] / 2) * height - element.offsetHeight / 2 : (last[2] + last[4]) * height + 2}px`
        }} onPointerEnter={() => setShownHeading(heading.key)} onFocus={() => setShownHeading(heading.key)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setShownHeading(null) }} onMouseDown={event => event.preventDefault()}>
        {heading.actions.map(action => <button key={action.id} type="button" data-action={action.id} onClick={() => heading.onAction(action.id, selection)}>{action.label}</button>)}
      </div>
    })}
    {figures && <PdfFigureTools pdf={pdf} page={number} canvas={canvas.current} items={items.current} ready={ready} onAction={onFigureAction} />}
    <span className="pdf-original__page-number" aria-hidden="true">{number}</span>
  </div>
}

/** Continuous source pages, with three nearby source pages, retaining native selection pages until the range clears. */
export function PdfContinuousSurface({ bytes, initialPlace, requestedPlace, onVisiblePlace, onDocument, onOutline, onPageText, onPageEnd,
  onSelection, highlights = [], follow = null, openDocument = openExistingPdf, initialZoom = 1, requestedZoom, onZoom, onZoomLimit, phone = false, cards = [], activeCardId, headingActions = [], onScrollHost, onSourceActivate, onRegionCapture, onFigureAction }: PdfContinuousProps) {
  const [pdf, setPdf] = useState<PdfOriginalDocument | null>(null)
  const [current, setCurrent] = useState(() => Math.max(1, Math.floor(initialPlace?.page || 1)))
  const [selectionPages, setSelectionPages] = useState<{ from: number; to: number } | null>(null)
  const [dragPage, setDragPage] = useState<number | null>(null)
  const [available, setAvailable] = useState(720)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [visible, setVisible] = useState<PdfOriginalPlace>(initialPlace ?? { page: 1, frac: 0 })
  const mapFrame = useRef(0)
  const nextMapPlace = useRef(visible)
  useEffect(() => () => cancelAnimationFrame(mapFrame.current), [])
  const mapDrag = useRef(false)
  const [sourceLines, setSourceLines] = useState<Record<number, PdfSourceLine[]>>({})
  const [zoom, setZoom] = useState(() => Number.isFinite(initialZoom) ? clamp(initialZoom, .5, 3) : 1)
  const [ratio, setRatio] = useState(1.4)
  const [ratios, setRatios] = useState<Record<number, number>>({})
  const [error, setError] = useState('')
  const scroller = useRef<HTMLDivElement>(null)
  const pageColumn = useRef<HTMLDivElement>(null)
  useEffect(() => { onScrollHost?.(scroller.current); return () => onScrollHost?.(null) }, [onScrollHost])
  useEffect(() => {
    const update = () => {
      const selection = window.getSelection(), root = scroller.current
      const page = (node: Node | null) => Number((node?.nodeType === Node.ELEMENT_NODE ? node as Element : node?.parentElement)?.closest('.pdf-original__page')?.getAttribute('data-page'))
      const a = page(selection?.anchorNode ?? null), b = page(selection?.focusNode ?? null)
      const next = root && selection && !selection.isCollapsed && root.contains(selection.anchorNode) && root.contains(selection.focusNode) && a && b ? { from: Math.min(a, b), to: Math.max(a, b) } : null
      setSelectionPages(previous => previous?.from === next?.from && previous?.to === next?.to ? previous : next)
    }
    const release = () => { update(); setDragPage(null) }
    document.addEventListener('selectionchange', update)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    return () => { document.removeEventListener('selectionchange', update); window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release) }
  }, [])
  useEffect(() => { onRegionCapture?.(pdf ? (page, region) => capturePdfRegion(pdf, page, region) : null); return () => onRegionCapture?.(null) }, [pdf, onRegionCapture])
  const pages = useRef(new Map<number, HTMLDivElement>())
  const ready = useRef(new Set<number>())
  const failed = useRef(new Set<number>())
  const place = useRef<PdfOriginalPlace>({ page: current, frac: clamp(initialPlace?.frac || 0, 0, 1) })
  const first = useRef(false), lastRequest = useRef<PdfOriginalPlace | null>(null)
  const pinch = useRef<{ distance: number; zoom: number } | null>(null)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  const callbacks = useRef({ onVisiblePlace, onPageText, onPageEnd, onSelection, onZoom })
  callbacks.current = { onVisiblePlace, onPageText, onPageEnd, onSelection, onZoom }
  const baseWidth = pdfBaseSheetWidth(available)
  const limit = pdfZoomLimit(available, phone)
  useEffect(() => onZoomLimit?.(limit), [limit, onZoomLimit])
  useEffect(() => {
    if (requestedZoom !== undefined && Number.isFinite(requestedZoom)) setZoom(clamp(requestedZoom, .5, 3))
  }, [requestedZoom])
  const sheetWidth = Math.round(baseWidth * clamp(zoom, .5, limit))
  const heightOf = useCallback((n: number) => Math.round(sheetWidth * (ratios[n] ?? ratio)), [sheetWidth, ratios, ratio])
  const topOf = useCallback((n: number) => {
    const target = pages.current.get(n), root = scroller.current
    if (target && root && target.offsetTop) return target.offsetTop
    let top = 14
    for (let i = 1; i < n; i++) top += heightOf(i) + GAP
    return top
  }, [heightOf])
  const report = useCallback((n: number, frac: number) => {
    const next = { page: n, frac: clamp(frac, 0, 1) }
    place.current = next
    nextMapPlace.current = next
    if (!mapFrame.current) mapFrame.current = requestAnimationFrame(() => {
      mapFrame.current = 0
      const next = nextMapPlace.current
      setVisible(previous => previous.page === next.page && previous.frac === next.frac ? previous : next)
    })
    callbacks.current.onVisiblePlace(next)
    const root = scroller.current
    if (root) callbacks.current.onPageEnd?.(n, ready.current.has(n) && root.scrollTop + root.clientHeight >= topOf(n) + heightOf(n) - 2)
  }, [topOf, heightOf])
  const reportRef = useRef(report)
  reportRef.current = report
  const jump = useCallback((n: number, frac = 0) => {
    if (!pdf || !scroller.current) return
    const page = clamp(n, 1, pdf.numPages)
    window.getSelection()?.removeAllRanges()
    callbacks.current.onPageEnd?.(current, false)
    setError(failed.current.has(page) ? 'This PDF page could not be drawn.' : '')
    setCurrent(page)
    scroller.current.scrollTop = topOf(page) + clamp(frac, 0, 1) * heightOf(page)
    report(page, pdfPageFraction(scroller.current.scrollTop - topOf(page), heightOf(page)))
  }, [pdf, current, topOf, heightOf, report])

  useEffect(() => {
    let live = true, loaded: PdfOriginalDocument | null = null
    void bytes().then(async source => {
      if (!source?.byteLength) throw new Error('PDF file unavailable')
      loaded = await openDocument(source)
      if (!live) { await loaded.destroy(); return }
      if (!Number.isInteger(loaded.numPages) || loaded.numPages < 1) throw new Error('PDF has no pages')
      const firstPage = await loaded.getPage(1), view = firstPage.getViewport({ scale: 1 })
      if (!live) return
      if (view.width > 0 && view.height > 0) setRatio(view.height / view.width)
      setPdf(loaded)
      onDocument?.(loaded.numPages)
      if (onOutline) void pdfOriginalOutline(loaded).then(entries => { if (live) onOutline(entries) }).catch(() => { if (live) onOutline([]) })
    }).catch(() => { if (live) setError('This PDF could not be opened.') })
    return () => { live = false; if (loaded) void loaded.destroy() }
    // Owner/file identity is the shell key; callback changes must not reopen its bytes.
  }, [])
  useLayoutEffect(() => {
    const root = scroller.current
    if (!root) return
    const measure = () => { setAvailable(Math.max(1, pageColumn.current?.clientWidth || root.clientWidth)); setViewportHeight(root.clientHeight) }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    if (pageColumn.current) observer.observe(pageColumn.current)
    return () => observer.disconnect()
  }, [])
  useLayoutEffect(() => {
    if (!pdf || first.current || !scroller.current) return
    first.current = true
    const n = clamp(place.current.page, 1, pdf.numPages)
    scroller.current.scrollTop = topOf(n) + place.current.frac * heightOf(n)
    setCurrent(n)
    report(n, place.current.frac)
  }, [pdf, topOf, heightOf, report])
  useLayoutEffect(() => {
    if (!first.current || !scroller.current) return
    const kept = place.current
    scroller.current.scrollTop = topOf(kept.page) + kept.frac * heightOf(kept.page)
  }, [sheetWidth, ratios, ratio, topOf, heightOf])
  useEffect(() => {
    if (!requestedPlace || !Number.isInteger(requestedPlace.page)
      || requestedPlace.page < 1 || !Number.isFinite(requestedPlace.frac)) return
    if (!pdf) { place.current = { page: requestedPlace.page, frac: clamp(requestedPlace.frac, 0, 1) }; return }
    if (lastRequest.current === requestedPlace) return
    lastRequest.current = requestedPlace
    jump(requestedPlace.page, requestedPlace.frac)
  }, [requestedPlace, pdf, jump])
  const size = useCallback((n: number, next: number) => {
    if (next > 0 && Number.isFinite(next)) setRatios(previous => previous[n] === next ? previous : { ...previous, [n]: next })
  }, [])
  const rendered = useCallback((n: number, yes: boolean) => {
    if (yes) { ready.current.add(n); failed.current.delete(n); if (place.current.page === n) setError('') }
    else ready.current.delete(n)
    if (yes && place.current.page === n) reportRef.current(n, place.current.frac)
  }, [])
  const setPageText = useCallback((n: number, text: string) => callbacks.current.onPageText?.(n, text), [])
  const select = useCallback(() => {
    if (!scroller.current) return
    const selection = readPdfOriginalSelection(scroller.current, window.getSelection())
    if (selection) callbacks.current.onSelection?.(selection)
  }, [])
  const drawError = useCallback((n: number) => { failed.current.add(n); if (place.current.page === n) setError('This PDF page could not be drawn.') }, [])
  const chooseZoom = (next: number) => {
    const value = clamp(Math.round(next * 100) / 100, .5, limit)
    if (value === zoom) return
    setZoom(value)
    callbacks.current.onZoom?.(value)
  }
  const zoomAction = useRef(chooseZoom)
  zoomAction.current = chooseZoom
  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      zoomAction.current(zoomRef.current * Math.exp(-event.deltaY * .01))
    }
    const distance = (touches: TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY) || 1
    const start = (event: TouchEvent) => { if (event.touches.length === 2) pinch.current = { distance: distance(event.touches), zoom: zoomRef.current } }
    const move = (event: TouchEvent) => {
      if (!pinch.current || event.touches.length !== 2) return
      event.preventDefault()
      zoomAction.current(pinch.current.zoom * distance(event.touches) / pinch.current.distance)
    }
    const end = (event: TouchEvent) => { if (event.touches.length < 2) pinch.current = null }
    root.addEventListener('wheel', wheel, { passive: false })
    root.addEventListener('touchstart', start, { passive: true })
    root.addEventListener('touchmove', move, { passive: false })
    root.addEventListener('touchend', end)
    root.addEventListener('touchcancel', end)
    return () => { root.removeEventListener('wheel', wheel); root.removeEventListener('touchstart', start); root.removeEventListener('touchmove', move); root.removeEventListener('touchend', end); root.removeEventListener('touchcancel', end) }
  }, [])
  const cacheLines = useCallback((n: number, lines: PdfSourceLine[]) => {
    setSourceLines(previous => JSON.stringify(previous[n]) === JSON.stringify(lines) ? previous : { ...previous, [n]: lines })
  }, [])
  const sourceMap = useMemo(() => {
    const heights = Array.from({ length: pdf?.numPages ?? 0 }, (_, index) => heightOf(index + 1))
    const starts: number[] = []
    let total = 0
    heights.forEach((height, index) => { starts.push(total); total += height + (index < heights.length - 1 ? GAP : 0) })
    return { heights, starts, total: total || 1 }
  }, [pdf, heightOf])
  const mapLines = useMemo(() => {
    let previous = -3
    return sourceMap.starts.flatMap((start, index) => {
      const lines = sourceLines[index + 1]
      // Unknown pages retain only their truthful source-page tick; scans have no invented text.
      const local = lines ?? [{ y: 0, left: .1, right: .8 }]
      return local.flatMap(line => {
        const y = (start + line.y * sourceMap.heights[index]) / sourceMap.total * 600
        if (y - previous < 3) return []
        previous = y
        return [{ y, left: 4 + line.left * 23, right: 4 + line.right * 23 }]
      })
    })
  }, [sourceMap, sourceLines])
  const mapPosition = ((sourceMap.starts[visible.page - 1] ?? 0) + visible.frac * (sourceMap.heights[visible.page - 1] ?? 0)) / sourceMap.total
  const mapJump = (event: React.PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    if (!box.height) return
    const next = pdfSourcePlaceAt(clamp((event.clientY - box.top) / box.height, 0, 1) * sourceMap.total, sourceMap.heights)
    jump(next.page, next.frac)
  }
  return <section className={`pdf-original ${phone ? 'pdf-original--phone' : 'pdf-original--desktop'}`} aria-label="Original PDF pages">
    <div className="pdf-original__controls">
      <button type="button" onClick={() => jump(current - 1)} disabled={!pdf || current <= 1} aria-label="Previous PDF page">Previous</button>
      <span aria-live="polite">Page {current} of {pdf?.numPages ?? '…'}</span>
      <button type="button" onClick={() => jump(current + 1)} disabled={!pdf || current >= pdf.numPages} aria-label="Next PDF page">Next</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {!phone && pdf && <svg className="pdf-original__minimap" data-testid="pdf-source-minimap" viewBox="0 0 34 600" preserveAspectRatio="none"
      role="slider" tabIndex={0} aria-label="Original PDF position" aria-valuemin={1} aria-valuemax={pdf.numPages} aria-valuenow={visible.page}
      aria-valuetext={`Page ${visible.page} of ${pdf.numPages}, ${Math.round(visible.frac * 100)}% down the page`}
      onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); mapDrag.current = true; mapJump(event) }}
      onPointerMove={event => { if (mapDrag.current) mapJump(event) }} onPointerUp={() => { mapDrag.current = false }} onPointerCancel={() => { mapDrag.current = false }}
      onKeyDown={event => {
        const step = event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 : event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 0
        if (!step && event.key !== 'Home' && event.key !== 'End') return
        event.preventDefault()
        jump(event.key === 'Home' ? 1 : event.key === 'End' ? pdf.numPages : current + step)
      }}>
      <title>Drag to move through original PDF pages</title>
      {mapLines.map((line, index) => <line key={index} x1={line.left} x2={line.right} y1={line.y + .5} y2={line.y + .5} className="pdf-original__map-line" />)}
      <rect x={.5} y={mapPosition * 600} width={33} height={Math.max(4, Math.min(600 - mapPosition * 600, viewportHeight / sourceMap.total * 600))} rx={4} className="pdf-original__map-window" />
      {highlights.filter(mark => mark.page >= 1 && mark.page <= sourceMap.heights.length).map(mark => {
        const top = mark.rects.find(rect => rect.length === 4 && Number.isFinite(rect[1]))?.[1] ?? 0
        return <circle key={mark.id} cx={30} cy={((sourceMap.starts[mark.page - 1] ?? 0) + clamp(top, 0, 1) * sourceMap.heights[mark.page - 1]) / sourceMap.total * 600} r={2} className="pdf-original__map-mark" style={{ fill: HIGHLIGHT_COLORS.find(color => color.key === mark.color)?.hex ?? mark.color }} />
      })}
      {cards.filter(card => card.page >= 1 && card.page <= sourceMap.heights.length).map(card => {
        const top = card.rects?.find(rect => rect.length === 5 && rect[0] === card.page && Number.isFinite(rect[2]))?.[2] ?? 0
        return <circle key={card.id} cx={30} cy={((sourceMap.starts[card.page - 1] ?? 0) + clamp(top, 0, 1) * sourceMap.heights[card.page - 1]) / sourceMap.total * 600} r={2.3} className="pdf-original__map-card" />
      })}
    </svg>}
    <div className="pdf-original__scroll" ref={scroller} tabIndex={0} onPointerDown={event => { const page = (event.target as Element).closest<HTMLElement>('.pdf-original__page'); if (page && !(event.target as Element).closest('button,input,textarea')) setDragPage(Number(page.dataset.page)) }} onMouseUp={event => { if (!(event.target as Element).closest('button,input,textarea,.source-margin-rail')) select() }} onKeyUp={event => { if (event.key === 'Shift' || event.shiftKey || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a')) select() }} onClick={event => {
      if (!onSourceActivate || !(window.getSelection()?.isCollapsed ?? true) || (event.target as Element).closest('button,input,textarea,.source-margin-rail')) return
      for (const card of [...cards].reverse()) for (const rect of card.rects ?? []) {
        const sheet = scroller.current?.querySelector<HTMLElement>(`.pdf-original__page[data-page="${rect[0]}"]`), box = sheet?.getBoundingClientRect()
        if (box && rect.length === 5 && event.clientX >= box.left + rect[1] * box.width && event.clientX <= box.left + (rect[1] + rect[3]) * box.width && event.clientY >= box.top + rect[2] * box.height && event.clientY <= box.top + (rect[2] + rect[4]) * box.height) { onSourceActivate({ kind: 'card', id: card.id }); return }
      }
      for (const mark of [...highlights].reverse()) for (const rect of mark.rects) {
        const sheet = scroller.current?.querySelector<HTMLElement>(`.pdf-original__page[data-page="${mark.page}"]`), box = sheet?.getBoundingClientRect()
        if (box && event.clientX >= box.left + rect[0] * box.width && event.clientX <= box.left + (rect[0] + rect[2]) * box.width && event.clientY >= box.top + rect[1] * box.height && event.clientY <= box.top + (rect[1] + rect[3]) * box.height) { onSourceActivate({ kind: 'mark', id: mark.id }); return }
      }
    }} onScroll={event => {
      if (!pdf || !first.current) return
      const top = event.currentTarget.scrollTop
      let n = 1, start = 14
      while (n < pdf.numPages && start + heightOf(n) + GAP <= top + 2) start += heightOf(n++) + GAP
      const frac = pdfPageFraction(top - start, heightOf(n))
      if (n !== current) { setCurrent(n); setError(failed.current.has(n) ? 'This PDF page could not be drawn.' : ''); if (window.getSelection()?.isCollapsed) window.getSelection()?.removeAllRanges() }
      report(n, frac)
    }} onKeyDown={event => {
      if (event.key === 'PageDown' && scroller.current && scroller.current.scrollTop + scroller.current.clientHeight >= topOf(current) + heightOf(current) - 2) { event.preventDefault(); jump(current + 1) }
      if (event.key === 'PageUp' && scroller.current && scroller.current.scrollTop <= topOf(current)) { event.preventDefault(); jump(current - 1) }
      if ((event.ctrlKey || event.metaKey) && ['+', '=', '-', '_'].includes(event.key)) { event.preventDefault(); chooseZoom(zoom + (event.key === '+' || event.key === '=' ? .1 : -.1)) }
    }}>
      <div className="pdf-original__pages" ref={pageColumn}>
      {pdf && Array.from({ length: pdf.numPages }, (_, index) => {
        const n = index + 1, height = heightOf(n)
        return <div key={n} ref={element => { if (element) pages.current.set(n, element); else pages.current.delete(n) }} className="pdf-original__slot" data-page={n} style={{ width: sheetWidth, height }}>
          {(Math.abs(n - current) <= 1 || selectionPages && n >= selectionPages.from && n <= selectionPages.to || dragPage !== null && n >= Math.min(dragPage, current) && n <= Math.max(dragPage, current)) && <PdfSheet pdf={pdf} number={n} width={sheetWidth} height={height} highlights={highlights}
            follow={follow?.page === n ? follow : null} onText={setPageText} onSize={size} onReady={rendered} onError={drawError} onLines={cacheLines} figures={!phone} onFigureAction={onFigureAction} cards={cards} activeCardId={activeCardId} headings={phone ? [] : headingActions.filter(heading => heading.page === n)} />}
        </div>
      })}
      </div>
    </div>
  </section>
}
