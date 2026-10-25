import { useCallback, useEffect, useRef, useState } from 'react'
import { loadPdfEngine } from '../../userBook/pdfEdition'
import type { PdfRegionImage } from './pdfOriginalFigures'
import { paintPdfOriginalSelection, readPdfOriginalSelection } from './pdfOriginalSelection'
import './pdfOriginal.css'

export type PdfOriginalPlace = { page: number; frac: number }
export type PdfSelectionRect = [page: number, x: number, y: number, width: number, height: number]
export type PdfOriginalSelection = { page: number; text: string; rects: PdfSelectionRect[]; pages?: Array<{ n: number; text: string }>; region?: { kind: 'figure' | 'table' | 'equation'; label: string; caption: string; identity?: object; image: () => Promise<PdfRegionImage | null> } }
export type PdfOriginalHighlight = { id: string; page: number; rects: number[][]; color: string; box?: boolean }
export type PdfOriginalFollow = { page: number; wordIndex: number; text: string }
export type PdfOriginalOutlineEntry = { title: string; page: number | null; items: PdfOriginalOutlineEntry[] }
type PdfOutlineItem = { title?: string; dest?: unknown; items?: PdfOutlineItem[] }

type TextItem = { str: string; transform: number[]; width: number; height?: number }
export interface PdfOriginalPage {
  getViewport(options: { scale: number }): { width: number; height: number; scale: number; transform: number[] }
  render(options: { canvasContext: CanvasRenderingContext2D; viewport: unknown }): { promise: Promise<void>; cancel?: () => void }
  getTextContent(): Promise<{ items: TextItem[] }>
}
export interface PdfOriginalDocument {
  numPages: number
  getPage(page: number): Promise<PdfOriginalPage>
  destroy(): Promise<void>
  getOutline?: () => Promise<PdfOutlineItem[] | null>
  getDestination?: (name: string) => Promise<unknown[] | null>
  getPageIndex?: (ref: unknown) => Promise<number>
  renderTextLayer?: (content: { items: TextItem[] }, layer: HTMLElement, viewport: ReturnType<PdfOriginalPage['getViewport']>) => { promise: Promise<void>; cancel?: () => void }
}

export interface PdfOriginalSurfaceProps {
  bytes: () => Promise<ArrayBuffer | null>
  initialPlace?: PdfOriginalPlace | null
  /** A Contents jump; each new object is a command, even to the same place. */
  requestedPlace?: PdfOriginalPlace | null
  onVisiblePlace: (place: PdfOriginalPlace) => void
  onDocument?: (pages: number) => void
  onOutline?: (entries: PdfOriginalOutlineEntry[]) => void
  onPageText?: (page: number, text: string) => void
  /** Whether the reader has reached the visible end of this rendered page. */
  onPageEnd?: (page: number, atEnd: boolean) => void
  onSelection?: (selection: PdfOriginalSelection) => void
  highlights?: PdfOriginalHighlight[]
  /** The heard word only when the own narration paragraph equals this rendered page extraction. */
  follow?: PdfOriginalFollow | null
  /** An injected in-memory document for tests; production uses the existing pdf.js loader. */
  openDocument?: (bytes: ArrayBuffer) => Promise<PdfOriginalDocument>
}

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value))
const highlightColors: Record<string, string> = {
  gold: 'rgba(247, 208, 70, .42)', rose: 'rgba(238, 130, 160, .38)',
  sage: 'rgba(120, 190, 135, .38)', sky: 'rgba(100, 177, 230, .38)',
  lavender: 'rgba(177, 143, 224, .38)',
}

/** Paint only finite, positive page-local fractions; stored geometry may predate this renderer. */
export function visiblePdfHighlightRects(highlights: PdfOriginalHighlight[], page: number) {
  return highlights.flatMap(mark => mark.page !== page ? [] : mark.rects.flatMap((rect, index) => {
    // PDF marks carry four coordinates; cards carry the separate five-number page tuple.
    if (rect.length !== 4 || !rect.every(Number.isFinite) || rect[2] <= 0 || rect[3] <= 0) return []
    const left = clamp(rect[0], 0, 1), top = clamp(rect[1], 0, 1)
    const right = clamp(rect[0] + rect[2], 0, 1), bottom = clamp(rect[1] + rect[3], 0, 1)
    if (right <= left || bottom <= top) return []
    return [{ id: `${mark.id}:${index}`, left, top, width: right - left, height: bottom - top,
      color: highlightColors[mark.color] ?? highlightColors.gold, ...(mark.box ? { box: true } : {}) }]
  }))
}

