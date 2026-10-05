import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiUrl } from '../utils/apiUrl'
import { trackFunnel } from '../utils/funnel'
import { readSupabaseAccessToken } from './labAuth'
import './labShare.css'

/**
 * Share a highlight as an image (docs/share-quote/SPEC.md): a preview, two
 * remembered toggles, Share… and Copy link; desktop also Copy image and
 * Download. The image is drawn by the Worker (/api/share/preview, then
 * /q/{id}/image.png) in the reader's own edition and look.
 *
 * The link is created when the sheet opens (and again after a toggle
 * changes), so Share… can hand the system share sheet a ready image straight
 * from the tap, as iOS requires.
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

export type LabShareLook = 'paper' | 'night' | 'eink'

const PREFS_KEY = 'tinct:share-prefs'
const LOOK_NAMES: Record<LabShareLook, string> = { paper: 'Paper', night: 'Night', eink: 'e-ink' }

function readPrefs(): { context: boolean; tagline: boolean } {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') as { context?: unknown; tagline?: unknown }
    return { context: raw.context !== false, tagline: raw.tagline !== false }
  } catch {
    return { context: true, tagline: true }
  }
}

function writePrefs(prefs: { context: boolean; tagline: boolean }): void {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)) } catch { /* remembered for this visit only */ }
}

interface Created { key: string; url: string; image: string; blob: Blob | null }

export function LabShareSheet({ target, look, format, onClose }: {
  target: LabShareTarget
  look: LabShareLook
  format: 'phone' | 'desktop'
  onClose: () => void
}) {
  const [prefs, setPrefs] = useState(readPrefs)
  const [status, setStatus] = useState('')
  const [created, setCreated] = useState<Created | null>(null)
  const [previewLoaded, setPreviewLoaded] = useState(false)
  const pending = useRef<Promise<Created | null> | null>(null)
  const dialog = useRef<HTMLDivElement>(null)

  const body = useMemo(() => ({
    bookId: target.bookId, editionKey: target.editionKey, chapterNumber: target.chapterNumber,
    paragraphIndex: target.paragraphIndex, fromWord: target.fromWord, endParagraphIndex: target.endParagraphIndex, toWord: target.toWord,
    look, format, context: prefs.context, tagline: prefs.tagline,
  }), [target, look, format, prefs])
  const key = JSON.stringify(body)
  const previewSrc = useMemo(() => {
    const params = new URLSearchParams(Object.entries(body).map(([k, v]) => [k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v)]))
    return apiUrl(`/api/share/preview?${params}`)
  }, [body])

  useEffect(() => { trackFunnel('share_sheet_opened', { book_id: target.bookId, format, look }) }, [target.bookId, format, look])
  useEffect(() => { setPreviewLoaded(false) }, [previewSrc])

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
        const data = await response.json() as { url?: string; image?: string }
        if (!data.url || !data.image) return null
        trackFunnel('share_created', { book_id: target.bookId, format, look, tagline: prefs.tagline, edition: target.editionKey })
        let blob: Blob | null = null
        try {
          const image = await fetch(data.image)
          if (image.ok) blob = await image.blob()
        } catch { /* the link still shares */ }
        const next = { key, url: data.url, image: data.image, blob }
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

  // Prepare the link as soon as the sheet opens or a toggle changes.
  useEffect(() => {
    const timer = window.setTimeout(() => { void create() }, 350)
    return () => window.clearTimeout(timer)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dialog.current?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggle = (name: 'context' | 'tagline') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...prefs, [name]: event.target.checked }
    setPrefs(next)
    writePrefs(next)
    setStatus('')
  }

  const fileOf = (ready: Created) => ready.blob ? new File([ready.blob], 'tinct-quote.png', { type: 'image/png' }) : null

  const onShare = () => {
    const ready = created?.key === key ? created : null
    if (!ready) {
      setStatus('Preparing…')
      void create().then(next => setStatus(next ? '' : 'Could not create the link. Try again.'))
      return
    }
    const file = fileOf(ready)
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
    const withFile: ShareData | null = file && nav.canShare?.({ files: [file] }) ? { files: [file], url: ready.url } : null
    if (!nav.share) { void copyLink(); return }
    nav.share(withFile ?? { url: ready.url })
      .then(() => trackFunnel('share_completed', { method: 'native', book_id: target.bookId }))
      .catch(() => { /* dismissed */ })
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
      const blob = created?.key === key && created.blob ? Promise.resolve(created.blob) : create().then(next => { if (!next?.blob) throw new Error('no image'); return next.blob })
      await navigator.clipboard.write([new ClipboardItemCtor({ 'image/png': blob })])
      setStatus('Copied the image.')
      trackFunnel('share_completed', { method: 'copy_image', book_id: target.bookId })
    } catch {
      setStatus('Could not copy the image. Use Download instead.')
    }
  }

  const download = async () => {
    const next = await create()
    if (!next?.blob) { setStatus('Could not make the image. Try again.'); return }
    const href = URL.createObjectURL(next.blob)
    const link = document.createElement('a')
    link.href = href
    link.download = `tinct-${target.bookId}-quote.png`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(href), 10_000)
    trackFunnel('share_completed', { method: 'download', book_id: target.bookId })
  }

  return (
    <div className="lab-share-layer" data-testid="lab-share-sheet" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className={`lab-share-sheet is-${format}`} role="dialog" aria-modal="true" aria-label="Share highlight" tabIndex={-1} ref={dialog}>
        <button type="button" className="lab-share-close" aria-label="Close" onClick={onClose}>×</button>
        <div className={`lab-share-preview is-${format}${previewLoaded ? ' is-loaded' : ''}`}>
          <img src={previewSrc} alt="Preview of the image" data-testid="lab-share-preview" onLoad={() => setPreviewLoaded(true)} />
        </div>
        <label className="lab-share-toggle">Show surrounding text<input type="checkbox" checked={prefs.context} onChange={toggle('context')} data-testid="lab-share-context" /><span aria-hidden="true" /></label>
        <label className="lab-share-toggle">Add &quot;Read free at tinct.app&quot;<input type="checkbox" checked={prefs.tagline} onChange={toggle('tagline')} data-testid="lab-share-tagline" /><span aria-hidden="true" /></label>
        <div className="lab-share-buttons">
          <button type="button" className="is-primary" onClick={onShare} data-testid="lab-share-native">Share…</button>
          <button type="button" onClick={() => void copyLink()} data-testid="lab-share-copy-link">Copy link</button>
        </div>
        {format === 'desktop' && (
          <div className="lab-share-buttons">
            <button type="button" onClick={() => void copyImage()} data-testid="lab-share-copy-image">Copy image</button>
            <button type="button" onClick={() => void download()} data-testid="lab-share-download">Download</button>
          </div>
        )}
        <p className="lab-share-status" role="status" aria-live="polite" data-testid="lab-share-status">
          {status || `Uses your edition (${target.editionLabel.replace(/[()]/g, '')}) and look (${LOOK_NAMES[look]}). Both settings are remembered for next time.`}
        </p>
      </div>
    </div>
  )
}
