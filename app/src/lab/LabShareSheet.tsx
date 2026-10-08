import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiUrl } from '../utils/apiUrl'
import { trackFunnel } from '../utils/funnel'
import { CopyIcon, ShareIcon } from '../components/reader/SelectionPopup'
import { readSupabaseAccessToken } from './labAuth'
import { LAB_TEE_REST } from './labSuperGlyph'
import './labShare.css'

/**
 * Share a highlight as an image (docs/share-quote/SPEC.md): a preview, three
 * remembered toggles (surrounding text, the highlight colour, the tinct.app
 * credit) and icon buttons. The image is set as the reader sets its text:
 * justified or left-aligned (`align`). Phone: Share, Copy image and Download.
 * Desktop: Copy image and Download only. The image is drawn by the Worker
 * (/api/share/preview, then /q/{id}/image.png) in the reader's own edition and
 * look; with surrounding text off it is a card sized to the quote.
 *
 * Nothing is stored until the reader taps Share (privacy notice: "When you
 * share a highlight, we store…"); where the browser has no share sheet, Share
 * copies the link instead, which also stores it. The preview image is fetched
 * when the sheet opens, which writes nothing, so Share can attach it and Copy
 * image and Download never create a link. Desktop therefore never stores
 * anything.
 *
 * A quote too long for one card is a numbered series of up to four cards
 * (shareLayout `composeShareCards`). The Worker says how many on every image
 * (`X-Share-Cards`); the preview then moves between them by swipe, the
 * Previous/Next arrows or the arrow keys, with a small "1/3" that is the
 * sheet's own label (never drawn on the image). Copy image copies the card in view, Download saves every card
 * (`…-1-of-3.png`), and Share passes all of them in one share.
 */

export interface LabShareTarget {
  bookId: string
  editionKey: string
  editionLabel: string
  chapterNumber: number
  paragraphIndex: number
  fromWord: number
  endParagraphIndex: number
  toWord: number
}

export type LabShareLook = 'paper' | 'book' | 'night' | 'eink'

const PREFS_KEY = 'tinct:share-prefs'
/** Before the image loads: the page's fixed size, or a typical quote card. */
const DEFAULT_RATIO = { phone: { page: 1080 / 1350, quote: 1080 / 800 }, desktop: { page: 1600 / 1000, quote: 1600 / 800 } }

/** The reader's "t" (the top bar's menu mark at rest), standing for the tinct.app credit. */
function TinctMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform={LAB_TEE_REST.rotateTransform}>
        <g transform={LAB_TEE_REST.skewTransform}>
          <path d={LAB_TEE_REST.stemPath} />
          <path d={LAB_TEE_REST.barPath} />
        </g>
      </g>
    </svg>
  )
}

/** A highlighter pen, struck through: the highlight colour on the image. */
function HighlightMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 4.5l5 5-7.5 7.5h-5v-5z" />
      <path d="M7 17l-2.5 2.5H9" />
      <path className="lab-share-strike" d="M4 4l16 16" />
    </svg>
  )
}

function DownloadIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2v8M5 7l3 3 3-3M3 9v4.5h10V9" /></svg>
}

function StepIcon({ dir }: { dir: 'prev' | 'next' }) {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dir === 'prev' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'} /></svg>
}

export interface LabSharePrefs { context: boolean; tagline: boolean; highlight: boolean }

/** Surrounding text and the highlight colour start on; the "Read free at tinct.app" credit starts off. */
export function readSharePrefs(): LabSharePrefs {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') as { context?: unknown; tagline?: unknown; highlight?: unknown }
    return { context: raw.context !== false, tagline: raw.tagline === true, highlight: raw.highlight !== false }
  } catch {
    return { context: true, tagline: false, highlight: true }
  }
}

function writePrefs(prefs: LabSharePrefs): void {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)) } catch { /* remembered for this visit only */ }
}

interface Created { key: string; url: string }

/** A share is at most this many cards (shareLayout SERIES_MAX_CARDS). */
const SHARE_MAX_CARDS = 4

/** The preview of card `card` (1-based); card 1 is the plain preview URL. */
export function cardSrc(previewSrc: string, card: number): string {
  return card <= 1 ? previewSrc : `${previewSrc}&card=${card}`
}

