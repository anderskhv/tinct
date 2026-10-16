/**
 * Figures: pictures at their place in the text, for any book.
 *
 * A figure is a paragraph of its own whose whole text is one word,
 * `￼` + its id (U+FFFC is the object replacement character). It is
 * therefore one item with one position (`paragraphIndex:0`): highlights, page
 * turns, Back, resume and the page map treat it like any other paragraph, and
 * a page can never split it. What it shows travels beside the text in the
 * chapter (`figures`, types/index.ts ChapterFigure) and is registered here as
 * the chapter loads, looked up by the paragraph's text, as kinds and links
 * are (labParagraphStyle.ts).
 *
 * Layout is decided from the page, not the font: a figure is drawn the full
 * column wide unless that would take more than FIGURE_MAX_PAGE_SHARE of the
 * page's height; scaled down to fit that, it must stay readably wide
 * (FIGURE_MIN_WIDTH_SHARE of the column, at most FIGURE_MIN_WIDTH_PX), or it becomes a strip (a
 * thumbnail, "FIGURE N ↗" and its caption) on that layout. A figure marked
 * `large` (a map, a detailed plate) is always a strip. The size comes from the
 * figure's own hints, so a page measures the same before its image loads.
 *
 * Images: a built-in edition names a same-origin path; a reader's own book
 * names `asset:<key>`, resolved on this device from what the book's store
 * hands over (registerFigureAssets) and shown through object URLs created
 * when a figure is drawn and revoked when the last one showing it goes. A
 * figure whose image cannot be drawn (`unavailable`, or it fails to load)
 * shows a plain placeholder with its caption, never a broken image.
 */
import type { Chapter, ChapterFigure } from '../types'

export const FIGURE_MARK = '￼'

export function figureToken(id: string): string {
  return FIGURE_MARK + id
}

export function isFigureToken(text: string | undefined): boolean {
  return !!text && text.length > 1 && text[0] === FIGURE_MARK && !/\s/.test(text)
}

export interface LabFigure extends ChapterFigure {
  chapterNumber?: number
  paragraphIndex?: number
}

const figures = new Map<string, LabFigure>()

/** Register a chapter's figures (built-in edition or own book alike). */
export function registerFigures(chapter: Pick<Chapter, 'paragraphs' | 'figures'> & { number?: number } | null | undefined): void {
  if (!chapter?.figures?.length) return
  for (const figure of chapter.figures) {
    if (!figure || typeof figure.id !== 'string' || !figure.id || typeof figure.src !== 'string') continue
    const token = figureToken(figure.id)
    const paragraphIndex = chapter.paragraphs.indexOf(token)
    if (paragraphIndex < 0) continue
    figures.set(token, { ...figure, chapterNumber: chapter.number, paragraphIndex })
  }
}

/** The figure a paragraph is, if it is one. */
export function figureFor(text: string | undefined): LabFigure | null {
  return isFigureToken(text) ? figures.get(text!) ?? null : null
}

/** Every figure of the chapters given, in reading order. */
export function bookFigures(chapters: ReadonlyArray<Pick<Chapter, 'number' | 'paragraphs' | 'figures'>>): LabFigure[] {
  const out: LabFigure[] = []
  for (const chapter of chapters) {
    for (const figure of chapter.figures ?? []) {
      const paragraphIndex = chapter.paragraphs.indexOf(figureToken(figure.id))
      if (paragraphIndex >= 0) out.push({ ...figure, chapterNumber: chapter.number, paragraphIndex })
    }
  }
  return out.sort((a, b) => a.number - b.number)
}

/** What the companion, a quotation or a search reads where a figure stands. */
export function figureReadingText(figure: Pick<ChapterFigure, 'number' | 'caption' | 'alt'> | null): string {
  if (!figure) return '[Figure]'
  const words = figure.caption || figure.alt || ''
  return `[Figure ${figure.number}${words ? `: ${words}` : ''}]`
}

