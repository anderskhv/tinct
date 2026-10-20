/**
 * A text PDF converted to its Tinct text, on this device, with Add a book's
 * own scripts: the pdf.js the viewer ships, its scan (pdf-scan.js: title,
 * author, chapters and the default edition) and pdf-text.js (the text in
 * reading order, as paragraphs with their pages). Loaded only when a PDF
 * opens in the reader without a stored conversion; nothing is sent anywhere.
 *
 * The same file converts the same way on every device: the scan kept with the
 * book (when of the current version) or a new one, its chapter titles in
 * Tinct's house style exactly as the viewer styles them before keeping them.
 */
import { normalizeChapterTitle } from '../../../public/lab/chapter-title.js'
import type { UserBookEdition } from './userEdition'
import type { UserBookImage } from './epubEdition'
import type { PdfLayoutDefault } from './pdfEditions'

/** The cache tag of Add a book's scripts (its index.html). */
export const ADDBOOK_SCRIPT_TAG = '20261020copy'
const BASE = '/lab/addbook/'

export interface PdfLayout { default: PdfLayoutDefault; score: number; signals: Record<string, boolean> }
export interface PdfScan {
  v: number
  title: string
  author: string
  pages: number
  nav: string
  entries: Array<{ id: string; label: string; page: number; kind?: string; parent?: string | null }>
  language: string
  textPages: number
  layout?: PdfLayout
  [field: string]: unknown
}
interface PdfDocument { numPages: number; destroy: () => Promise<void> }
/** A region of a page to crop (pdf-regions.js pageRegions), in page fractions, top left at 0. */
export interface PdfRegion { kind: 'figure' | 'table' | 'equation'; x: number; y: number; w: number; h: number; label?: string; caption?: string; captionBox?: { x: number; y: number; w: number; h: number } }
/** A region as the converter takes it: with the id its crop is kept under and the size it is drawn at. */
export interface PdfCropRegion extends PdfRegion { id: string; css: { width: number; height: number } }
interface PdfTextItem { str: string; transform: number[]; width: number }
interface PdfPage {
  view: number[]
  getViewport: (options: { scale: number }) => { width: number; height: number; scale: number; transform: number[] }
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: unknown; background?: string }) => { promise: Promise<void> }
}
type RegionsOf = (n: number, page: PdfPage, items: PdfTextItem[]) => Promise<PdfCropRegion[]>
interface Engine {
  pdfjs: { getDocument: (options: unknown) => { promise: Promise<PdfDocument> }; GlobalWorkerOptions: { workerSrc: string }; Util?: { transform: (a: number[], b: number[]) => number[] } }
  scan: { current: (scan: unknown) => boolean; scan: (pdf: PdfDocument, options: { fileName: string }) => Promise<PdfScan | null> }
  text: { convert: (pdf: PdfDocument, options: { scan: PdfScan; regions?: RegionsOf }) => Promise<UserBookEdition | null> }
  /** pdf-regions.js and margin.js (findFigures): where a page's formulas, figures and tables are. Absent: no crops. */
  regions?: RegionsApi
  margin?: { findFigures: (input: { ink: Uint8Array; W: number; H: number; spans: unknown[]; formulas: unknown[] }) => { figures: unknown[]; captions: unknown[] } }
}
interface RegionsApi {
  displayFormulas: (body: Array<{ x: number; base: number; size: number; w: number; str: string }>, vp: { width: number; height: number }) => { blocks: Array<{ x: number; y: number; w: number; h: number }> }
  pageRegions: (input: { figures: unknown[]; captions: unknown[]; blocks: unknown[] }) => PdfRegion[]
  textLines: (body: Array<{ x: number; base: number; size: number; w: number; str: string }>, vp: { width: number; height: number }) => unknown[]
  trimRegions: (regions: PdfRegion[], lines: unknown[]) => PdfRegion[]
  cropSize: (region: PdfRegion, page: { w: number; h: number }, options: { dpr: number; column: number }) => { width: number; height: number; css: { width: number; height: number } } | null
  /** displayFormulas, findFigures, pageRegions and trimRegions in one: a page's regions from its ink and text. */
  find?: (input: FindInput, margin: NonNullable<Engine['margin']>) => PdfRegion[]
  /** `find` in a worker (js/pdf-regions-worker.js at the URL), else on this thread. */
  finder?: (url: string | null, margin: NonNullable<Engine['margin']>) => (input: FindInput) => Promise<PdfRegion[]>
}
interface FindInput {
  ink: Uint8Array; W: number; H: number
  spans: Array<{ x: number; y: number; w: number; h: number; text: string }>
  body: Array<{ x: number; base: number; size: number; w: number; str: string }>
  vp: { width: number; height: number }
}

