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
import type { PdfLayoutDefault } from './pdfEditions'

/** The cache tag of Add a book's scripts (its index.html). */
export const ADDBOOK_SCRIPT_TAG = '20261011wait'
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
interface Engine {
  pdfjs: { getDocument: (options: unknown) => { promise: Promise<PdfDocument> }; GlobalWorkerOptions: { workerSrc: string } }
  scan: { current: (scan: unknown) => boolean; scan: (pdf: PdfDocument, options: { fileName: string }) => Promise<PdfScan | null> }
  text: { convert: (pdf: PdfDocument, options: { scan: PdfScan }) => Promise<UserBookEdition | null> }
}

type Global = typeof globalThis & { pdfjsLib?: Engine['pdfjs']; TinctPdfScan?: Engine['scan']; TinctPdfText?: Engine['text'] }

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
    if (!g.pdfjsLib || !g.TinctPdfScan || !g.TinctPdfText) throw new Error('PDF engine unavailable')
    if (!g.pdfjsLib.GlobalWorkerOptions.workerSrc) g.pdfjsLib.GlobalWorkerOptions.workerSrc = `${BASE}vendor/pdfjs/pdf.worker.min.js`
    return { pdfjs: g.pdfjsLib, scan: g.TinctPdfScan, text: g.TinctPdfText }
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
  /** The scan used: the stored one, or a new one (`fresh`), to keep with the book. */
  scan: PdfScan
  fresh: boolean
}

/**
 * Convert a PDF's bytes to its Tinct text. `stored`: the scan kept with the
 * book, used when it is of the current version.
 */
export async function convertPdf(bytes: ArrayBuffer, options: { fileName?: string; stored?: unknown; engine?: () => Promise<Engine> } = {}): Promise<ConvertedPdf> {
  const engine = await (options.engine ?? loadPdfEngine)()
  // pdf.js takes over (detaches) the buffer it is given: it reads a copy.
  const pdf = await engine.pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)), isEvalSupported: false, verbosity: 0 }).promise
  try {
    const kept = engine.scan.current(options.stored) && (options.stored as PdfScan).layout ? options.stored as PdfScan : null
    const scanned = kept ?? await engine.scan.scan(pdf, { fileName: options.fileName ?? '' })
    if (!scanned) throw new Error('scan')
    const scan = kept ?? houseStyledScan(scanned)
    const edition = scan.textPages > 0 ? await engine.text.convert(pdf, { scan }) : null
    return { edition, scan, fresh: !kept }
  } finally {
    await pdf.destroy().catch(() => {})
  }
}