/** A paragraph as plain reading text: a figure's token becomes its caption. */
export function readableParagraph(text: string): string {
  return isFigureToken(text) ? figureReadingText(figureFor(text)) : text
}

/* ---------- Layout ---------- */

/** No figure takes more of the page's height than this. */
export const FIGURE_MAX_PAGE_SHARE = 0.45
/**
 * Scaled to fit, a figure narrower than this share of the column, and than
 * FIGURE_MIN_WIDTH_PX, is a strip instead (a portrait plate on a phone).
 */
export const FIGURE_MIN_WIDTH_SHARE = 0.5
export const FIGURE_MIN_WIDTH_PX = 180
/** Never drawn more than this many times its own pixel size. */
export const FIGURE_MAX_UPSCALE = 2
/** The aspect (height / width) assumed when a figure names no size. */
const DEFAULT_ASPECT = 0.75

export interface LabFigureLayout { columnWidth: number; pageHeight: number }

let layout: LabFigureLayout | null = null

/** Set by the paginators from the page they measure; the page paints with the same. */
export function setFigureLayout(next: LabFigureLayout | null): void {
  layout = next && next.columnWidth > 0 && next.pageHeight > 0
    ? { columnWidth: Math.round(next.columnWidth), pageHeight: Math.round(next.pageHeight) }
    : null
}

export function figureLayout(): LabFigureLayout | null {
  return layout
}

export type LabFigurePlacement =
  | { mode: 'inline'; width: number | null; height: number | null }
  | { mode: 'strip' }

export function figurePlacement(figure: Pick<ChapterFigure, 'width' | 'height' | 'large'>, at: LabFigureLayout | null = layout): LabFigurePlacement {
  if (figure.large) return { mode: 'strip' }
  const aspect = figure.width && figure.height ? figure.height / figure.width : DEFAULT_ASPECT
  if (!at) return { mode: 'inline', width: null, height: null }
  let width = at.columnWidth
  if (figure.width) width = Math.min(width, figure.width * FIGURE_MAX_UPSCALE)
  let height = width * aspect
  const most = at.pageHeight * FIGURE_MAX_PAGE_SHARE
  if (height > most) { height = most; width = height / aspect }
  if (width < Math.min(at.columnWidth * FIGURE_MIN_WIDTH_SHARE, FIGURE_MIN_WIDTH_PX)) return { mode: 'strip' }
  return { mode: 'inline', width: Math.floor(width), height: Math.floor(height) }
}

/** The frame's aspect ratio (CSS), for a frame drawn before its page size is known. */
export function figureAspect(figure: Pick<ChapterFigure, 'width' | 'height'>): string {
  return figure.width && figure.height ? `${figure.width} / ${figure.height}` : '4 / 3'
}

/** "FIGURE 3 ↗": a strip's label. */
export function figureLabel(figure: Pick<ChapterFigure, 'number'>): string {
  return `Figure ${figure.number} ↗`
}

/**
 * The figure's measuring copy: the same boxes the page paints (LabFigure.tsx),
 * with no image (a figure's size never depends on it).
 */
export function figureElement(figure: LabFigure): HTMLElement {
  const place = figurePlacement(figure)
  const root = document.createElement('span')
  root.setAttribute('data-figure-id', figure.id)
  const caption = () => {
    const span = document.createElement('span')
    span.className = 'lab-figure-caption'
    span.textContent = figure.caption || ''
    return span
  }
  if (place.mode === 'strip') {
    root.className = 'lab-figure is-strip'
    const thumb = document.createElement('span')
    thumb.className = 'lab-figure-thumb'
    const text = document.createElement('span')
    text.className = 'lab-figure-strip-text'
    const label = document.createElement('span')
    label.className = 'lab-figure-label'
    label.textContent = figureLabel(figure)
    text.append(label)
    if (figure.caption) text.append(caption())
    root.append(thumb, text)
    return root
  }
  root.className = 'lab-figure is-inline'
  const frame = document.createElement('span')
  frame.className = 'lab-figure-frame'
  if (place.width != null && place.height != null) {
    frame.style.width = `${place.width}px`
    frame.style.height = `${place.height}px`
  } else frame.style.aspectRatio = figureAspect(figure)
  root.append(frame)
  if (figure.caption) root.append(caption())
  return root
}