type Global = typeof globalThis & { pdfjsLib?: Engine['pdfjs']; TinctPdfScan?: Engine['scan']; TinctPdfText?: Engine['text']; TinctPdfRegions?: RegionsApi; TinctMargin?: Engine['margin'] }

function script(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.onload = () => resolve()
    el.onerror = () => reject(new Error('script'))
    document.head.append(el)
  })
}

let loading: Promise<Engine> | null = null
/** Add a book's pdf.js, scan and text scripts, loaded once (in this order: each needs the one before). */
export function loadPdfEngine(): Promise<Engine> {
  loading ??= (async () => {
    const g = globalThis as Global
    if (!g.pdfjsLib) await script(`${BASE}vendor/pdfjs/pdf.min.js`)
    if (!g.TinctPdfScan) await script(`${BASE}js/pdf-scan.js?v=${ADDBOOK_SCRIPT_TAG}`)
    if (!g.TinctPdfText) await script(`${BASE}js/pdf-text.js?v=${ADDBOOK_SCRIPT_TAG}`)
    // The crops' rules, shared with the viewer (its figure chips, a formula selected whole). Without them the text converts as before.
    if (!g.TinctPdfRegions) await script(`${BASE}js/pdf-regions.js?v=${ADDBOOK_SCRIPT_TAG}`).catch(() => {})
    if (!g.TinctMargin) await script(`${BASE}js/margin.js?v=${ADDBOOK_SCRIPT_TAG}`).catch(() => {})
    if (!g.pdfjsLib || !g.TinctPdfScan || !g.TinctPdfText) throw new Error('PDF engine unavailable')
    if (!g.pdfjsLib.GlobalWorkerOptions.workerSrc) g.pdfjsLib.GlobalWorkerOptions.workerSrc = `${BASE}vendor/pdfjs/pdf.worker.min.js`
    return { pdfjs: g.pdfjsLib, scan: g.TinctPdfScan, text: g.TinctPdfText, regions: g.TinctPdfRegions, margin: g.TinctMargin }
  })()
  loading.catch(() => { loading = null })
  return loading
}

/** A scan's chapter titles in Tinct's house style, as the viewer keeps them (reader.js buildContents). */
export function houseStyledScan(scan: PdfScan): PdfScan {
  return { ...scan, entries: scan.entries.map(entry => ({ ...entry, label: normalizeChapterTitle(entry.label, { language: scan.language || 'en' }) })) }
}

export interface ConvertedPdf {
  /** Null for a PDF without text to reflow (a scan). */
  edition: UserBookEdition | null
  /** The crops of its pages the text shows (figure id -> PNG), kept with the book on this device. */
  images?: Map<string, UserBookImage>
  /** The scan used: the stored one, or a new one (`fresh`), to keep with the book. */
  scan: PdfScan
  fresh: boolean
}

/**
 * Convert a PDF's bytes to its Tinct text. `stored`: the scan kept with the
 * book, used when it is of the current version.
 */