/** PDF page coordinates use a top-left fractional rectangle, independent of zoom and DPR. */
export function projectPdfSelection(page: number, bounds: DOMRect, rects: Iterable<DOMRect>): PdfSelectionRect[] {
  if (!Number.isInteger(page) || page < 1 || bounds.width <= 0 || bounds.height <= 0) return []
  return [...rects].map(rect => {
    const left = clamp((rect.left - bounds.left) / bounds.width, 0, 1)
    const top = clamp((rect.top - bounds.top) / bounds.height, 0, 1)
    const right = clamp((rect.right - bounds.left) / bounds.width, left, 1)
    const bottom = clamp((rect.bottom - bounds.top) / bounds.height, top, 1)
    return [page, left, top, right - left, bottom - top] as PdfSelectionRect
  }).filter(([, , , width, height]) => width > 0 && height > 0)
}

/** No overlay unless the exact text used for own narration maps onto rendered pdf.js text items. */
export function pdfOriginalFollowRect(layer: HTMLElement, items: TextItem[], follow: PdfOriginalFollow, page: number): PdfSelectionRect | null {
  if (follow.page !== page || !Number.isInteger(follow.wordIndex) || follow.wordIndex < 0
    || items.map(item => item.str).join(' ').trim() !== follow.text) return null
  const spans = [...layer.querySelectorAll('span')]
  let next = 0, word = 0
  for (const item of items) {
    if (!item.str) continue
    while (next < spans.length && spans[next].textContent !== item.str) next++
    const span = spans[next++]
    if (!span) return null
    const node = span.firstChild
    if (!node || node.nodeType !== Node.TEXT_NODE) return null
    for (const match of item.str.matchAll(/\S+/gu)) {
      if (word++ !== follow.wordIndex) continue
      const range = document.createRange()
      range.setStart(node, match.index)
      range.setEnd(node, match.index + match[0].length)
      const projected = projectPdfSelection(page, layer.getBoundingClientRect(), [range.getBoundingClientRect()])
      return projected[0] ?? null
    }
  }
  return null
}

/** The visible top of a page, not its viewport's whole-book scroll percentage. */
export function pdfPageFraction(scrollTop: number, pageHeight: number): number {
  return pageHeight > 0 ? clamp(scrollTop / pageHeight, 0, 1) : 0
}
const canvasPageHeight = (canvas: HTMLCanvasElement | null) => canvas ? parseFloat(canvas.style.height) || canvas.getBoundingClientRect().height : 0

export async function openPdfOriginalBytes(bytes: ArrayBuffer, pdfjs: {
  getDocument: (options: unknown) => { promise: Promise<PdfOriginalDocument> }
  renderTextLayer?: (options: { textContentSource: { items: TextItem[] }; container: HTMLElement; viewport: unknown; textDivs: HTMLElement[] }) => { promise: Promise<void>; cancel?: () => void }
}): Promise<PdfOriginalDocument> {
  // pdf.js detaches the supplied buffer; keep the IndexedDB/account bytes intact.
  const task = pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)), isEvalSupported: false, verbosity: 0 })
  const pdf = await task.promise as PdfOriginalDocument
  return {
    numPages: pdf.numPages,
    getPage: n => pdf.getPage(n),
    destroy: () => pdf.destroy(),
    getOutline: pdf.getOutline ? () => pdf.getOutline!() : undefined,
    getDestination: pdf.getDestination ? name => pdf.getDestination!(name) : undefined,
    getPageIndex: pdf.getPageIndex ? ref => pdf.getPageIndex!(ref) : undefined,
    renderTextLayer: pdfjs.renderTextLayer
      ? (content, layer, viewport) => pdfjs.renderTextLayer!({ textContentSource: content, container: layer, viewport, textDivs: [] })
      : undefined,
  }
}

