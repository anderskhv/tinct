/**
 * The reading card (Your reading → Share): the reader's own hours, drawn in
 * the library's look with the highlight-share renderer (EB Garamond, resvg).
 * Rendered on request from the ledger and never stored; it names no one.
 */
import type { FontMetrics } from '../../share/fontMetrics'
import type { ShareFonts } from '../../share/shareLayout'
import { factsLine, formatDayMonth, formatDuration, hoursMinutes, type ReadingTimeStats } from '../../readingTime/model'

type Assets = { fetch: (request: Request) => Promise<Response> }

export const READING_CARD_SIZE = { width: 1080, height: 1350 } as const

const BG = '#111610'
const CREAM = '#eee7d0'
const MUTED = '#b8bea9'
const GOLD = '#c9b98a'
const LINE = 'rgba(238,231,208,0.2)'
const FAMILY = 'EB Garamond'

function esc(text: string): string {
  return text.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}

function width(font: FontMetrics | undefined, text: string, size: number): number {
  if (!font) return text.length * size * 0.5
  let units = 0
  for (const char of text) units += font.advance(char.codePointAt(0) ?? 32)
  return (units / font.unitsPerEm) * size
}

/** The card as SVG. `fonts` measures the large figure so its units sit beside it. */
export function readingCardSvg(stats: ReadingTimeStats, fonts?: ShareFonts): string {
  const { width: W, height: H } = READING_CARD_SIZE
  const left = 96
  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`)
  parts.push(`<rect width="${W}" height="${H}" fill="${BG}"/>`)
  parts.push(`<rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="18" fill="none" stroke="${LINE}" stroke-width="2"/>`)
  parts.push(`<text x="${left}" y="170" font-family="${FAMILY}" font-size="64" letter-spacing="-2" fill="${CREAM}">tinct</text>`)

  const since = stats.firstDay ? `Reading time since ${formatDayMonth(stats.firstDay)}` : 'Reading time'
  parts.push(`<text x="${left}" y="520" font-family="${FAMILY}" font-style="italic" font-size="42" fill="${MUTED}">${esc(since)}</text>`)

  // "41h 20m": large figures, small units, as on the page.
  const { hours, minutes } = hoursMinutes(stats.totalSeconds)
  const big = 230, small = 96
  let x = left
  const run = (text: string, size: number, fill: string) => {
    parts.push(`<text x="${x.toFixed(1)}" y="760" font-family="${FAMILY}" font-size="${size}" fill="${fill}">${esc(text)}</text>`)
    x += width(fonts?.regular, text, size)
  }
  run(String(hours), big, CREAM)
  run('h', small, CREAM)
  x += 36
  run(String(minutes), big, CREAM)
  run('m', small, CREAM)

  parts.push(`<text x="${left}" y="850" font-family="${FAMILY}" font-size="48" fill="${CREAM}">reading and listening.</text>`)
  const facts = [stats.last7Seconds >= 60 ? `${formatDuration(stats.last7Seconds)} in the last 7 days` : '', factsLine({ ...stats, firstDay: null })]
    .filter(Boolean).join(' · ')
  if (facts) parts.push(`<text x="${left}" y="920" font-family="${FAMILY}" font-style="italic" font-size="40" fill="${MUTED}">${esc(facts)}</text>`)

  // The last 7 days as bars, today brightest.
  const most = Math.max(...stats.last7.map(item => item.seconds), 1)
  const barWidth = 92, gap = 26, base = 1180, tall = 150
  stats.last7.forEach((item, index) => {
    const h = item.seconds > 0 ? Math.max(6, Math.round((item.seconds / most) * tall)) : 3
    const bx = left + index * (barWidth + gap)
    parts.push(`<rect x="${bx}" y="${base - h}" width="${barWidth}" height="${h}" rx="3" fill="${index === 6 ? CREAM : GOLD}" fill-opacity="${index === 6 ? 1 : 0.55}"/>`)
  })
  parts.push(`<text x="${left}" y="1250" font-family="${FAMILY}" font-style="italic" font-size="36" fill="${MUTED}">Read free at tinct.app</text>`)
  parts.push('</svg>')
  return parts.join('')
}

export async function renderReadingCardPng(assets: Assets, origin: string, stats: ReadingTimeStats): Promise<Uint8Array> {
  const { renderSvgPng } = await import('./shareRender')
  return renderSvgPng(assets, origin, fonts => readingCardSvg(stats, fonts))
}

/**
 * The finished-book card (social ship 3): "Finished Frankenstein · 6 h 20 m",
 * offered at the end of a book. The book's painting on top, the reader's
 * hours in that book large, and the link it carries (the reader's public
 * profile, or the book). Drawn on request and never stored.
 */
export interface FinishedCardSvgInput { title: string; author: string; duration: string | null; link: string; cover: string | null }

function wrapWords(text: string, max: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && (line + ' ' + word).length > max) { lines.push(line); line = word } else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines
}

export function finishedCardSvg(input: FinishedCardSvgInput, fonts?: ShareFonts): string {
  const { width: W, height: H } = READING_CARD_SIZE
  const left = 96
  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`)
  parts.push(`<defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG}" stop-opacity="0.15"/><stop offset="0.55" stop-color="${BG}" stop-opacity="0.35"/><stop offset="0.82" stop-color="${BG}" stop-opacity="1"/></linearGradient></defs>`)
  parts.push(`<rect width="${W}" height="${H}" fill="${BG}"/>`)
  if (input.cover) parts.push(`<image x="0" y="0" width="${W}" height="${Math.round(H * 0.78)}" preserveAspectRatio="xMidYMid slice" href="${esc(input.cover)}" xlink:href="${esc(input.cover)}"/>`)
  parts.push(`<rect width="${W}" height="${H}" fill="url(#fade)"/>`)
  parts.push(`<text x="${left}" y="150" font-family="${FAMILY}" font-size="58" letter-spacing="-2" fill="${CREAM}">tinct</text>`)

  const titleLines = wrapWords(`Finished ${input.title}`, 30).slice(0, 2)
  let y = input.duration ? 760 : 900
  for (const line of titleLines) {
    parts.push(`<text x="${left}" y="${y}" font-family="${FAMILY}" font-style="italic" font-size="50" fill="${GOLD}">${esc(line)}</text>`)
    y += 62
  }
  if (input.duration) {
    // "6 h 20 m": figures large, units small, as on Your reading.
    let x = left
    const baseline = y + 170
    for (const token of input.duration.split(' ')) {
      const unit = !/^\d+$/.test(token)
      const size = unit ? 92 : 210
      parts.push(`<text x="${x.toFixed(1)}" y="${baseline}" font-family="${FAMILY}" font-size="${size}" fill="${CREAM}">${esc(token)}</text>`)
      x += width(fonts?.regular, token, size) + (unit ? 34 : 6)
    }
    y = baseline + 80
  }
  if (input.author) parts.push(`<text x="${left}" y="${y}" font-family="${FAMILY}" font-size="46" fill="${CREAM}">${esc(`with ${input.author}.`)}</text>`)
  parts.push(`<line x1="${left}" y1="1196" x2="${W - left}" y2="1196" stroke="${LINE}" stroke-width="2"/>`)
  parts.push(`<text x="${left}" y="1262" font-family="${FAMILY}" font-size="38" fill="${MUTED}">${esc(input.link.replace(/^https:\/\//, ''))}</text>`)
  parts.push(`<text x="${W - left}" y="1262" text-anchor="end" font-family="${FAMILY}" font-style="italic" font-size="36" fill="${MUTED}">Read free at tinct.app</text>`)
  parts.push('</svg>')
  return parts.join('')
}

export async function renderFinishedCardPng(assets: Assets, origin: string, input: FinishedCardSvgInput): Promise<Uint8Array> {
  const { renderSvgPng } = await import('./shareRender')
  return renderSvgPng(assets, origin, fonts => finishedCardSvg(input, fonts))
}