export async function convertPdf(bytes: ArrayBuffer, options: { fileName?: string; stored?: unknown; engine?: () => Promise<Engine>; crops?: CropOptions | false } = {}): Promise<ConvertedPdf> {
  const engine = await (options.engine ?? loadPdfEngine)()
  // pdf.js takes over (detaches) the buffer it is given: it reads a copy.
  const pdf = await engine.pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)), isEvalSupported: false, verbosity: 0 }).promise
  try {
    const kept = engine.scan.current(options.stored) && (options.stored as PdfScan).layout ? options.stored as PdfScan : null
    const scanned = kept ?? await engine.scan.scan(pdf, { fileName: options.fileName ?? '' })
    if (!scanned) throw new Error('scan')
    const scan = kept ?? houseStyledScan(scanned)
    const images = new Map<string, UserBookImage>()
    const regions = options.crops !== false ? cropper(engine, images, options.crops || deviceCrops()) : null
    const edition = scan.textPages > 0 ? await engine.text.convert(pdf, { scan, ...(regions ? { regions } : {}) }) : null
    // Its crops, drawn while the converter read on: a text naming one that could not be drawn has its picture missing.
    if (regions) await regions.drawn()
    // Only the crops the text names are kept.
    const named = new Set((edition?.chapters ?? []).flatMap(chapter => (chapter.figures ?? []).map(figure => figure.id)))
    for (const id of [...images.keys()]) if (!named.has(id)) images.delete(id)
    return { edition, scan, fresh: !kept, images }
  } finally {
    await pdf.destroy().catch(() => {})
  }
}

/* ---------- Crops: a page's formulas, figures and tables as pictures (converter 3) ---------- */

export interface CropOptions {
  /** The device pixel ratio the crops are drawn for. */
  dpr: number
  /** The reading column's width (CSS pixels) a figure fills. */
  column: number
}
/** This device: its pixel ratio, and the reader's column (the phone's width less its margins; at most a desktop leaf's). */
export function deviceCrops(): CropOptions | false {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false
  const width = window.innerWidth || 390
  return { dpr: Math.max(1, Math.min(3, window.devicePixelRatio || 1)), column: Math.min(680, Math.max(280, width - 32)) }
}

type Canvas = HTMLCanvasElement
function canvas(width: number, height: number): Canvas {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(width))
  c.height = Math.max(1, Math.round(height))
  return c
}
const pngOf = (c: Canvas): Promise<Blob | null> => new Promise(resolve => { try { c.toBlob(blob => resolve(blob), 'image/png') } catch { resolve(null) } })

/**
 * The regions callback the converter calls for each page (pdf-text.js convert `regions`): the
 * page drawn small to find its figures and tables (margin.js findFigures, as the viewer finds
 * them) and its displayed formulas (pdf-regions.js displayFormulas). The converter waits only for
 * where they are (their ids and drawn sizes); each region is then drawn sharp at this device's
 * pixel ratio (pdf-regions.js cropSize, the long side at most 1568 px), on clear paper, one page at
 * a time while the converter reads on, and kept in `images` under its id (`drawn()`: all are, true
 * when every one was). The same steps and ids as the viewer's (pdf-text-view.js cropper). A page
 * that cannot be drawn has no crops: its text stays text.
 */
