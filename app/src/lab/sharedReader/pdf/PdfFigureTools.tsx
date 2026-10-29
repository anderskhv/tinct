import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SelectionDeskBar } from '../../../components/reader/SelectionDeskBar'
import { capturePdfRegion, detectPdfFigures, type PdfFigureRegion, type PdfRegionImage } from './pdfOriginalFigures'
import type { PdfOriginalDocument, PdfOriginalPage, PdfOriginalSelection } from './PdfOriginalSurface'
export type PdfFigureAction = 'ask' | 'explain' | 'highlight'
export function PdfFigureTools({ pdf, page, canvas, items, ready, onAction }: { pdf: PdfOriginalDocument; page: number; canvas: HTMLCanvasElement | null; items: Awaited<ReturnType<PdfOriginalPage['getTextContent']>>['items']; ready: boolean; onAction?: (action: PdfFigureAction, source: PdfOriginalSelection) => void }) {
  const host = useRef<HTMLDivElement>(null), epoch = useRef(0)
  const [regions, setRegions] = useState<PdfFigureRegion[]>([]), [hot, setHot] = useState<PdfFigureRegion | null>(null)
  const [preview, setPreview] = useState<{ region: PdfFigureRegion; image: PdfRegionImage; modal: boolean; box?: DOMRect } | null>(null)
  const [notice, setNotice] = useState('')
  const show = async (region: PdfFigureRegion, modal: boolean, box?: DOMRect) => {
    const ticket = ++epoch.current, image = await capturePdfRegion(pdf, page, region).catch(() => null)
    if (ticket === epoch.current && image) setPreview({ region, image, modal, box })
  }
  const close = () => { epoch.current++; setPreview(null) }
  useEffect(() => {
    let live = true
    setRegions([]); setHot(null); close()
    if (ready && canvas) void pdf.getPage(page).then(source => detectPdfFigures(canvas, items, source.getViewport({ scale: 1 }))).then(result => { if (live) setRegions(result) }).catch(() => {})
    return () => { live = false; epoch.current++ }
  }, [pdf, page, ready, canvas, items])
  useEffect(() => {
    const sheet = host.current?.parentElement, scroll = sheet?.closest('.pdf-original__scroll')
    if (!sheet) return
    const move = (event: PointerEvent) => {
      if (event.buttons || !window.getSelection()?.isCollapsed || (event.target as Element).closest('[data-testid="lab-desk-bar"]')) return
      const box = sheet.getBoundingClientRect(), x = (event.clientX - box.left) / box.width, y = (event.clientY - box.top) / box.height
      const region = regions.filter(region => x >= region.x && x <= region.x + region.w && y >= region.y && y <= region.y + region.h).sort((a, b) => a.w * a.h - b.w * b.h)[0]
      if (region) { setHot(region); return }
      // Keep the short pointer path from the selected ink to its popup open.
      const bar = host.current?.querySelector('[data-testid="lab-desk-bar"]')?.getBoundingClientRect()
      if (hot && bar && event.clientX >= Math.min(bar.left, box.left + hot.x * box.width) && event.clientX <= Math.max(bar.right, box.left + (hot.x + hot.w) * box.width) && event.clientY >= Math.min(bar.top, box.top + hot.y * box.height) && event.clientY <= Math.max(bar.bottom, box.top + (hot.y + hot.h) * box.height)) return
      const text = (event.target as Element).closest('.pdf-original__text span')?.textContent || ''
      const reference = /\b(fig(?:ure|ur)?\.?|table|tabel)\s*(\d+(?:\.\d+)*[a-z]?)/i.exec(text)
      const named = reference && regions.find(region => region.label?.toLowerCase() === `${/^tab/i.test(reference[1]) ? 'table' : 'figure'} ${reference[2]}`.toLowerCase())
      if (named && !text.trim().startsWith(named.label || '\u0000')) { setHot(named); if (preview?.region !== named) void show(named, false, (event.target as Element).getBoundingClientRect()); return }
      setHot(null); if (!preview?.modal) close()
    }
    const leave = (event: PointerEvent) => { if ((event.relatedTarget as Element | null)?.closest?.('[data-testid="lab-desk-bar"]')) return; setHot(null); if (!preview?.modal) close() }
    const scrolled = () => {
      const focused = document.activeElement?.closest<HTMLElement>('[data-pdf-figure-index]')
      const source = focused && sheet.contains(focused) ? focused.getBoundingClientRect() : null, view = scroll?.getBoundingClientRect()
      const inView = source && view && source.bottom >= view.top && source.top <= view.bottom && source.right >= view.left && source.left <= view.right
      setHot(inView && focused ? regions[Number(focused.dataset.pdfFigureIndex)] ?? null : null)
      close()
    }
    sheet.addEventListener('pointermove', move); sheet.addEventListener('pointerleave', leave); scroll?.addEventListener('scroll', scrolled, { passive: true })
    return () => { sheet.removeEventListener('pointermove', move); sheet.removeEventListener('pointerleave', leave); scroll?.removeEventListener('scroll', scrolled) }
  }, [regions, preview, hot])
  useEffect(() => {
    if ((!preview && !hot) || preview?.modal) return
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); setHot(null); close() } }
    window.addEventListener('keydown', key, true)
    return () => window.removeEventListener('keydown', key, true)
  }, [preview, hot])
  const source = (region: PdfFigureRegion): PdfOriginalSelection => ({ page, text: region.caption || region.label || (region.kind === 'equation' ? 'Formula' : 'Figure'), rects: [[page, region.x, region.y, region.w, region.h]], region: { kind: region.kind, label: region.label || '', caption: region.caption || '', identity: pdf, image: () => capturePdfRegion(pdf, page, region) } })
  const copy = async (region: PdfFigureRegion) => {
    const image = await capturePdfRegion(pdf, page, region).catch(() => null)
    if (!image) { setNotice('This picture could not be copied.'); return }
    const blob = await (await fetch(image.src)).blob()
    try { await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]); setNotice('Image copied.'); }
    catch { const link = document.createElement('a'); link.href = image.src; link.download = `pdf-page-${page}.${image.block.source.media_type === 'image/jpeg' ? 'jpg' : 'png'}`; link.click(); setNotice('Image saved.'); }
  }
  return <div ref={host} className="pdf-original__figures" data-testid="pdf-figure-tools" onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHot(null) }}>
    {regions.map((region, index) => <button key={index} type="button" className="pdf-original__figure-target" data-testid="pdf-figure-source" data-pdf-figure-index={index} aria-label={`Select ${region.label || region.kind} on page ${page}`} style={{ left: `${region.x * 100}%`, top: `${region.y * 100}%` }} onFocus={() => setHot(region)} onClick={() => setHot(region)}>↗</button>)}
    {hot && <>
      <span className="pdf-original__figure-hover" aria-hidden="true" data-testid="pdf-figure-hover" style={{ left: `${hot.x * 100}%`, top: `${hot.y * 100}%`, width: `${hot.w * 100}%`, height: `${hot.h * 100}%` }} />
      <SelectionDeskBar sharedReader state="menu" color="gold" marked={false} noted={false} moreRows={[['copy']]} fallback={{ x: 0, y: 0 }}
        getAnchor={() => { const box = host.current?.parentElement?.getBoundingClientRect(); return box ? { left: box.left + hot.x * box.width, right: box.left + (hot.x + hot.w) * box.width, top: box.top + hot.y * box.height, bottom: box.top + (hot.y + hot.h) * box.height } : null }}
        ariaLabel={`${hot.label || hot.kind} actions`}
        onAsk={() => { onAction?.('ask', source(hot)); setHot(null) }}
        onExplain={() => { onAction?.('explain', source(hot)); setHot(null) }}
        onHighlight={() => { onAction?.('highlight', source(hot)); setHot(null) }} onSwatch={() => {}}
        onMore={action => { if (action === 'copy') void copy(hot) }} onRemove={() => setHot(null)} />
    </>}
    {notice && <span role="status" className="lab-visually-hidden">{notice}</span>}
    {preview?.modal ? <PdfFigureDialog image={preview.image} label={preview.region.label || 'PDF figure'} caption={preview.region.caption} onClose={close} /> : preview && createPortal(<div className="pdf-original__figure-peek" style={preview.box ? { left: Math.max(12, Math.min(window.innerWidth - 360, preview.box.left)), top: Math.max(70, Math.min(window.innerHeight - 360, preview.box.bottom + 8)), right: 'auto' } : undefined} role="tooltip" aria-label={preview.region.label || 'PDF figure'}><figure><img src={preview.image.src} alt={preview.region.caption || preview.region.label || 'PDF figure'} />{preview.region.caption && <figcaption>{preview.region.caption}</figcaption>}</figure></div>, document.body)}
  </div>
}

