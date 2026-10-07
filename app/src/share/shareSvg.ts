/**
 * Draw a composed share page (shareLayout.ts) as SVG for resvg. Colours are
 * the live reader's, as measured on the page: Paper (lab.css `.lab`), Book
 * (`.lab.is-book-theme`), Night (`.lab.is-night`) and e-ink
 * (public/lab/display-profile.css). The highlight is the reader's gold
 * highlight as it is painted on that page (`--highlight-gold` under chrome v2:
 * #dcca98 on Paper, Book and e-ink, #5c4a2e at Night, full opacity), so the
 * card reads as a piece of the page.
 */

import type { FontMetrics } from './fontMetrics'
import { SHARE_TAGLINE, SUPERSCRIPT_RISE, SUPERSCRIPT_SCALE, superscriptRuns, type ShareFonts, type ShareLook, type SharePage } from './shareLayout'

export interface SharePalette {
  paper: string
  ink: string
  muted: string
  faint: string
  /** Surrounding text, greyed. */
  context: string
  highlight: string
  edge: string
  shadow: string
  fold: string
}

export const SHARE_PALETTES: Record<ShareLook, SharePalette> = {
  paper: { paper: '#ece7db', ink: '#0b0b0b', muted: '#6a6256', faint: '#8b8275', context: '#a39a8c', highlight: '#dcca98', edge: 'rgba(60,45,25,0.10)', shadow: 'rgba(60,45,25,0.10)', fold: '60,45,25' },
  book: { paper: '#e7dcc7', ink: '#201a13', muted: '#675b4b', faint: '#796c59', context: '#a3957f', highlight: '#dcca98', edge: 'rgba(60,45,25,0.12)', shadow: 'rgba(60,45,25,0.10)', fold: '60,45,25' },
  night: { paper: '#171411', ink: '#bdb3a7', muted: '#8f857a', faint: '#776e65', context: '#5f574e', highlight: '#5c4a2e', edge: 'rgba(255,240,220,0.08)', shadow: 'rgba(0,0,0,0.35)', fold: '0,0,0' },
  eink: { paper: '#ffffff', ink: '#111111', muted: '#444444', faint: '#555555', context: '#9a9a9a', highlight: '#dcca98', edge: 'rgba(0,0,0,0.25)', shadow: 'rgba(0,0,0,0)', fold: '0,0,0' },
}

const FAMILY = 'EB Garamond'

function esc(text: string): string {
  return text.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}

function n(value: number): string {
  return (Math.round(value * 10) / 10).toString()
}

function textWidth(font: FontMetrics, text: string, size: number): number {
  let units = 0
  for (const char of text) units += font.advance(char.codePointAt(0) ?? 32)
  return (units / font.unitsPerEm) * size
}

/** A word's text: superscript digits become small raised regular digits. */
function wordText(text: string, baseline: number, size: number): string {
  const runs = superscriptRuns(text)
  if (runs.length === 1 && !runs[0].sup) return esc(text)
  const raised = n(baseline - size * SUPERSCRIPT_RISE)
  return runs.map(run => run.sup
    ? `<tspan y="${raised}" font-size="${n(size * SUPERSCRIPT_SCALE)}">${esc(run.text)}</tspan>`
    : `<tspan y="${n(baseline)}">${esc(run.text)}</tspan>`).join('')
}

function italicRun(x: number, baseline: number, size: number, fill: string, text: string): string {
  return `<text x="${n(x)}" y="${n(baseline)}" font-family="${FAMILY}" font-style="italic" font-size="${n(size)}" fill="${fill}">${esc(text)}</text>`
}