/** Resolve genuine PDF outline destinations without guessing page labels or scan prose. */
export async function pdfOriginalOutline(pdf: PdfOriginalDocument): Promise<PdfOriginalOutlineEntry[]> {
  const raw = await pdf.getOutline?.()
  if (!Array.isArray(raw)) return []
  let remaining = 200
  const resolve = async (items: PdfOutlineItem[], depth: number): Promise<PdfOriginalOutlineEntry[]> => {
    if (depth > 3) return []
    const result: PdfOriginalOutlineEntry[] = []
    for (const item of items) {
      if (--remaining < 0) break
      let dest = item.dest
      if (typeof dest === 'string') dest = await pdf.getDestination?.(dest).catch(() => null)
      let page: number | null = null
      if (Array.isArray(dest)) {
        const ref = dest[0]
        if (Number.isInteger(ref) && ref >= 0) page = ref + 1
        else if (ref && pdf.getPageIndex) {
          try { page = (await pdf.getPageIndex(ref)) + 1 } catch { /* destination is unresolved */ }
        }
      }
      if (page !== null && (!Number.isInteger(page) || page < 1 || page > pdf.numPages)) page = null
      const title = typeof item.title === 'string' ? item.title.trim().slice(0, 200) : ''
      const children = Array.isArray(item.items) ? await resolve(item.items, depth + 1) : []
      if (title) result.push({ title, page, items: children })
    }
    return result
  }
  return resolve(raw, 1)
}

export async function openExistingPdf(bytes: ArrayBuffer): Promise<PdfOriginalDocument> {
  const engine = await loadPdfEngine()
  return openPdfOriginalBytes(bytes, engine.pdfjs as unknown as Parameters<typeof openPdfOriginalBytes>[1])
}

export function drawTextLayer(layer: HTMLElement, content: { items: TextItem[] }, viewport: ReturnType<PdfOriginalPage['getViewport']>) {
  layer.replaceChildren()
  // pdf.js supplies PDF-space glyph transforms. The same viewport transformation
  // used for the canvas places selectable, transparent text above each glyph.
  for (const item of content.items) {
    if (!item.str || item.transform.length < 6) continue
    const [, , c, d, e, f] = item.transform
    const [v0, v1, v2, v3, v4, v5] = viewport.transform
    const x = v0 * e + v2 * f + v4
    const baseline = v1 * e + v3 * f + v5
    const fontHeight = Math.max(1, Math.hypot(v1 * c + v3 * d, v0 * c + v2 * d))
    const width = Math.max(1, Math.abs(item.width * viewport.scale))
    const span = document.createElement('span')
    span.textContent = item.str
    span.style.left = `${x}px`
    span.style.top = `${baseline - fontHeight}px`
    span.style.fontSize = `${fontHeight}px`
    span.style.width = `${width}px`
    span.style.height = `${fontHeight * 1.15}px`
    span.dataset.pdfText = 'true'
    layer.append(span)
  }
}

