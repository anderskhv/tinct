/** Original-page navigation uses the existing local PDF scan, without converting prose or calling AI. */
import { loadPdfEngine, type PdfScan } from './pdfEdition'
import { cacheOwnedPdfScan, loadOwnedPdfBytes, readOwnedBookFileId, userBookOwner } from './userBookStore'
import type { PdfOriginalScanOutline } from '../sharedReader/pdf/pdfOriginalUnits'

type Engine = Awaited<ReturnType<typeof loadPdfEngine>>
type Dependencies = {
  engine: () => Promise<Engine>
  bytes: typeof loadOwnedPdfBytes
  fileId: typeof readOwnedBookFileId
  owner: typeof userBookOwner
  cache: typeof cacheOwnedPdfScan
}
const defaults: Dependencies = { engine: loadPdfEngine, bytes: loadOwnedPdfBytes, fileId: readOwnedBookFileId, owner: userBookOwner, cache: cacheOwnedPdfScan }
export async function discoverOriginalPdfHeadings(hex: string, owner: string, options: {
  signal: AbortSignal; fileName: string; dependencies?: Partial<Dependencies>
}): Promise<PdfOriginalScanOutline | null> {
  const deps = { ...defaults, ...options.dependencies }
  const live = () => !options.signal.aborted && deps.owner() === owner
  let pdf: Awaited<ReturnType<Engine['pdfjs']['getDocument']>['promise']> | null = null
  try {
    if (!live()) return null
    let fileId = await deps.fileId(hex, owner)
    if (!live()) return null
    let bytes = await deps.bytes(hex, owner)
    if (!bytes || !live()) return null
    const loadedId = await deps.fileId(hex, owner)
    // A first cloud download may create the local record. Re-read its bytes
    // under that identity; never label bytes from an earlier generation with it.
    if (loadedId !== fileId) {
      fileId = loadedId
      bytes = await deps.bytes(hex, owner)
      if (!bytes || !live() || await deps.fileId(hex, owner) !== fileId) return null
    }
    if (!live()) return null
    const engine = await deps.engine()
    if (!live()) return null
    pdf = await engine.pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)), isEvalSupported: false, verbosity: 0 }).promise
    if (!live()) return null
    const scan = await engine.scan.scan(pdf, { fileName: options.fileName, live })
    if (!live() || !validScan(scan, pdf.numPages) || await deps.fileId(hex, owner) !== fileId) return null
    // Cache failures never prevent the already open pages acquiring their headings.
    await deps.cache(hex, owner, scan, fileId).catch(() => {})
    return live() && await deps.fileId(hex, owner) === fileId ? { entries: scan.entries, nav: scan.nav, pages: scan.pages } : null
  } catch { return null }
  finally { await pdf?.destroy().catch(() => {}) }
}
function validScan(scan: PdfScan | null, pages: number): scan is PdfScan {
  return !!scan && scan.pages === pages && ['outline', 'contents', 'headings', 'pages'].includes(scan.nav)
    && Array.isArray(scan.entries) && scan.entries.every(entry => typeof entry.id === 'string' && !!entry.id && entry.id.length <= 120
      && typeof entry.label === 'string' && !!entry.label.trim() && entry.label.length <= 240
      && Number.isInteger(entry.page) && entry.page >= 1 && entry.page <= pages)
}