/** `name.png`, or for a series `name-2-of-3.png`. */
export function cardFileName(name: string, index: number, count: number): string {
  return count > 1 ? `${name}-${index + 1}-of-${count}.png` : `${name}.png`
}

export function LabShareSheet({ target, look, format, align = 'justify', onClose }: {
  target: LabShareTarget
  look: LabShareLook
  format: 'phone' | 'desktop'
  /** The reader's text alignment (its setting, or the book's default). */
  align?: 'justify' | 'left'
  onClose: () => void
}) {
  const [prefs, setPrefs] = useState(readSharePrefs)
  const [status, setStatus] = useState('')
  const [created, setCreated] = useState<Created | null>(null)
  const [previewLoaded, setPreviewLoaded] = useState(false)
  // The loaded image's shape, per mode: the quote card's height follows the text.
  const [ratio, setRatio] = useState<{ context: boolean; value: number } | null>(null)
  // Every card's image, once all have loaded (a single image is a series of one).
  const [preview, setPreview] = useState<{ src: string; blobs: Blob[] } | null>(null)
  // How many cards the current image is, as the Worker said, and which is in view.
  const [cardCount, setCardCount] = useState<{ src: string; count: number } | null>(null)
  const [cardIndex, setCardIndex] = useState(0)
  const pending = useRef<Promise<Created | null> | null>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const cardsRow = useRef<HTMLDivElement>(null)
  // The card an arrow is scrolling to: the counter holds on it until the row arrives.
  const scrollTarget = useRef<{ index: number; until: number } | null>(null)

  const body = useMemo(() => ({
    bookId: target.bookId, editionKey: target.editionKey, chapterNumber: target.chapterNumber,
    paragraphIndex: target.paragraphIndex, fromWord: target.fromWord, endParagraphIndex: target.endParagraphIndex, toWord: target.toWord,
    look, format, context: prefs.context, tagline: prefs.tagline, highlight: prefs.highlight, align,
  }), [target, look, format, prefs, align])
  const key = JSON.stringify(body)
  const previewSrc = useMemo(() => {
    const params = new URLSearchParams(Object.entries(body).map(([k, v]) => [k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v)]))
    return apiUrl(`/api/share/preview?${params}`)
  }, [body])

  useEffect(() => { trackFunnel('share_sheet_opened', { book_id: target.bookId, format, look }) }, [target.bookId, format, look])
  // A new image (a toggle changed) keeps the card in view where the series allows.
  useEffect(() => { setPreviewLoaded(false) }, [previewSrc])
  // The image(s) themselves, ready for Share…, Copy image and Download (no write).
  useEffect(() => {
    let active = true
    const image = (src: string) => fetch(src).then(response => response.ok ? response : null)
    image(previewSrc).then(async first => {
      if (!first) return
      const count = Math.min(SHARE_MAX_CARDS, Math.max(1, Number(first.headers.get('X-Share-Cards')) || 1))
      if (active) setCardCount({ src: previewSrc, count })
      const rest = await Promise.all(Array.from({ length: count - 1 }, (_, k) => image(cardSrc(previewSrc, k + 2)).then(response => response?.blob() ?? null)))
      const blobs = [await first.blob(), ...rest]
      if (active && blobs.every(Boolean)) setPreview({ src: previewSrc, blobs: blobs as Blob[] })
    }).catch(() => {})
    return () => { active = false }
  }, [previewSrc])
  const previewBlobs = preview?.src === previewSrc ? preview.blobs : null
  // While a toggle's new image loads, the previous count holds, so the row stays put.
  const cards = cardCount?.count ?? 1
  const shownCard = Math.min(cardIndex, cards - 1)

  const showCard = useCallback((index: number, smooth = true) => {
    const next = Math.max(0, Math.min(cards - 1, index))
    setCardIndex(next)
    const row = cardsRow.current
    if (row && row.clientWidth > 0) {
      const left = next * row.clientWidth
      scrollTarget.current = smooth ? { index: next, until: Date.now() + 1000 } : null
      if (typeof row.scrollTo === 'function') row.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' })
      else row.scrollLeft = left
    }
  }, [cards])
  const showCardRef = useRef(showCard)
  showCardRef.current = showCard
  const shownCardRef = useRef(shownCard)
  shownCardRef.current = shownCard
  // A row that (re)mounts, or a count that shrinks, starts on the card in view.
  useEffect(() => { if (cards > 1) showCardRef.current(shownCardRef.current, false) }, [cards])

  const create = useCallback((): Promise<Created | null> => {
    if (created?.key === key) return Promise.resolve(created)
    if (pending.current) return pending.current
    const run = (async () => {
      try {
        const token = await readSupabaseAccessToken().catch(() => null)
        const response = await fetch(apiUrl('/api/share'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: key,
        })
        if (!response.ok) return null
        const data = await response.json() as { url?: string }
        if (!data.url) return null
        trackFunnel('share_created', { book_id: target.bookId, format, look, tagline: prefs.tagline, edition: target.editionKey })
        const next = { key, url: data.url }
        setCreated(next)
        return next
      } catch {
        return null
      } finally {
        pending.current = null
      }
    })()
    pending.current = run
    return run
  }, [created, key, target.bookId, target.editionKey, format, look, prefs.tagline])

  useEffect(() => {
    dialog.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return }
      // Arrow keys move between the cards of a series (not in a text field).
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) && (event.target as HTMLInputElement).type !== 'checkbox') return
      event.preventDefault()
      showCardRef.current(shownCardRef.current + (event.key === 'ArrowRight' ? 1 : -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggle = (name: 'context' | 'tagline' | 'highlight') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...prefs, [name]: event.target.checked }
    setPrefs(next)
    writePrefs(next)
    setStatus('')
  }

  const openShareSheet = (ready: Created) => {
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
    const files = previewBlobs?.map((blob, k) => new File([blob], cardFileName('tinct-quote', k, previewBlobs.length), { type: 'image/png' })) ?? null
    const withFile: ShareData | null = files && nav.canShare?.({ files }) ? { files, url: ready.url } : null
    return nav.share!(withFile ?? { url: ready.url })
      .then(() => { setStatus(''); trackFunnel('share_completed', { method: 'native', book_id: target.bookId }) })
  }

  const onShare = () => {
    if (!navigator.share) { void copyLink(); return }
    const ready = created?.key === key ? created : null
    if (ready) { void openShareSheet(ready).catch(() => { /* dismissed */ }); return }
    // The link is made on this tap. If the browser no longer counts the tap
    // by the time it exists (iOS), the next tap shares it straight away.
    void create().then(next => {
      if (!next) { setStatus('Could not create the link. Try again.'); return }
      return openShareSheet(next).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'NotAllowedError') setStatus('The link is ready. Tap Share again.')
      })
    })
  }

  const copyLink = async () => {
    try {
      const ClipboardItemCtor = (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem
      if (created?.key === key) await navigator.clipboard.writeText(created.url)
      else if (ClipboardItemCtor && navigator.clipboard?.write) {
        // Keeps the tap's permission while the link is still being made (Safari).
        await navigator.clipboard.write([new ClipboardItemCtor({ 'text/plain': create().then(next => { if (!next) throw new Error('no link'); return new Blob([next.url], { type: 'text/plain' }) }) })])
      } else {
        const next = await create()
        if (!next) throw new Error('no link')
        await navigator.clipboard.writeText(next.url)
      }
      setStatus('Copied the link.')
      trackFunnel('share_completed', { method: 'copy_link', book_id: target.bookId })
    } catch {
      const next = created?.key === key ? created : null
      setStatus(next ? next.url : 'Could not copy the link. Try again.')
    }
  }

  const copyImage = async () => {
    try {
      const ClipboardItemCtor = (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem
      if (!ClipboardItemCtor || !navigator.clipboard?.write) throw new Error('unsupported')
      const blob = previewBlobs?.[shownCard]
      if (!blob) throw new Error('no image')
      await navigator.clipboard.write([new ClipboardItemCtor({ 'image/png': blob })])
      setStatus('Copied the image.')
      trackFunnel('share_completed', { method: 'copy_image', book_id: target.bookId })
    } catch {
      setStatus('Could not copy the image. Use Download instead.')
    }
  }

  const download = () => {
    if (!previewBlobs) { setStatus('Could not make the image. Try again.'); return }
    // Every card, as its own file.
    previewBlobs.forEach((blob, k) => {
      const href = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = href
      link.download = cardFileName(`tinct-${target.bookId}-quote`, k, previewBlobs.length)
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(href), 10_000)
    })
    trackFunnel('share_completed', { method: 'download', book_id: target.bookId })
  }

  const onCardsScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth } = event.currentTarget
    const target = scrollTarget.current
    if (target && Date.now() < target.until && Math.abs(scrollLeft / clientWidth - target.index) > 0.05) return
    scrollTarget.current = null
    if (clientWidth > 0) setCardIndex(Math.max(0, Math.min(cards - 1, Math.round(scrollLeft / clientWidth))))
  }

  const previewRatio = ratio?.context === prefs.context ? ratio.value : DEFAULT_RATIO[format][prefs.context ? 'page' : 'quote']
  const onPreviewLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget
    if (naturalWidth > 0 && naturalHeight > 0) setRatio({ context: prefs.context, value: naturalWidth / naturalHeight })
    setPreviewLoaded(true)
  }

  return (
    <div className="lab-share-layer" data-testid="lab-share-sheet" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className={`lab-share-sheet is-${format}`} role="dialog" aria-modal="true" aria-label="Share highlight" tabIndex={-1} ref={dialog}>
        <button type="button" className="lab-share-close" aria-label="Close" title="Close" onClick={onClose}>×</button>
        <div className={`lab-share-preview${previewLoaded ? ' is-loaded' : ''}${cards > 1 ? ' is-series' : ''}`} style={{ aspectRatio: String(previewRatio) }}>
          {cards > 1 ? (
            <>
              <div className="lab-share-cards" ref={cardsRow} onScroll={onCardsScroll} tabIndex={0} data-testid="lab-share-cards">
                {Array.from({ length: cards }, (_, k) => (
                  <img key={k} src={k === 0 ? previewSrc : cardSrc(previewSrc, k + 1)} alt="Preview of the image" data-testid={k === 0 ? 'lab-share-preview' : undefined} onLoad={k === 0 ? onPreviewLoad : undefined} />
                ))}
              </div>
              <span className="lab-share-count" data-testid="lab-share-count">{shownCard + 1}/{cards}</span>
              <button type="button" className="lab-share-step is-prev" aria-label="Previous" title="Previous" disabled={shownCard === 0} onClick={() => showCard(shownCard - 1)} data-testid="lab-share-prev"><StepIcon dir="prev" /></button>
              <button type="button" className="lab-share-step is-next" aria-label="Next" title="Next" disabled={shownCard >= cards - 1} onClick={() => showCard(shownCard + 1)} data-testid="lab-share-next"><StepIcon dir="next" /></button>
            </>
          ) : (
            <img src={previewSrc} alt="Preview of the image" data-testid="lab-share-preview" onLoad={onPreviewLoad} />
          )}
        </div>
        <div className="lab-share-bar">
          <div className="lab-share-options">
            <label className="lab-share-chip" title="Show surrounding text">
              <input type="checkbox" checked={prefs.context} onChange={toggle('context')} aria-label="Show surrounding text" data-testid="lab-share-context" />
              <span>Surrounding text</span>
            </label>
            <label className="lab-share-chip is-icon" title="Highlight colour">
              <input type="checkbox" checked={prefs.highlight} onChange={toggle('highlight')} aria-label="Highlight colour" data-testid="lab-share-highlight" />
              <HighlightMark />
            </label>
            <label className="lab-share-chip is-icon" title='Add "Read free at tinct.app"'>
              <input type="checkbox" checked={prefs.tagline} onChange={toggle('tagline')} aria-label='Add "Read free at tinct.app"' data-testid="lab-share-tagline" />
              <TinctMark />
            </label>
          </div>
          <div className="lab-share-actions">
            {format === 'phone' && (
              <button type="button" className="is-primary" onClick={onShare} aria-label="Share" title="Share" data-testid="lab-share-native"><ShareIcon /></button>
            )}
            <button type="button" onClick={() => void copyImage()} aria-label="Copy image" title="Copy image" data-testid="lab-share-copy-image"><CopyIcon /></button>
            <button type="button" onClick={download} aria-label="Download image" title="Download image" data-testid="lab-share-download"><DownloadIcon /></button>
          </div>
        </div>
        <p className="lab-share-status" role="status" aria-live="polite" data-testid="lab-share-status">{status}</p>
      </div>
    </div>
  )
}
