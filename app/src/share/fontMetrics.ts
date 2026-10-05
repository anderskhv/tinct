/**
 * Advance widths from a TrueType/OpenType font, enough to lay out the share
 * image's justified text before resvg draws it. Reads `head`, `hhea`, `hmtx`
 * and `cmap` (formats 4 and 12). Kerning and ligatures are left to the
 * rasteriser; they only ever tighten a word, so a measured line never
 * overflows its box.
 */

export interface FontMetrics {
  unitsPerEm: number
  ascent: number
  descent: number
  /** Advance width in font units; missing glyphs fall back to the font's average. */
  advance(codePoint: number): number
}

function tableOffsets(view: DataView): Map<string, number> {
  const tables = new Map<string, number>()
  const count = view.getUint16(4)
  for (let i = 0; i < count; i++) {
    const record = 12 + i * 16
    const tag = String.fromCharCode(view.getUint8(record), view.getUint8(record + 1), view.getUint8(record + 2), view.getUint8(record + 3))
    tables.set(tag, view.getUint32(record + 8))
  }
  return tables
}

function readCmap(view: DataView, cmapOffset: number): Map<number, number> {
  const map = new Map<number, number>()
  const count = view.getUint16(cmapOffset + 2)
  let best = -1
  let bestFormat = 0
  for (let i = 0; i < count; i++) {
    const record = cmapOffset + 4 + i * 8
    const platform = view.getUint16(record)
    const encoding = view.getUint16(record + 2)
    const offset = cmapOffset + view.getUint32(record + 4)
    const format = view.getUint16(offset)
    const unicode = platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10))
    if (!unicode) continue
    if (format === 12 && bestFormat !== 12) { best = offset; bestFormat = 12 }
    else if (format === 4 && bestFormat === 0) { best = offset; bestFormat = 4 }
  }
  if (best < 0) return map
  if (bestFormat === 12) {
    const groups = view.getUint32(best + 12)
    for (let g = 0; g < groups; g++) {
      const at = best + 16 + g * 12
      const start = view.getUint32(at)
      const end = view.getUint32(at + 4)
      const glyph = view.getUint32(at + 8)
      for (let c = start; c <= end && c - start < 0x10000; c++) map.set(c, glyph + (c - start))
    }
    return map
  }
  const segX2 = view.getUint16(best + 6)
  const ends = best + 14
  const starts = ends + segX2 + 2
  const deltas = starts + segX2
  const rangeOffsets = deltas + segX2
  for (let s = 0; s < segX2 / 2; s++) {
    const end = view.getUint16(ends + s * 2)
    const start = view.getUint16(starts + s * 2)
    const delta = view.getInt16(deltas + s * 2)
    const rangeOffset = view.getUint16(rangeOffsets + s * 2)
    for (let c = start; c <= end && c !== 0xffff; c++) {
      let glyph: number
      if (rangeOffset === 0) glyph = (c + delta) & 0xffff
      else {
        const at = rangeOffsets + s * 2 + rangeOffset + (c - start) * 2
        glyph = view.getUint16(at)
        if (glyph !== 0) glyph = (glyph + delta) & 0xffff
      }
      if (glyph) map.set(c, glyph)
    }
  }
  return map
}

export function parseFontMetrics(bytes: ArrayBuffer | Uint8Array): FontMetrics {
  const buffer = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  const tables = tableOffsets(view)
  const head = tables.get('head')
  const hhea = tables.get('hhea')
  const hmtx = tables.get('hmtx')
  const cmap = tables.get('cmap')
  if (head === undefined || hhea === undefined || hmtx === undefined || cmap === undefined) throw new Error('font is missing a required table')
  const unitsPerEm = view.getUint16(head + 18)
  const ascent = view.getInt16(hhea + 4)
  const descent = -view.getInt16(hhea + 6)
  const longMetrics = view.getUint16(hhea + 34)
  const glyphs = readCmap(view, cmap)
  const advances: number[] = []
  for (let i = 0; i < longMetrics; i++) advances.push(view.getUint16(hmtx + i * 4))
  const lastAdvance = advances[advances.length - 1] ?? unitsPerEm / 2
  const average = advances.length ? advances.reduce((sum, value) => sum + value, 0) / advances.length : unitsPerEm / 2
  const cache = new Map<number, number>()
  return {
    unitsPerEm,
    ascent,
    descent,
    advance(codePoint) {
      const known = cache.get(codePoint)
      if (known !== undefined) return known
      const glyph = glyphs.get(codePoint)
      const width = glyph === undefined ? average : glyph < advances.length ? advances[glyph] : lastAdvance
      cache.set(codePoint, width)
      return width
    },
  }
}

/** Width of `text` in pixels at `size`. */
export function measureText(font: FontMetrics, text: string, size: number): number {
  let units = 0
  for (const char of text) units += font.advance(char.codePointAt(0) ?? 32)
  return (units / font.unitsPerEm) * size
}
