/**
 * A scanned PDF's text, read from its page images by the account (OCR, worker/ownOcrCoordinator.ts),
 * started by itself for Premium and the trial (Anders, 3 Nov 2026: "fix this once and for all, I'd rather
 * have some costs and a good cx than a ton of patches").
 *
 * Why: a scan often carries a hidden text layer made by its scanner's OCR. Tinct used to trust any such
 * layer, so "The Case for Christ" read "pOltrayed", "Andthis", "1 think", lost its drop caps and ran its
 * section headings into paragraphs, while its page images were sharp. Page images read by the vision
 * model give the drop caps, headings and footnotes back. So every scanned PDF is recognised, with a text
 * layer or without: a scan without one is any PDF whose scan found no text (`textPages` 0); one with a
 * layer is a PDF whose sampled pages are each a single full-page image (`isImageScan`).
 *
 * One job per book and page load, in the background, never holding the book back: started after the book
 * opens, page images drawn and sent only while the page is in front (pdf-ocr.js run, the viewer's own
 * job, so a job begun in either goes on in the other and on the reader's other devices). Free accounts,
 * signed out, offline, the switch off (404) or a month's ceiling reached: nothing is started and the
 * book reads as before. When the text is ready it is kept on the book's record in place of the text
 * layer's conversion; the next open reads it, at the same PDF page (the place moves by page:
 * pdfEditions.ts readPdfTextPlace, as for any change of converter).
 */
import type { UserBookEdition } from './userEdition'

/** Pages sampled to tell a scan with a text layer from a PDF with text of its own. */
export function samplePages(count: number): number[] {
  if (!(count > 0)) return []
  return [...new Set([1, Math.min(count, 8), Math.ceil(count / 2)])].filter(n => n >= 1 && n <= count).sort((a, b) => a - b)
}

/** pdf.js operator codes this reads (pdfjsLib.OPS). */
export interface PdfOps { save: number; restore: number; transform: number; paintImageXObject: number; paintInlineImageXObject: number; paintImageMaskXObject?: number }

/** A page drawn as one image over at least 85% of it: a scanned page (pdf-scan.js pagePictures uses the same share). */
export function isFullPageImage(fnArray: readonly number[], argsArray: readonly unknown[], view: readonly number[], OPS: PdfOps): boolean {
  const area = Math.abs((view[2] - view[0]) * (view[3] - view[1])) || 1
  type M = [number, number, number, number, number, number]
  const times = (m: M, n: M): M => [m[0] * n[0] + m[1] * n[2], m[0] * n[1] + m[1] * n[3], m[2] * n[0] + m[3] * n[2], m[2] * n[1] + m[3] * n[3], m[4] * n[0] + m[5] * n[2] + n[4], m[4] * n[1] + m[5] * n[3] + n[5]]
  let ctm: M = [1, 0, 0, 1, 0, 0]
  const stack: M[] = []
  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i]
    const args = argsArray[i] as number[] | undefined
    if (fn === OPS.save) stack.push(ctm)
    else if (fn === OPS.restore) ctm = stack.pop() ?? [1, 0, 0, 1, 0, 0]
    else if (fn === OPS.transform && Array.isArray(args) && args.length >= 6) ctm = times(args.slice(0, 6) as M, ctm)
    else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject || (OPS.paintImageMaskXObject !== undefined && fn === OPS.paintImageMaskXObject)) {
      if (Math.abs(ctm[0] * ctm[3] - ctm[1] * ctm[2]) / area >= 0.85) return true
    }
  }
  return false
}

interface OpsPage { view: number[]; getOperatorList(): Promise<{ fnArray: number[]; argsArray: unknown[] }>; cleanup?: () => void }
interface OpsDocument { numPages: number; getPage(n: number): Promise<OpsPage> }

/** Every sampled page a full-page image: a scan, whatever text layer it carries. */
export async function isImageScan(pdf: OpsDocument, OPS: PdfOps): Promise<boolean> {
  const pages = samplePages(pdf.numPages)
  if (!pages.length) return false
  for (const n of pages) {
    const page = await pdf.getPage(n)
    try {
      const ops = await page.getOperatorList()
      if (!isFullPageImage(ops.fnArray, ops.argsArray, page.view, OPS)) return false
    } finally { page.cleanup?.() }
  }
  return true
}

/** The account's answer about a book's job (pdf-ocr.js api().status; worker routes/userBooks.ts). */
export interface ScanJobStatus { state?: string; tier?: string | null; stored?: boolean; reason?: string }
export interface ScanOcrApi {
  status(hex: string): Promise<ScanJobStatus | null | undefined>
  edition(hex: string): Promise<UserBookEdition | null>
}

export type ScanRecognitionOutcome = 'kept' | 'started' | 'free' | 'off' | 'unavailable' | 'paused' | 'not-stored'

/**
 * Decide and run one book's recognition. `run` sends the missing pages and waits for the text
 * (pdf-ocr.js run); `keep` stores the recognised text on the book's record.
 */
export async function recogniseScan(hex: string, deps: {
  api: ScanOcrApi
  run: () => Promise<UserBookEdition | null>
  keep: (edition: UserBookEdition) => Promise<void>
}): Promise<ScanRecognitionOutcome> {
  const status = await deps.api.status(hex)
  // 404: the switch is off. Undefined: offline or busy (tried again next open).
  if (status === null) return 'off'
  if (!status || typeof status.state !== 'string') return 'unavailable'
  if (status.state === 'done') {
    const edition = await deps.api.edition(hex)
    if (!edition) return 'unavailable'
    await deps.keep(edition)
    return 'kept'
  }
  if (status.tier !== 'premium' && status.tier !== 'trial') return 'free'
  // The account copy is still on its way (a book just added): the next open starts it.
  if (status.stored === false) return 'not-stored'
  // A month's ceiling: the account resumes it when the month turns (the next open after that).
  if (status.state === 'paused' && status.reason !== 'premium_required') return 'paused'
  const edition = await deps.run()
  if (edition) await deps.keep(edition)
  return edition ? 'kept' : 'started'
}