/* ---------- Images ---------- */

type AssetResolver = (key: string) => Blob | null

let assets: AssetResolver | null = null
/** Bumped whenever the device assets change, or object URLs must be made again. */
let assetGeneration = 0
const assetListeners = new Set<() => void>()

/**
 * A reader's own book hands over its pictures (kept on this device) while it is open.
 * Figures already drawn are told, so they draw again from the new pictures: one
 * drawn before the book handed them over, or holding a URL made for an earlier
 * set, is never left blank or broken.
 */
export function registerFigureAssets(resolver: AssetResolver | null): void {
  assets = resolver
  refreshFigureUrls()
}

/** Every object URL made again (the page came back from the browser's cache, an image failed to load). */
export function refreshFigureUrls(): void {
  for (const entry of urls.values()) URL.revokeObjectURL(entry.url)
  urls.clear()
  assetGeneration += 1
  for (const listener of [...assetListeners]) listener()
}

/** The current asset generation, for a figure to draw again when it changes. */
export function figureAssetGeneration(): number {
  return assetGeneration
}

export function subscribeFigureAssets(listener: () => void): () => void {
  assetListeners.add(listener)
  return () => { assetListeners.delete(listener) }
}

interface HeldUrl { url: string; users: number }
const urls = new Map<string, HeldUrl>()

/** A drawn figure's hold on its image URL. */
export interface FigureUrlHold { url: string; release: () => void }

/**
 * The URL to draw a figure's image from, held until released: its own path,
 * or an object URL made now (from the bytes on this device) for a device
 * asset, shared by every figure showing it and revoked when the last goes.
 * Null when there is nothing to draw (no image, or not handed over yet).
 */
export function holdFigureUrl(src: string): FigureUrlHold | null {
  if (!src) return null
  if (!src.startsWith('asset:')) return /^\/(?!\/)/.test(src) ? { url: src, release: () => {} } : null
  let held = urls.get(src)
  if (!held) {
    const blob = assets?.(src.slice('asset:'.length)) ?? null
    if (!blob || typeof URL.createObjectURL !== 'function') return null
    held = { url: URL.createObjectURL(blob), users: 0 }
    urls.set(src, held)
  }
  const entry = held
  entry.users += 1
  let released = false
  return {
    url: entry.url,
    release: () => {
      if (released) return
      released = true
      entry.users -= 1
      if (entry.users > 0 || urls.get(src) !== entry) return
      urls.delete(src)
      URL.revokeObjectURL(entry.url)
    },
  }
}

/** A figure's URL failed to draw: the next hold makes a fresh object URL. */
export function dropFigureUrl(src: string, url: string): void {
  const held = urls.get(src)
  if (!held || held.url !== url) return
  urls.delete(src)
  URL.revokeObjectURL(url)
}

// iOS Safari can bring a page back from its cache with object URLs that no longer
// load: every figure draws again from fresh ones.
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', event => { if ((event as PageTransitionEvent).persisted && urls.size) refreshFigureUrls() })
}

/** The image itself, for sending to the companion. */
export async function figureBlob(src: string): Promise<Blob | null> {
  if (src.startsWith('asset:')) return assets?.(src.slice('asset:'.length)) ?? null
  if (!/^\/(?!\/)/.test(src)) return null
  try {
    const response = await fetch(src)
    return response.ok ? await response.blob() : null
  } catch { return null }
}

/** Test seam. */
export function resetFigures(): void {
  figures.clear()
  layout = null
  registerFigureAssets(null)
}
