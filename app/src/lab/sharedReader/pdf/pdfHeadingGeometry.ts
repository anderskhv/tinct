import type { PdfOriginalSelection } from './PdfOriginalSurface'

export type PdfHeadingAction = { id: 'primer' | 'catchup' | 'recap' | 'quiz' | 'note'; label: string }
export type PdfHeadingActions = { key: string; title: string; page: number; actions: PdfHeadingAction[]; onAction: (id: PdfHeadingAction['id'], source: PdfOriginalSelection) => void }
const compact = (text: string) => text.toLocaleLowerCase().replace(/^\s*(?:(?:\d+|[ivxlcdm]+)[.):–—-]?\s+)?/iu, '').replace(/[^\p{L}\p{N}]+/gu, '')
/** Match the real heading's words, including titles split across pdf.js glyph runs. */
export function findPdfHeading(layer: HTMLElement, heading: PdfHeadingActions): PdfOriginalSelection | null {
  const wanted = compact(heading.title)
  if (wanted.length < 2) return null
  const spans = [...layer.querySelectorAll<HTMLElement>('span')].filter(span => span.textContent?.trim() && !span.closest('[data-pdf-furniture]'))
  const bounds = layer.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return null
  for (let start = 0; start < spans.length; start++) {
    let text = ''
    const chosen: HTMLElement[] = []
    for (let end = start; end < Math.min(spans.length, start + 12); end++) {
      const span = spans[end], box = span.getBoundingClientRect()
      if (!box.width || !box.height) continue
      chosen.push(span); text += ' ' + span.textContent
      const found = compact(text)
      if (found !== wanted) { if (found.length > wanted.length + 20) break; continue }
      const rects = chosen.map(span => {
        const box = span.getBoundingClientRect()
        return [heading.page, (box.left - bounds.left) / bounds.width, (box.top - bounds.top) / bounds.height, box.width / bounds.width, box.height / bounds.height] as [number, number, number, number, number]
      })
      for (const span of chosen) { span.dataset.pdfHeading = heading.key; span.tabIndex = 0; span.setAttribute('aria-label', `${heading.title} actions`) }
      return { page: heading.page, text: heading.title, rects }
    }
  }
  return null
}
