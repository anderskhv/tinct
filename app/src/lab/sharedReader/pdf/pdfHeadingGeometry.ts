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

/** Keep heading actions out of neighbouring columns. A floating, opaque toolbar
 * above the heading is the fallback when the printed page has no empty space. */
export function placePdfHeadingActions(selection: PdfOriginalSelection, width: number, height: number,
  toolbar: { width: number; height: number }, ink: Array<{ left: number; top: number; right: number; bottom: number }>) {
  const last = selection.rects.at(-1)!, first = selection.rects[0]
  const clampX = (x: number) => Math.max(8, Math.min(width - toolbar.width - 8, x))
  const candidates = [
    { left: (last[1] + last[3]) * width + 12, top: (last[2] + last[4] / 2) * height - toolbar.height / 2 },
    { left: clampX(first[1] * width), top: Math.min(...selection.rects.map(rect => rect[2])) * height - toolbar.height - 6 },
  ]
  const clear = (box: { left: number; top: number }) => box.left >= 8 && box.left + toolbar.width <= width - 8 && box.top >= 0
    && !ink.some(rect => rect.left < box.left + toolbar.width + 4 && rect.right > box.left - 4
      && rect.top < box.top + toolbar.height + 4 && rect.bottom > box.top - 4)
  const chosen = candidates.find(clear) ?? candidates[1]
  return { left: clampX(chosen.left), top: Math.max(0, chosen.top) }
}