export function PdfOriginalSurface({ bytes, initialPlace, requestedPlace, onVisiblePlace, onDocument, onOutline, onPageText, onPageEnd, onSelection, highlights = [], follow = null, openDocument = openExistingPdf }: PdfOriginalSurfaceProps) {
  const [documentPdf, setDocumentPdf] = useState<PdfOriginalDocument | null>(null)
  const [page, setPage] = useState(() => Math.max(1, Math.floor(initialPlace?.page || 1)))
  const [width, setWidth] = useState(720)
  const [error, setError] = useState('')
  const [rendered, setRendered] = useState(false)
  const [followRect, setFollowRect] = useState<PdfSelectionRect | null>(null)
  const textItems = useRef<TextItem[]>([])
  const renderedPage = useRef<number | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const placeCallback = useRef(onVisiblePlace)
  const selectionCallback = useRef(onSelection)
  const pageTextCallback = useRef(onPageText)
  const pageEndCallback = useRef(onPageEnd)
  const bytesCallback = useRef(bytes)
  const documentCallback = useRef(onDocument)
  const outlineCallback = useRef(onOutline)
  const opener = useRef(openDocument)
  placeCallback.current = onVisiblePlace
  selectionCallback.current = onSelection
  pageTextCallback.current = onPageText
  pageEndCallback.current = onPageEnd
  bytesCallback.current = bytes
  documentCallback.current = onDocument
  outlineCallback.current = onOutline
  opener.current = openDocument
  const start = useRef(initialPlace)
  const opened = useRef(false)
  const requested = useRef<PdfOriginalPlace | null>(null)
  const lastRequest = useRef<PdfOriginalPlace | null>(null)
  const emitPageEnd = (currentPage: number, target: HTMLElement) => {
    pageEndCallback.current?.(currentPage, target.scrollTop + target.clientHeight >= target.scrollHeight - 2)
  }
  const invalidatePage = () => {
    pageEndCallback.current?.(page, false)
    renderedPage.current = null
    textItems.current = []
    setFollowRect(null)
    layer.current?.replaceChildren()
    window.getSelection()?.removeAllRanges()
    setRendered(false)
  }

  useEffect(() => {
    let live = true
    let loaded: PdfOriginalDocument | null = null
    void bytesCallback.current().then(async data => {
      if (!data || !data.byteLength) throw new Error('PDF file unavailable')
      loaded = await opener.current(data)
      if (!live) { await loaded.destroy(); return }
      if (!Number.isInteger(loaded.numPages) || loaded.numPages < 1) throw new Error('PDF has no pages')
      setDocumentPdf(loaded)
      documentCallback.current?.(loaded.numPages)
      if (outlineCallback.current) void pdfOriginalOutline(loaded).then(entries => { if (live) outlineCallback.current?.(entries) }).catch(() => { if (live) outlineCallback.current?.([]) })
      setPage(current => clamp(current, 1, loaded!.numPages))
    }).catch(() => { if (live) setError('This PDF could not be opened.') })
    return () => { live = false; if (loaded) void loaded.destroy() }
    // The book's identity is the component key; callbacks can change while it renders.
  }, [])

  useEffect(() => {
    const target = scroller.current
    if (!target) return
    const update = () => setWidth(Math.max(1, Math.floor(target.clientWidth - 24)))
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(target)
    return () => observer.disconnect()
  }, [documentPdf])

  useEffect(() => {
    if (!requestedPlace || !Number.isInteger(requestedPlace.page) || requestedPlace.page < 1
      || !Number.isFinite(requestedPlace.frac)) return
    if (lastRequest.current === requestedPlace) return
    lastRequest.current = requestedPlace
    const next = { page: documentPdf ? clamp(requestedPlace.page, 1, documentPdf.numPages) : requestedPlace.page,
      frac: clamp(requestedPlace.frac, 0, 1) }
    requested.current = next
    if (!documentPdf) { setPage(next.page); return }
    if (page !== next.page) { invalidatePage(); setPage(next.page); return }
    const target = scroller.current, canvasHeight = canvasPageHeight(canvas.current)
    if (target && rendered && canvasHeight > 0) {
      target.scrollTop = next.frac * canvasHeight
      placeCallback.current({ page, frac: pdfPageFraction(target.scrollTop, canvasHeight) })
      emitPageEnd(page, target)
      requested.current = null
    }
  }, [requestedPlace, documentPdf, page, rendered])

  useEffect(() => {
    if (!documentPdf || !canvas.current || !layer.current) return
    let live = true
    let task: ReturnType<PdfOriginalPage['render']> | null = null
    let textTask: ReturnType<NonNullable<PdfOriginalDocument['renderTextLayer']>> | null = null
    renderedPage.current = null
    pageEndCallback.current?.(page, false)
    setRendered(false)
    const surface = canvas.current, text = layer.current
    void documentPdf.getPage(page).then(async pdfPage => {
      if (!live) return
      const base = pdfPage.getViewport({ scale: 1 })
      const viewport = pdfPage.getViewport({ scale: Math.max(0.1, width / base.width) })
      const dpr = Math.min(2, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1)
      surface.width = Math.max(1, Math.ceil(viewport.width * dpr))
      surface.height = Math.max(1, Math.ceil(viewport.height * dpr))
      surface.style.width = `${viewport.width}px`
      surface.style.height = `${viewport.height}px`
      text.style.width = `${viewport.width}px`
      text.style.height = `${viewport.height}px`
      const context = surface.getContext('2d')
      if (!context) throw new Error('PDF canvas unavailable')
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      task = pdfPage.render({ canvasContext: context, viewport })
      const content = await pdfPage.getTextContent().catch(() => ({ items: [] as TextItem[] }))
      await task.promise
      if (!live) return
      text.replaceChildren()
      text.style.setProperty('--scale-factor', String(viewport.scale))
      if (documentPdf.renderTextLayer) {
        textTask = documentPdf.renderTextLayer(content, text, viewport)
        await textTask.promise
      } else drawTextLayer(text, content, viewport)
      if (!live) return
      textItems.current = content.items
      pageTextCallback.current?.(page, content.items.map(item => item.str).join(' ').trim())
      const target = scroller.current
      if (target) {
        const initial = requested.current?.page === page ? requested.current.frac
          : !opened.current && page === start.current?.page ? start.current.frac : 0
        target.scrollTop = clamp(initial || 0, 0, 1) * viewport.height
        requested.current = null
        opened.current = true
        placeCallback.current({ page, frac: pdfPageFraction(target.scrollTop, viewport.height) })
        emitPageEnd(page, target)
      }
      renderedPage.current = page
      setRendered(true)
    }).catch(() => { if (live) setError('This PDF page could not be drawn.') })
    return () => { live = false; renderedPage.current = null; textItems.current = []; task?.cancel?.(); textTask?.cancel?.(); text.replaceChildren() }
  }, [documentPdf, page, width])

  useEffect(() => {
    setFollowRect(rendered && follow && layer.current && renderedPage.current === page
      ? pdfOriginalFollowRect(layer.current, textItems.current, follow, page) : null)
  }, [follow, page, rendered])

  const go = useCallback((next: number) => {
    if (!documentPdf) return
    requested.current = null
    invalidatePage()
    setError('')
    setPage(clamp(next, 1, documentPdf.numPages))
    if (scroller.current) scroller.current.scrollTop = 0
  }, [documentPdf])

  const selection = () => {
    const selected = window.getSelection()
    const text = layer.current
    if (!selected || !text || renderedPage.current !== page || !selectionCallback.current || selected.isCollapsed || !selected.rangeCount) return
    if (!text.contains(selected.anchorNode) || !text.contains(selected.focusNode)) return
    const source = scroller.current && readPdfOriginalSelection(scroller.current, selected)
    if (source) selectionCallback.current(source)
  }

  useEffect(() => {
    const paint = () => { if (scroller.current) paintPdfOriginalSelection(scroller.current) }
    document.addEventListener('selectionchange', paint)
    return () => document.removeEventListener('selectionchange', paint)
  }, [])

  return <section className="pdf-original" aria-label="Original PDF pages">
    <div className="pdf-original__controls">
      <button type="button" onClick={() => go(page - 1)} disabled={!documentPdf || page <= 1} aria-label="Previous PDF page">Previous</button>
      <span aria-live="polite">Page {page} of {documentPdf?.numPages ?? '…'}</span>
      <button type="button" onClick={() => go(page + 1)} disabled={!documentPdf || page >= documentPdf.numPages} aria-label="Next PDF page">Next</button>
    </div>
    {error ? <p role="alert">{error}</p> : null}
    <div className="pdf-original__scroll" ref={scroller} onScroll={event => {
      if (!rendered || renderedPage.current !== page || !canvas.current) return
      placeCallback.current({ page, frac: pdfPageFraction(event.currentTarget.scrollTop, canvasPageHeight(canvas.current)) })
      emitPageEnd(page, event.currentTarget)
    }} onKeyDown={event => {
      if (event.key === 'PageDown' && scroller.current && scroller.current.scrollTop + scroller.current.clientHeight >= scroller.current.scrollHeight - 2) { event.preventDefault(); go(page + 1) }
      if (event.key === 'PageUp' && scroller.current?.scrollTop === 0) { event.preventDefault(); go(page - 1) }
    }} tabIndex={0}>
      <div className="pdf-original__page" data-page={page} aria-label={`PDF page ${page}`}>
        <canvas ref={canvas} aria-hidden="true" />
        <div className="pdf-original__highlights" aria-hidden="true">{(rendered && renderedPage.current === page ? visiblePdfHighlightRects(highlights, page) : []).map(rect =>
          <span key={rect.id} className="pdf-original__highlight" style={{ left: `${rect.left * 100}%`, top: `${rect.top * 100}%`, width: `${rect.width * 100}%`, height: `${rect.height * 100}%`, backgroundColor: rect.box ? 'transparent' : rect.color, ...(rect.box ? { outline: `2px solid ${rect.color}` } : {}) }} />
        )}{followRect && followRect[0] === page && <span className="pdf-original__follow" style={{ left: `${followRect[1] * 100}%`, top: `${followRect[2] * 100}%`, width: `${followRect[3] * 100}%`, height: `${followRect[4] * 100}%` }} />}</div>
        <div className="pdf-original__text" ref={layer} onMouseUp={selection} onKeyUp={selection} />
      </div>
    </div>
  </section>
}
