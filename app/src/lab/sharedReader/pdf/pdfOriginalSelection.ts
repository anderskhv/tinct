import { projectPdfSelection, type PdfOriginalPage, type PdfOriginalSelection, type PdfSelectionRect } from './PdfOriginalSurface'

type TextItem = Awaited<ReturnType<PdfOriginalPage['getTextContent']>>['items'][number]
const WORD = /[\p{L}\p{M}\p{N}'’]/u
const element = (node: Node | null) => node?.nodeType === Node.ELEMENT_NODE ? node as Element : node?.parentElement

/** Running heads/feet are short, isolated edge rows, never an ordinary body's first or last line. */
export function pdfFurnitureIndexes(items: readonly TextItem[], view: ReturnType<PdfOriginalPage['getViewport']>): Set<number> {
  const rows: Array<{ base: number; size: number; indexes: number[]; text: string }> = []
  items.forEach((item, index) => {
    if (!item.str.trim() || item.transform.length < 6) return
    const [a, b, c, d, e, f] = view.transform, [ta, tb, tc, td, x, y] = item.transform
    const size = Math.hypot(a * tc + c * td, b * tc + d * td)
    if (size < .5 || Math.abs(b * ta + d * tb) > size * .001) return
    const base = b * x + d * y + f
    const row = rows.find(row => Math.abs(row.base - base) < Math.max(2, size * .3))
    if (row) { row.indexes.push(index); row.size = Math.max(row.size, size); row.text += ' ' + item.str }
    else rows.push({ base, size, indexes: [index], text: item.str })
  })
  rows.sort((a, b) => a.base - b.base)
  const result = new Set<number>()
  if (rows.length < 4) return result
  const gaps = rows.slice(1).map((row, index) => row.base - rows[index].base).filter(gap => gap > 0).sort((a, b) => a - b)
  const lead = gaps[Math.floor(gaps.length / 2)] || rows[0].size * 1.3
  const mark = (row: typeof rows[number]) => row.indexes.forEach(index => result.add(index))
  const first = rows[0], last = rows[rows.length - 1]
  const sizes = rows.map(row => row.size).sort((a, b) => a - b), bodySize = sizes[Math.floor(sizes.length / 2)]
  if (first.size <= bodySize * 1.05 && first.base < view.height * .125 && rows[1].base - first.base > lead * 1.7 && first.text.trim().length <= 90) mark(first)
  if (last.size <= bodySize * 1.05 && last.base > view.height * .875 && last.base - rows[rows.length - 2].base > lead * 1.7 && last.text.trim().length <= 90) mark(last)
  for (const row of rows) if ((row.base < view.height * .15 || row.base > view.height * .85)
    && /^(?:(?:page|p\.|pg\.?)\s*)?(?:\d{1,4}|[ivxlcdm]{1,7})$/i.test(row.text.trim())) mark(row)
  return result
}

/** Annotate pdf.js spans without changing their own glyph or layout geometry. */
export function markPdfTextFurniture(layer: HTMLElement, items: readonly TextItem[], view: ReturnType<PdfOriginalPage['getViewport']>): void {
  const furniture = pdfFurnitureIndexes(items, view)
  let cursor = 0
  for (const span of layer.querySelectorAll<HTMLElement>('span')) {
    if (!span.textContent?.trim()) continue
    const index = items.findIndex((item, index) => index >= cursor && item.str === span.textContent)
    if (index < 0) continue
    cursor = index + 1
    span.dataset.pdfItem = String(index)
    if (furniture.has(index)) span.dataset.pdfFurniture = 'true'
    else delete span.dataset.pdfFurniture
    const transform = items[index].transform
    if (Math.abs(view.transform[1] * transform[0] + view.transform[3] * transform[1]) > .01 * Math.hypot(view.transform[0] * transform[0] + view.transform[2] * transform[1], view.transform[1] * transform[0] + view.transform[3] * transform[1])) span.dataset.pdfSide = 'true'
  }
}

function edge(node: Node, offset: number, direction: -1 | 1): { node: Text; offset: number } | null {
  if (node.nodeType !== Node.TEXT_NODE) return null
  const layer = element(node)?.closest('.pdf-original__text')
  if (!layer) return null
  const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT), nodes: Text[] = []
  for (let text = walker.nextNode(); text; text = walker.nextNode()) if (!element(text)?.closest('[data-pdf-furniture]')) nodes.push(text as Text)
  let current = node as Text, index = nodes.indexOf(current)
  if (index < 0) return null
  const touches = (a: Text, b: Text) => {
    const aa = a.parentElement?.getBoundingClientRect(), bb = b.parentElement?.getBoundingClientRect()
    return !!aa && !!bb && Math.abs(aa.top - bb.top) < Math.max(aa.height, bb.height) * .6 && Math.abs(bb.left - aa.right) <= Math.max(2, aa.height * .15)
  }
  const before = offset ? current.data[offset - 1] : index && touches(nodes[index - 1], current) ? nodes[index - 1].data.at(-1) || '' : ''
  const after = offset < current.length ? current.data[offset] : index + 1 < nodes.length && touches(current, nodes[index + 1]) ? nodes[index + 1].data[0] : ''
  if (!WORD.test(before) || !WORD.test(after)) return null
  for (;;) {
    if (direction < 0) {
      if (offset > 0) { if (WORD.test(current.data[offset - 1])) { offset--; continue }; break }
      if (index && touches(nodes[index - 1], current) && WORD.test(nodes[index - 1].data.at(-1) || '')) { current = nodes[--index]; offset = current.length; continue }
    } else {
      if (offset < current.length) { if (WORD.test(current.data[offset])) { offset++; continue }; break }
      if (index + 1 < nodes.length && touches(current, nodes[index + 1]) && WORD.test(nodes[index + 1].data[0] || '')) { current = nodes[++index]; offset = 0; continue }
    }
    break
  }
  return { node: current, offset }
}