export function renderShareSvg(page: SharePage, fonts: ShareFonts): string {
  const palette = SHARE_PALETTES[page.options.look]
  const { frame, layout } = page
  const { width, height } = frame.canvas
  const ascent = fonts.regular.ascent / fonts.regular.unitsPerEm
  const descent = fonts.regular.descent / fonts.regular.unitsPerEm
  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`)
  parts.push(`<rect width="${width}" height="${height}" fill="${palette.paper}"/>`)

  if (frame.page) {
    const pg = frame.page
    const blur = width / 100 * 0.8
    parts.push(`<defs><filter id="s" x="-5%" y="-5%" width="110%" height="115%"><feGaussianBlur stdDeviation="${n(blur)}"/></filter>`)
    if (page.mode === 'spread') parts.push(`<linearGradient id="f" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="rgb(${palette.fold})" stop-opacity="0"/><stop offset="0.45" stop-color="rgb(${palette.fold})" stop-opacity="0.07"/><stop offset="0.5" stop-color="rgb(${palette.fold})" stop-opacity="0.11"/><stop offset="0.55" stop-color="rgb(${palette.fold})" stop-opacity="0.07"/><stop offset="1" stop-color="rgb(${palette.fold})" stop-opacity="0"/></linearGradient>`)
    parts.push('</defs>')
    parts.push(`<rect x="${n(pg.x)}" y="${n(pg.y + width / 100 * 0.6)}" width="${n(pg.width)}" height="${n(pg.height)}" fill="${palette.shadow}" filter="url(#s)"/>`)
    parts.push(`<rect x="${n(pg.x)}" y="${n(pg.y)}" width="${n(pg.width)}" height="${n(pg.height)}" fill="${palette.paper}" stroke="${palette.edge}" stroke-width="1"/>`)
    if (page.mode === 'spread') {
      const foldWidth = width / 100 * 3
      parts.push(`<rect x="${n(pg.x + pg.width / 2 - foldWidth / 2)}" y="${n(pg.y)}" width="${n(foldWidth)}" height="${n(pg.height)}" fill="url(#f)"/>`)
    }
  }

  // Header: book · chapter, passive muted italic.
  const header = frame.header
  const headerBaseline = frame.padding.top + (header.boxHeight - (ascent + descent) * header.size) / 2 + ascent * header.size
  const title = page.content.bookTitle
  const chapter = page.content.chapterLabel
  const dotGap = header.size * 0.5
  const titleWidth = textWidth(fonts.italic, title, header.size)
  const dotWidth = textWidth(fonts.italic, '·', header.size)
  const chapterWidth = chapter ? textWidth(fonts.italic, chapter, header.size) : 0
  const headerWidth = titleWidth + (chapter ? dotGap * 2 + dotWidth + chapterWidth : 0)
  let hx = header.align === 'center' ? (width - headerWidth) / 2 : frame.padding.side
  parts.push(italicRun(hx, headerBaseline, header.size, palette.muted, title))
  if (chapter) {
    hx += titleWidth + dotGap
    parts.push(italicRun(hx, headerBaseline, header.size, palette.faint, '·'))
    hx += dotWidth + dotGap
    parts.push(italicRun(hx, headerBaseline, header.size, palette.muted, chapter))
  }

  // Body.
  const size = layout.fontSize
  const halfLeading = (layout.lineHeight - (ascent + descent) * size) / 2
  const pad = 0.02 * size
  for (const line of layout.lines) {
    const top = frame.text.y + page.offsetY + line.top
    const baseline = top + halfLeading + ascent * size
    // Highlight background: one run per stretch of consecutive highlighted words.
    let runStart = -1
    for (let i = 0; i <= line.words.length; i++) {
      const word = line.words[i]
      if (word?.hl && runStart < 0) runStart = i
      if ((!word || !word.hl) && runStart >= 0) {
        const first = line.words[runStart]
        const last = line.words[i - 1]
        const x = frame.text.x + first.x
        parts.push(`<rect x="${n(x)}" y="${n(top + halfLeading - pad)}" width="${n(last.x + last.width - first.x)}" height="${n((ascent + descent) * size + 2 * pad)}" fill="${palette.highlight}"/>`)
        runStart = -1
      }
    }
    for (const word of line.words) {
      const weight = word.style === 'semibold' ? ' font-weight="600"' : ''
      const style = word.style === 'italic' ? ' font-style="italic"' : ''
      const fill = word.hl ? palette.ink : palette.context
      parts.push(`<text x="${n(frame.text.x + word.x)}" y="${n(baseline)}" font-family="${FAMILY}" font-size="${n(size)}"${weight}${style} fill="${fill}">${wordText(word.text, baseline, size)}</text>`)
    }
  }

  // Desktop page numbers.
  if (frame.page && page.pageNumbers.length) {
    const nums = frame.page.numbers
    const baseline = frame.page.y + frame.page.height - frame.page.padBottom - nums.boxHeight + (nums.boxHeight - (ascent + descent) * nums.size) / 2 + ascent * nums.size
    const columns = page.pageNumbers.length
    page.pageNumbers.forEach((value, index) => {
      const label = String(value)
      const w = textWidth(fonts.regular, label, nums.size)
      // justify-content: space-around across the page
      const slot = frame.page!.width / columns
      const cx = frame.page!.x + slot * index + slot / 2
      parts.push(`<text x="${n(cx - w / 2)}" y="${n(baseline)}" font-family="${FAMILY}" font-size="${n(nums.size)}" fill="${palette.faint}">${esc(label)}</text>`)
    })
  }

  // Footer: tagline (optional) and the edition credit (always), muted italic.
  const footer = frame.footer
  const footerTop = height - frame.padding.bottom - footer.boxHeight
  const footerBaseline = footerTop + (footer.boxHeight - (ascent + descent) * footer.size) / 2 + ascent * footer.size
  const creditSize = footer.size * 0.78
  const credit = page.content.credit
  const tagline = page.options.tagline ? SHARE_TAGLINE : ''
  const taglineWidth = tagline ? textWidth(fonts.italic, tagline, footer.size) : 0
  const creditWidth = credit ? textWidth(fonts.italic, credit, creditSize) : 0
  const between = tagline && credit ? footer.size * 0.9 : 0
  let fx = footer.align === 'left' ? frame.padding.side : (width - (taglineWidth + between + creditWidth)) / 2
  if (tagline) { parts.push(italicRun(fx, footerBaseline, footer.size, palette.muted, tagline)); fx += taglineWidth + between }
  if (credit) parts.push(italicRun(fx, footerBaseline, creditSize, palette.faint, credit))

  parts.push('</svg>')
  return parts.join('')
}