function PdfFigureDialog({ image, label, caption, onClose }: { image: PdfRegionImage; label: string; caption?: string; onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null), close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null, root = dialog.current
    root?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close.current(); return }
      if (event.key !== 'Tab' || !root) return
      const controls = [...root.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,textarea,[tabindex="0"]')]
      const first = controls[0], last = controls[controls.length - 1]
      if (!root.contains(document.activeElement) || event.shiftKey && document.activeElement === first || !event.shiftKey && document.activeElement === last) { event.preventDefault(); (event.shiftKey ? last : first)?.focus({ preventScroll: true }) }
      event.stopImmediatePropagation()
    }
    window.addEventListener('keydown', key, true)
    return () => { window.removeEventListener('keydown', key, true); if (back?.isConnected) back.focus({ preventScroll: true }) }
  }, [])
  return createPortal(<div ref={dialog} className="pdf-original__figure-backdrop" role="dialog" aria-modal="true" aria-label={label} onClick={event => { if (event.target === event.currentTarget) onClose() }}><figure><img src={image.src} alt={caption || label} />{caption && <figcaption>{caption}</figcaption>}</figure><button type="button" aria-label="Close figure" onClick={onClose}>×</button></div>, document.body)
}

/** A saved figure card redraws once per source region, not once per streamed/typed render. */
export function PdfFigureCardImage({ source }: { source: PdfOriginalSelection }) {
  const [image, setImage] = useState<PdfRegionImage | null>(null), [large, setLarge] = useState(false)
  const capture = useRef(source.region?.image); capture.current = source.region?.image
  const key = `${source.page}:${JSON.stringify(source.rects)}`
  const identity = source.region?.identity ?? source.region?.image
  useEffect(() => { let live = true; setImage(null); void capture.current?.().then(image => { if (live) setImage(image) }).catch(() => {}); return () => { live = false } }, [key, identity])
  if (!image) return null
  return <><button type="button" className="pdf-original__figure-thumb" aria-label={`Show ${source.region?.label || 'figure'} larger`} onClick={() => setLarge(true)}><img src={image.src} alt={source.region?.caption || source.text} /></button>{large && <PdfFigureDialog image={image} label={source.region?.label || 'PDF figure'} caption={source.region?.caption} onClose={() => setLarge(false)} />}</>
}
