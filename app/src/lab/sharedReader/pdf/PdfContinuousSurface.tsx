import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  drawTextLayer, openExistingPdf, pdfOriginalFollowRect, pdfOriginalOutline, pdfPageFraction,
  projectPdfSelection, visiblePdfHighlightRects,
  type PdfOriginalDocument, type PdfOriginalFollow, type PdfOriginalPage,
  type PdfOriginalPlace, type PdfOriginalSelection, type PdfOriginalSurfaceProps,
} from './PdfOriginalSurface'
import './pdfOriginal.css'

const GAP = 18
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
/** The original reader's 1500px reading sheet is the default, even on a very wide desk. */
export const pdfBaseSheetWidth = (available: number) => Math.max(1, Math.min(1500, Math.floor(available - 32)))
export const pdfZoomLimit = (available: number, phone: boolean) => phone ? 3
  : Math.max(1, Math.min(3, Math.floor((available - 32) / pdfBaseSheetWidth(available) * 100) / 100))
export type PdfContinuousProps = PdfOriginalSurfaceProps & { initialZoom?: number; requestedZoom?: number; onZoom?: (zoom: number) => void; onZoomLimit?: (limit: number) => void; phone?: boolean }

function PdfSheet({ pdf, number, width, height, highlights, follow, onText, onSelection, onSize, onReady, onError }: {
  pdf: PdfOriginalDocument; number: number; width: number; height: number
  highlights: NonNullable<PdfOriginalSurfaceProps['highlights']>; follow: PdfOriginalFollow | null
  onText?: (page: number, text: string) => void; onSelection?: (selection: PdfOriginalSelection) => void
  onSize: (page: number, ratio: number) => void; onReady: (page: number, ready: boolean) => void; onError: (page: number) => void
}) {
  const canvas = useRef<HTMLCanvasElement>(null), layer = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
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
      const content = await page.getTextContent().catch(() => ({ items: [] }))
      await task.promise
      if (!live) return
      text.replaceChildren()
      text.style.setProperty('--scale-factor', String(viewport.scale))
      if (pdf.renderTextLayer) {
        textTask = pdf.renderTextLayer(content, text, viewport)
        await textTask.promise
      } else drawTextLayer(text, content, viewport)
      if (!live) return
      items.current = content.items
      onText?.(number, content.items.map(item => item.str).join(' ').trim())
      setReady(true); onReady(number, true)
    }).catch(() => { if (live) { setReady(false); onReady(number, false); onError(number) } })
    return () => { live = false; task?.cancel?.(); textTask?.cancel?.(); text.replaceChildren(); onReady(number, false) }
    // Width is the exact rendered sheet size. Changing it invalidates the old text geometry.
  }, [pdf, number, width, onSize, onReady, onText, onError])
  useEffect(() => {
    setHeard(ready && follow && layer.current ? pdfOriginalFollowRect(layer.current, items.current, follow, number) : null)
  }, [ready, follow, number])
  const select = () => {
    const selected = window.getSelection(), text = layer.current
    if (!ready || !selected || selected.isCollapsed || !selected.rangeCount || !text || !onSelection) return
    // One saved source page owns each rectangle. A drag across sheets cannot silently mislabel its source.
    if (!text.contains(selected.anchorNode) || !text.contains(selected.focusNode)) return
    const rects = projectPdfSelection(number, text.getBoundingClientRect(), selected.getRangeAt(0).getClientRects())
    if (rects.length) onSelection({ page: number, text: selected.toString(), rects })
  }
  return <div className="pdf-original__page" data-page={number} data-ready={ready} aria-label={`PDF page ${number}`} style={{ width, height }}>
    <canvas ref={canvas} aria-hidden="true" />
    <div className="pdf-original__highlights" aria-hidden="true">{ready && visiblePdfHighlightRects(highlights, number).map(rect =>
      <span key={rect.id} className="pdf-original__highlight" style={{ left: `${rect.left * 100}%`, top: `${rect.top * 100}%`, width: `${rect.width * 100}%`, height: `${rect.height * 100}%`, backgroundColor: rect.color }} />
    )}{heard && <span className="pdf-original__follow" style={{ left: `${heard[1] * 100}%`, top: `${heard[2] * 100}%`, width: `${heard[3] * 100}%`, height: `${heard[4] * 100}%` }} />}</div>
    <div className="pdf-original__text" ref={layer} onMouseUp={select} onKeyUp={select} />
    <span className="pdf-original__page-number" aria-hidden="true">{number}</span>
  </div>
}