/** A deliberate native range becomes whole words with every box owned by its real source page. */
export function readPdfOriginalSelection(root: HTMLElement, selection: Selection | null, expandWords = true): PdfOriginalSelection | null {
  if (!selection?.rangeCount || selection.isCollapsed) return null
  const native = selection.getRangeAt(0)
  if (!root.contains(native.startContainer) || !root.contains(native.endContainer)
    || !element(native.startContainer)?.closest('.pdf-original__text') || !element(native.endContainer)?.closest('.pdf-original__text')) return null
  const range = native.cloneRange(), a = expandWords && edge(range.startContainer, range.startOffset, -1), b = expandWords && edge(range.endContainer, range.endOffset, 1)
  if (a) range.setStart(a.node, a.offset)
  if (b) range.setEnd(b.node, b.offset)
  if (a || b) { selection.removeAllRanges(); selection.addRange(range) }
  const startSide = element(range.startContainer)?.closest('[data-pdf-side]'), endSide = element(range.endContainer)?.closest('[data-pdf-side]')
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), rects: PdfSelectionRect[] = [], parts: string[] = [], pages = new Map<number, string[]>()
  const aspects = new Map<number, number>()
  let previous: { node: Text; last: number } | null = null
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!range.intersectsNode(node)) continue
    const span = element(node), layer = span?.closest<HTMLElement>('.pdf-original__text'), sheet = layer?.closest<HTMLElement>('.pdf-original__page')
    if (!layer || !sheet || span?.closest('[data-pdf-furniture]')) continue
    const side = span?.closest('[data-pdf-side]')
    if (side && side !== startSide && side !== endSide) continue
    const text = node as Text, from = node === range.startContainer ? range.startOffset : 0, to = node === range.endContainer ? range.endOffset : text.length
    if (to <= from || !text.data.slice(from, to).trim()) continue
    const fragment = document.createRange(); fragment.setStart(text, from); fragment.setEnd(text, to)
    const boxes = fragment.getClientRects?.() ?? []
    const bounds = layer.getBoundingClientRect(), pageNumber = Number(sheet.dataset.page)
    aspects.set(pageNumber, bounds.height / bounds.width)
    rects.push(...projectPdfSelection(pageNumber, bounds, boxes))
    const lastBox = previous?.node.parentElement?.getBoundingClientRect(), nextBox = span?.getBoundingClientRect()
    const joins = previous && lastBox && nextBox && previous.last === previous.node.length && from === 0
      && !/\s$/.test(previous.node.data) && !/^\s/.test(text.data) && Math.abs(lastBox.top - nextBox.top) < Math.max(lastBox.height, nextBox.height) * .6
      && Math.abs(nextBox.left - lastBox.right) < Math.max(2, lastBox.height * .15)
    parts.push((parts.length && !joins ? ' ' : '') + text.data.slice(from, to))
    const page = Number(sheet.dataset.page), pageParts = pages.get(page) ?? []
    pageParts.push((pageParts.length && !joins ? ' ' : '') + text.data.slice(from, to)); pages.set(page, pageParts)
    previous = { node: text, last: to }
  }
  const text = parts.join('').replace(/\s+/g, ' ').trim()
  return rects.length && text.length >= (expandWords ? 2 : 1) ? { page: rects[0][0], text, rects: pdfSelectionLineRects(rects, aspects), ...(pages.size > 1 ? { pages: [...pages].map(([n, parts]) => ({ n, text: parts.join('').replace(/\s+/g, ' ').trim() })) } : {}) } : null
}

