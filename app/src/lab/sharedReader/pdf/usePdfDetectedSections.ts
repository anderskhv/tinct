import { useEffect, useRef, useState } from 'react'
import type { loadPdfEngine } from '../../userBook/pdfEdition'
import { detectPdfDocumentSections, PDF_SECTION_PAGES, type PdfDetectedSection } from './pdfSectionHeadings'

export type PdfSectionDetector = (bytes: ArrayBuffer, live: () => boolean) => Promise<PdfDetectedSection[] | null>

/** Opens its own pdf.js copy of the file (the engine the Original reader loads), reads its text rows and finds its sections. */
export const pdfSectionDetector = (loadEngine: typeof loadPdfEngine): PdfSectionDetector => async (bytes, live) => {
  const engine = await loadEngine()
  if (!live()) return null
  const pdf = await engine.pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)), isEvalSupported: false, verbosity: 0 }).promise as unknown as Parameters<typeof detectPdfDocumentSections>[0] & { destroy: () => Promise<void>; getOutline?: () => Promise<unknown[] | null> }
  try {
    // Bookmarks name the chapters already (pdfOriginalOutline); detection is for files without them.
    if (!live() || pdf.numPages > PDF_SECTION_PAGES || ((await pdf.getOutline?.().catch(() => null)) ?? []).length) return null
    return await detectPdfDocumentSections(pdf, engine.scan as unknown as Parameters<typeof detectPdfDocumentSections>[1], live)
  } finally { await pdf.destroy().catch(() => {}) }
}

/**
 * The detected sections of the open PDF, once its page count is known and the first pages have had their turn.
 * Never moves the reader: the result only names units (pdfOriginalUnits) and their jumps.
 */
export function usePdfDetectedSections(bytes: () => Promise<ArrayBuffer | null>, pages: number, detect: PdfSectionDetector | null): PdfDetectedSection[] | null {
  const [sections, setSections] = useState<PdfDetectedSection[] | null>(null)
  const source = useRef(bytes)
  source.current = bytes
  useEffect(() => {
    setSections(null)
    if (!detect || !pages || pages > PDF_SECTION_PAGES) return
    let live = true
    const timer = setTimeout(() => {
      void source.current().then(data => data && live ? detect(data, () => live) : null)
        .then(found => { if (live) setSections(found) }).catch(() => {})
    }, 400)
    return () => { live = false; clearTimeout(timer) }
  }, [pages, detect])
  return sections
}