/** Continuous source pages, with at most three rendered canvases/text layers around the visible page. */
export function PdfContinuousSurface({ bytes, initialPlace, requestedPlace, onVisiblePlace, onDocument, onOutline, onPageText, onPageEnd,
  onSelection, highlights = [], follow = null, openDocument = openExistingPdf, initialZoom = 1, requestedZoom, onZoom, onZoomLimit, phone = false }: PdfContinuousProps) {
  const [pdf, setPdf] = useState<PdfOriginalDocument | null>(null)
  const [current, setCurrent] = useState(() => Math.max(1, Math.floor(initialPlace?.page || 1)))
  const [available, setAvailable] = useState(720)
  const [zoom, setZoom] = useState(() => Number.isFinite(initialZoom) ? clamp(initialZoom, .5, 3) : 1)
  const [ratio, setRatio] = useState(1.4)
  const [ratios, setRatios] = useState<Record<number, number>>({})
  const [error, setError] = useState('')
  const scroller = useRef<HTMLDivElement>(null)
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
    const measure = () => setAvailable(Math.max(1, root.clientWidth))
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(root)
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
  const select = useCallback((selection: PdfOriginalSelection) => callbacks.current.onSelection?.(selection), [])
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
  return <section className="pdf-original" aria-label="Original PDF pages">
    <div className="pdf-original__controls">
      <button type="button" onClick={() => jump(current - 1)} disabled={!pdf || current <= 1} aria-label="Previous PDF page">Previous</button>
      <span aria-live="polite">Page {current} of {pdf?.numPages ?? '…'}</span>
      <button type="button" onClick={() => jump(current + 1)} disabled={!pdf || current >= pdf.numPages} aria-label="Next PDF page">Next</button>
    </div>
    {error && <p role="alert">{error}</p>}
    <div className="pdf-original__scroll" ref={scroller} tabIndex={0} onScroll={event => {
      if (!pdf || !first.current) return
      const top = event.currentTarget.scrollTop
      let n = 1, start = 14
      while (n < pdf.numPages && start + heightOf(n) + GAP <= top + 2) start += heightOf(n++) + GAP
      const frac = pdfPageFraction(top - start, heightOf(n))
      if (n !== current) { setCurrent(n); setError(failed.current.has(n) ? 'This PDF page could not be drawn.' : ''); window.getSelection()?.removeAllRanges() }
      report(n, frac)
    }} onKeyDown={event => {
      if (event.key === 'PageDown' && scroller.current && scroller.current.scrollTop + scroller.current.clientHeight >= topOf(current) + heightOf(current) - 2) { event.preventDefault(); jump(current + 1) }
      if (event.key === 'PageUp' && scroller.current && scroller.current.scrollTop <= topOf(current)) { event.preventDefault(); jump(current - 1) }
      if ((event.ctrlKey || event.metaKey) && ['+', '=', '-', '_'].includes(event.key)) { event.preventDefault(); chooseZoom(zoom + (event.key === '+' || event.key === '=' ? .1 : -.1)) }
    }}>
      {pdf && Array.from({ length: pdf.numPages }, (_, index) => {
        const n = index + 1, height = heightOf(n)
        return <div key={n} ref={element => { if (element) pages.current.set(n, element); else pages.current.delete(n) }} className="pdf-original__slot" style={{ width: sheetWidth, height }}>
          {Math.abs(n - current) <= 1 && <PdfSheet pdf={pdf} number={n} width={sheetWidth} height={height} highlights={highlights}
            follow={follow?.page === n ? follow : null} onText={setPageText} onSelection={select} onSize={size} onReady={rendered} onError={drawError} />}
        </div>
      })}
    </div>
  </section>
}