/** Join word-sized PDF items on their own line, never across a column or page.
 * Work in page pixels: fractional x/y have different scales on a tall page. */
export function pdfSelectionLineRects(rects: PdfSelectionRect[], pageAspect = new Map<number, number>()): PdfSelectionRect[] {
  const lines: PdfSelectionRect[][] = []
  for (const rect of [...rects].sort((a, b) => a[0] - b[0] || a[2] - b[2] || a[1] - b[1])) {
    const line = lines.find(line => line[0][0] === rect[0] && Math.abs(line[0][2] + line[0][4] / 2 - rect[2] - rect[4] / 2) < Math.min(line[0][4], rect[4]) * .42)
    if (line) line.push(rect)
    else lines.push([rect])
  }
  return lines.flatMap(line => {
    const bars: PdfSelectionRect[] = []
    for (const rect of line.sort((a, b) => a[1] - b[1])) {
      const last = bars.at(-1), aspect = pageAspect.get(rect[0]) ?? 1
      if (last && rect[1] - last[1] - last[3] < Math.min(last[4], rect[4]) * aspect * 1.2) {
        last[3] = Math.max(last[1] + last[3], rect[1] + rect[3]) - last[1]
        const bottom = Math.max(last[2] + last[4], rect[2] + rect[4])
        last[2] = Math.min(last[2], rect[2])
        last[4] = bottom - last[2]
      } else bars.push([...rect])
    }
    return bars
  })
}

/** Native ranges include absolutely positioned line breaks/page wrappers.
 * Paint only real glyph fragments, as the original PDF reader does. Native
 * selection still owns drag direction, handles, copying and word expansion. */
export function paintPdfOriginalSelection(root: HTMLElement): void {
  root.querySelectorAll('.pdf-original__selection').forEach(layer => layer.remove())
  const selection = readPdfOriginalSelection(root, window.getSelection(), false)
  if (!selection) return
  const sheets = new Map<number, HTMLElement>()
  root.querySelectorAll<HTMLElement>('.pdf-original__page').forEach(sheet => {
    sheets.set(Number(sheet.dataset.page), sheet)
  })
  for (const [page, x, y, width, height] of selection.rects) {
    const sheet = sheets.get(page)
    if (!sheet) continue
    let layer = sheet.querySelector<HTMLElement>('.pdf-original__selection')
    if (!layer) { layer = document.createElement('div'); layer.className = 'pdf-original__selection'; layer.setAttribute('aria-hidden', 'true'); sheet.append(layer) }
    const ink = document.createElement('i')
    Object.assign(ink.style, { left: `${x * 100}%`, top: `${y * 100}%`, width: `${width * 100}%`, height: `${height * 100}%` })
    layer.append(ink)
  }
}