type Cropper = RegionsOf & { drawn: () => Promise<boolean> }
function cropper(engine: Engine, images: Map<string, UserBookImage>, options: CropOptions | false): Cropper | null {
  const api = engine.regions, margin = engine.margin, util = engine.pdfjs.Util
  if (!options || !api || !margin || !util || typeof document === 'undefined') return null
  // Where the regions are: worked out off the main thread while the next page is drawn (js/pdf-regions-worker.js).
  const find = api.finder
    ? api.finder(`${BASE}js/pdf-regions-worker.js?v=${ADDBOOK_SCRIPT_TAG}`, margin)
    : async (input: FindInput): Promise<PdfRegion[]> => {
      const blocks = api.displayFormulas(input.body, input.vp).blocks
      const found = margin.findFigures({ ink: input.ink, W: input.W, H: input.H, spans: input.spans, formulas: blocks })
      return api.trimRegions(api.pageRegions({ figures: found.figures, captions: found.captions, blocks }), api.textLines(input.body, input.vp))
    }
  interface Job { n: number; page: PdfPage; regions: PdfRegion[]; sizes: Array<ReturnType<RegionsApi['cropSize']>>; scale: number }
  const queue: Job[] = []
  let running: Promise<void> | null = null
  let failed = false
  // A page's sharp drawing: the page once, sharp enough for its sharpest crop, then each crop cut from it.
  const draw = async ({ n, page, regions, sizes, scale }: Job): Promise<void> => {
    const big = page.getViewport({ scale })
    const sharp = canvas(big.width, big.height), sg = sharp.getContext('2d')
    if (!sg) { failed = true; return }
    try {
      await page.render({ canvasContext: sg, viewport: big, background: 'rgba(0,0,0,0)' }).promise
      for (const [k, region] of regions.entries()) {
        const size = sizes[k]
        if (!size) continue
        const crop = canvas(size.width, size.height), cg = crop.getContext('2d')
        if (!cg) { failed = true; continue }
        cg.drawImage(sharp, region.x * sharp.width, region.y * sharp.height, region.w * sharp.width, region.h * sharp.height, 0, 0, crop.width, crop.height)
        const blob = await pngOf(crop)
        crop.width = crop.height = 0
        if (!blob) { failed = true; continue }
        images.set(`p${n}-${k + 1}`, { type: 'image/png', data: await blob.arrayBuffer() })
      }
    } finally { sharp.width = sharp.height = 0 }
  }
  const pump = () => {
    running ??= (async () => {
      while (queue.length) { try { await draw(queue.shift()!) } catch { failed = true } }
      running = null
    })()
  }
  const run: Cropper = Object.assign(async (n: number, page: PdfPage, items: PdfTextItem[]): Promise<PdfCropRegion[]> => {
    const base = page.getViewport({ scale: 1 })
    const pageSize = { w: base.width, h: base.height }
    // Where: the page 480 px wide, its ink at 240 (as the viewer's figuresOff).
    const vp = page.getViewport({ scale: 480 / base.width })
    const drawn = canvas(vp.width, vp.height)
    const g = drawn.getContext('2d', { alpha: false })
    if (!g) return []
    g.fillStyle = '#fff'; g.fillRect(0, 0, drawn.width, drawn.height)
    await page.render({ canvasContext: g, viewport: vp }).promise
    const W = 240, H = Math.max(1, Math.round(W * drawn.height / drawn.width))
    const small = canvas(W, H), x = small.getContext('2d', { willReadFrequently: true })
    if (!x) return []
    x.drawImage(drawn, 0, 0, W, H)
    const d = x.getImageData(0, 0, W, H).data, ink = new Uint8Array(W * H)
    for (let i = 0; i < W * H; i++) ink[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) < 247 ? 1 : 0
    drawn.width = drawn.height = 0; small.width = small.height = 0
    const spans: Array<{ x: number; y: number; w: number; h: number; text: string }> = []
    const body: Array<{ x: number; base: number; size: number; w: number; str: string }> = []
    for (const it of items) {
      if (!it || typeof it.str !== 'string' || !it.str.trim() || !it.transform) continue
      const tx = util.transform(vp.transform, it.transform), size = Math.hypot(tx[2], tx[3])
      if (size < 1) continue
      spans.push({ x: tx[4] / vp.width, y: (tx[5] - size * 0.86) / vp.height, w: (it.width * vp.scale) / vp.width, h: (size * 1.1) / vp.height, text: it.str })
      body.push({ x: tx[4], base: tx[5], size, w: it.width * vp.scale, str: it.str })
    }
    const regions = await find({ ink, W, H, spans, body, vp: { width: vp.width, height: vp.height } })
    if (!regions.length) return []
    // Drawn once, sharp enough for the sharpest crop on the page, on clear paper.
    const sizes = regions.map(region => api.cropSize(region, pageSize, options))
    // A phone's canvas holds about 16 million pixels: the page is drawn at no more than 12 million.
    const most = Math.sqrt(12e6 / Math.max(1, pageSize.w * pageSize.h))
    const scale = Math.min(most, Math.max(1, ...regions.map((region, k) => sizes[k] ? sizes[k]!.width / (region.w * pageSize.w) : 1)))
    queue.push({ n, page, regions, sizes, scale })
    pump()
    const out: PdfCropRegion[] = []
    for (const [k, region] of regions.entries()) { const size = sizes[k]; if (size) out.push({ ...region, id: `p${n}-${k + 1}`, css: size.css }) }
    return out
  }, { drawn: async () => { while (running) await running; return !failed } })
  return run
}
